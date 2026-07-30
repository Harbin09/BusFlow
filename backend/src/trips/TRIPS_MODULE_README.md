# Trips Module - Trip Generation Workflow

## Overview

The Trips module implements the trip generation workflow for BUS FLOW. It orchestrates the creation of daily trips based on timetables, available resources, and rule engine validation.

## Architecture

```
TripsController (HTTP Layer)
    ↓ POST /trips/generate
TripsService (Data Access)
    ↓
TripGenerationService (Orchestration)
    ├─ Fetch operational data (Prisma)
    ├─ Build RuleContext objects
    ├─ Execute RuleEngine
    └─ Create Trip records if approved
```

## Components

### 1. TripsController
**File**: `controllers/trips.controller.ts`

HTTP endpoint for trip generation:
- **POST /trips/generate**: Generate trips for a given date
- Validates input (GenerateTripDto)
- Returns results with summary

**Request**:
```json
{
  "date": "2026-07-30"
}
```

**Response**:
```json
{
  "date": "2026-07-30",
  "results": [
    {
      "routeId": "route-1",
      "busId": "bus-1",
      "driverId": "driver-1",
      "departureTime": "2026-07-30T08:00:00Z",
      "approved": true,
      "tripId": "trip-123"
    }
  ],
  "summary": {
    "total": 1,
    "approved": 1,
    "rejected": 0
  }
}
```

### 2. TripGenerationService
**File**: `services/trip-generation.service.ts`

Core orchestration service that:
1. Validates input date
2. Fetches operational data from database:
   - Timetables for the date
   - Routes
   - Students (with daily PRESENT status)
   - Active buses
   - Available drivers (not already assigned)
3. Builds RuleContext for each potential trip
4. Executes RuleEngine for validation
5. Creates Trip records if approved
6. Returns comprehensive results

**Key Methods**:
- `generateTripsForDate(date: Date)`: Main workflow
- `buildRuleContext()`: Transform DB data → RuleContext
- `createTripRecord()`: Persist approved trips

**Features**:
- Skips routes with no students
- Prevents duplicate trips
- Handles rule engine rejections gracefully
- Comprehensive logging
- Error handling and recovery

### 3. TripsService
**File**: `services/trips.service.ts`

Database operations layer:
- **createTrip()**: Create single trip
- **createManyTrips()**: Batch creation
- **getTrip()**: Fetch by ID
- **getTripsForDate()**: Query trips on a date
- **getTripsForRouteAndDate()**: Query specific route
- **updateTripStatus()**: Update trip state
- **tripExists()**: Check for duplicates

### 4. DTOs & Models

**GenerateTripDto** (`dto/generate-trip.dto.ts`):
- Validates ISO 8601 date string
- Input validation with class-validator

## Workflow

### Step 1: Request Arrives
```
POST /trips/generate
{
  "date": "2026-07-30"
}
```

### Step 2: Validation
- TripsController validates DTO
- Date format check
- Date validity check

### Step 3: Fetch Data
TripGenerationService queries:
```sql
-- Timetables for the date
SELECT * FROM timetable WHERE date = '2026-07-30'

-- Students with PRESENT status
SELECT * FROM student 
WHERE id IN (
  SELECT studentId FROM student_daily_status 
  WHERE date = '2026-07-30' AND status = 'PRESENT'
)

-- Active buses
SELECT * FROM bus WHERE status = 'ACTIVE'

-- Available drivers
SELECT * FROM driver 
WHERE id NOT IN (
  SELECT driverId FROM trip WHERE date = '2026-07-30'
)
```

### Step 4: Build Context
For each timetable entry:
```typescript
const context = new RuleContext({
  date: '2026-07-30',
  routeId: 'route-1',
  busId: 'bus-1',
  busCapacity: 50,
  driverId: 'driver-1',
  departureTime: '2026-07-30T08:00:00Z',
  assignedStudentIds: ['student-1', 'student-2', ...],
  availableDriverIds: ['driver-1', 'driver-2', ...],
  timetableType: 'CLASS',
  isHoliday: false,
});
```

### Step 5: Execute RuleEngine
```
RuleEngine evaluates:
  1. TimetableEvaluator (priority 110)
     - Is it a holiday? → No
     - Is departure time valid? → Yes
  
  2. CapacityEvaluator (priority 100)
     - Students (3) ≤ Safe capacity (45)? → Yes
  
  3. DriverAvailabilityEvaluator (priority 90)
     - Is driver available? → Yes

Result: APPROVED ✓
```

### Step 6: Create Trip or Reject
**If Approved**:
```sql
INSERT INTO trip (id, routeId, busId, driverId, date, departureTime, status, generatedByRuleEngine)
VALUES ('trip-123', 'route-1', 'bus-1', 'driver-1', '2026-07-30', '2026-07-30T08:00:00Z', 'SCHEDULED', true)
```

**If Rejected**:
```typescript
{
  routeId: 'route-1',
  busId: 'bus-1',
  driverId: 'driver-1',
  departureTime: '2026-07-30T08:00:00Z',
  approved: false,
  reason: 'Bus capacity exceeded. 46 students assigned, safe capacity is 45',
  errorDetails: { ... }
}
```

## Database Independence

**Key Design**: Rule Engine stays database-independent

```typescript
// ❌ DON'T: Pass database connections to rules
const context = {
  prismaService: prisma,  // NO!
  // ...
};

// ✅ DO: Pre-fetch and pass data
const context = new RuleContext({
  assignedStudentIds: ['student-1', 'student-2'],  // Pre-fetched
  availableDriverIds: ['driver-1', 'driver-2'],   // Pre-fetched
  // ...
});

// Rule Engine only evaluates data, never queries DB
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid date | Return 400 Bad Request |
| Database error | Return 500 Internal Server Error |
| No timetables | Return empty results |
| No students for route | Skip route, continue |
| No buses available | Return rejection reason |
| No drivers available | Return rejection reason |
| Rule engine error | Log and return rejection |
| Trip already exists | Skip, don't create duplicate |

## Integration Example

### Setup (app.module.ts)
```typescript
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [TripsModule, RuleEngineModule, PrismaModule],
})
export class AppModule {}
```

### Usage
```typescript
// In your service:
async generateTripsForTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const results = await this.tripGenerationService.generateTripsForDate(tomorrow);
  
  const approved = results.filter(r => r.approved).length;
  console.log(`Generated ${approved} trips for tomorrow`);
}
```

### Scheduled Job (Future)
```typescript
// In a scheduled service:
@Cron('0 3 * * *')  // 3 AM daily
async generateTripsForNextDay() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const results = await this.tripGenerationService.generateTripsForDate(tomorrow);
  
  // Notify stakeholders
  await this.notificationService.notifyTripsGenerated(results);
}
```

## Testing

All components have comprehensive unit tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- trips.service.spec.ts
npm test -- trip-generation.service.spec.ts
npm test -- trips.controller.spec.ts

# Run with coverage
npm test -- --coverage trips
```

### Test Coverage

- ✅ Successful trip generation
- ✅ Rule engine approval flow
- ✅ Rule engine rejection flow
- ✅ Duplicate trip prevention
- ✅ Missing data handling
- ✅ Error scenarios
- ✅ Empty results
- ✅ Integration workflows

## Future Enhancements

### 1. Scheduling
```typescript
@Cron('0 3 * * *')
async generateTripsNightly() {
  const tomorrow = await this.getNextOperationalDay();
  await this.tripGenerationService.generateTripsForDate(tomorrow);
}
```

### 2. Student Trip Assignment
Create StudentTripAssignment records:
```typescript
// After trip is created
await prisma.studentTripAssignment.createMany({
  data: context.assignedStudentIds.map(studentId => ({
    tripId: trip.id,
    studentId,
    status: 'SCHEDULED',
  })),
});
```

### 3. Notifications
```typescript
// Notify users about generated trips
await this.notificationService.notifyTripsGenerated({
  tripCount: approved,
  date,
  routes: [...],
});
```

### 4. Analytics
```typescript
// Track generation metrics
await this.analyticsService.recordTripGeneration({
  date,
  totalTripsGenerated: approved,
  totalRejected: rejected,
  avgEvaluationTime: totalTime / count,
});
```

### 5. Multi-Bus Routes
Currently selects first available bus. Future:
- Load balance across buses
- Prefer buses with capacity
- Consider driver preferences

## File Structure

```
src/trips/
├── controllers/
│   ├── trips.controller.ts
│   └── trips.controller.spec.ts
├── services/
│   ├── trips.service.ts
│   ├── trips.service.spec.ts
│   ├── trip-generation.service.ts
│   └── trip-generation.service.spec.ts
├── dto/
│   └── generate-trip.dto.ts
├── trips.module.ts
├── index.ts
├── TRIPS_MODULE_README.md
└── (this file)
```

## Configuration

Currently hardcoded in TripGenerationService:
- Bus selection strategy: first available
- Driver selection strategy: first available
- Holiday calendar: always false (future integration)
- Safety factor: 90% capacity (from RuleEngine)

Future: Externalize to TripsConfig model

## Performance Considerations

### Database Queries
- Timetables: indexed on date
- Students: filtered by daily status (index on date, status)
- Buses: filtered by status (index on status)
- Drivers: filtered by trip assignments (index on date)

### Rule Engine
- ~5ms per trip evaluation
- No database access (fast)
- Can process 100+ trips/second

### Batch Operations
- Trips created individually (transactional)
- Future: Use prisma.$transaction for atomicity

## Troubleshooting

**No trips generated**
- Check: Are there timetables for this date?
- Check: Are there students with PRESENT status?
- Check: Are there active buses?
- Check: Are there available drivers?

**Trips rejected**
- Check: `errorDetails.criticalFailures` in response
- Common: Capacity exceeded, driver unavailable

**Database errors**
- Check: DATABASE_URL is set
- Check: Prisma migrations are run
- Check: Database connection is available

## Links

- **Prisma Schema**: `../prisma/schema.prisma`
- **Rule Engine**: `../rule-engine/RULE_ENGINE_README.md`
- **API Docs**: Swagger at `/api/docs`
