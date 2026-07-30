# BUS FLOW Backend - Prisma Schema Refactoring Summary

## Overview
The schema has been refactored from a basic CRUD model to a **production-ready, rule-based campus transportation system** that supports daily trip generation, live tracking, and operational management.

---

## Major Changes & Rationale

### 1. **Trip Model: Central Operational Entity** ⭐
**NEW MODEL ADDED**

```prisma
model Trip {
  id        String    @id @default(cuid())
  routeId   String
  route     Route     @relation(...)
  busId     String
  bus       Bus       @relation(...)
  driverId  String
  driver    Driver    @relation(...)
  date      DateTime
  departureTime DateTime
  arrivalTime   DateTime?
  status    TripStatus @default(SCHEDULED)
  generatedByRuleEngine Boolean @default(false)
  ...
}
```

**Why This Matters:**
- **Rule Engine Focus**: Trip is the entity the Rule Engine will generate daily based on timetables and student participation
- **Flexible Assignment**: Drivers and buses are assigned per-trip, not permanently
- **Audit Trail**: `generatedByRuleEngine` boolean tracks automated vs manual assignments
- **Operational History**: Future features like delays, cancellations, and analytics will build on this
- **Compound Unique Index**: `(busId, date, departureTime)` prevents duplicate trips per bus per day

---

### 2. **Removed Driver → Bus One-to-One Assignment**
**BEFORE:** Driver had permanent `busId` with `@unique` constraint
**AFTER:** Driver.busId removed; now assigned via Trip model

```prisma
// REMOVED
busId String? @unique
bus   Bus?    @relation(...)

// ADDED
trips Trip[]  // One driver can operate many trips
```

**Why This Improves Design:**
- ✅ **Operational Flexibility**: Same driver can operate different buses on different days
- ✅ **Real-World Compliance**: Matches campus transportation actual operations
- ✅ **Trip Centric**: Driver assignment now part of trip planning logic
- ✅ **Scalability**: Supports driver scheduling, rotation, and replacement

---

### 3. **Removed Route → Bus One-to-Many Assignment**
**BEFORE:** Route had permanent `busId`; Bus had permanent `routes[]` array
**AFTER:** Routes remain static; Bus assignments are per-trip

```prisma
// REMOVED FROM Route
busId String?
bus   Bus?    @relation(...)

// REMOVED FROM Bus
routes Route[]

// ADDED TO Both
trips Trip[]  // Trip now links Route-Bus-Driver
```

**Why This Improves Design:**
- ✅ **Separation of Concerns**: Routes (permanent infrastructure) ≠ Trips (daily operations)
- ✅ **Dynamic Daily Planning**: Same route can use different buses on different days
- ✅ **Master Data Integrity**: Routes remain stable; Trips capture daily variations
- ✅ **Multi-Route Buses**: A bus can serve multiple routes across different times

---

### 4. **Enhanced Route Model with Operational Fields**
**ADDED:**
```prisma
estimatedDistance Float?    // For route planning & ETA calculations
estimatedDuration Int?      // In minutes; used by Rule Engine
```

**Why This Matters:**
- ✅ **Rule Engine Input**: Duration used to calculate departure times based on class schedules
- ✅ **ETA Calculations**: Distance and duration enable real-time delay calculations
- ✅ **Analytics Ready**: Historical route performance tracking
- ✅ **Optimization**: Future ML models for route efficiency

---

### 5. **Improved Student Master Data**
**CHANGED:**
```prisma
// REMOVED (too generic)
grade   String?
section String?

// ADDED (dataset-aligned)
program   String?       // e.g., "B.Tech", "MBA"
semester  String?       // e.g., "4", "2"
campus    String?       // e.g., "Main Campus", "North Wing"
pickupCity String?      // Matches "Daily Student Live Status" import

// RENAMED (clearer intent)
stopId        → pickupStopId
stop          → pickupStop
```

**Why This Improves Design:**
- ✅ **Data Import Alignment**: Fields match the Static Student Bus Master dataset
- ✅ **Clearer Intent**: `pickupStopId` vs `stopId` explicitly shows default pickup
- ✅ **Query Flexibility**: Index on `program`, `campus` for batch queries
- ✅ **Multi-Campus Support**: Campus field enables campus-level reporting
- ✅ **Academic Integration**: Program/semester alignment with timetable type changes

---

### 6. **Improved Timetable with TimetableType Enum**
**ADDED:**
```prisma
enum TimetableType {
  CLASS        // Regular class schedule
  EXAM         // Exam week - may affect trips
  HOLIDAY      // No classes - trips cancelled
  EVENT        // Special event - custom trips
}

model Timetable {
  type TimetableType @default(CLASS)
  ...
}
```

**Why This Matters:**
- ✅ **Rule Engine Logic**: Type drives trip generation decisions:
  - `HOLIDAY` → Don't generate trips
  - `EXAM` → Possibly modified schedules
  - `CLASS` → Normal trip generation
  - `EVENT` → Special route requirements
- ✅ **Campus Calendar Integration**: Supports academic calendar
- ✅ **Smart Cancellation**: Automatically skip trip generation for holidays

---

### 7. **Enhanced BusLiveStatus with Proper FK Relationships**
**BEFORE:** String IDs without relationships
```prisma
currentStopId String?
nextStopId    String?
```

**AFTER:** Proper foreign key relationships
```prisma
currentStopId String?
currentStop   Stop?   @relation(..., name: "currentStop")

nextStopId    String?
nextStop      Stop?   @relation(..., name: "nextStop")

@@index([currentStopId])
@@index([nextStopId])
```

**Why This Improves Design:**
- ✅ **Data Integrity**: Foreign key constraint prevents orphaned stop IDs
- ✅ **Type Safety**: Generate typed relations in Prisma Client
- ✅ **Query Optimization**: Join stops for real-time tracking displays
- ✅ **Named Relations**: Support multiple Stop relations without conflicts

---

### 8. **Added TripStatus Enum for Operational Tracking**
```prisma
enum TripStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DELAYED
}
```

**Why This Matters:**
- ✅ **Future-Ready**: Supports delays, cancellations, and analytics
- ✅ **Operational Visibility**: Track trip lifecycle from start to end
- ✅ **Notifications**: Status changes trigger alerts to students/parents
- ✅ **Reporting**: Query trips by status for KPIs

---

### 9. **Production-Ready Improvements**

#### Indexing Strategy
```prisma
// Critical Query Paths
Trip:
  @@index([routeId])           // Trips for a route on a date
  @@index([busId])             // Trips for a bus
  @@index([driverId])          // Trips for a driver
  @@index([date])              // Trips on a specific date
  @@index([status])            // Filter by trip status
  @@index([generatedByRuleEngine]) // Track Rule Engine vs manual

Student:
  @@index([program])           // Filter by program
  @@index([campus])            // Multi-campus queries
  @@index([pickupStopId])      // Students using a stop

Route:
  @@index([name])              // Lookup by route name

StudentDailyStatus:
  @@index([date])              // Daily reports
```

#### Cascading Delete Policies
- User delete → cascades to Student, Driver, Notifications
- Route delete → cascades to Stops, Timetables, Trips
- Trip delete → triggers audit log for analytics
- Bus delete → cascades to BusLiveStatus and Trips

#### Unique Constraints
```prisma
Student:       @@unique([userId])              // 1:1 with User
Driver:        @@unique([userId])              // 1:1 with User
Bus:           @unique plateNumber             // Business key
Route:         @unique name                    // Business key
Stop:          @@unique([routeId, order])      // Natural key
StudentDailyStatus: @@unique([studentId, date])  // One status per day
Trip:          @@unique([busId, date, departureTime]) // Prevent duplicates
```

#### Timestamp Management
- `createdAt` on all master data (User, Student, Driver, Bus, Route, Stop)
- `createdAt` on transactions (StudentDailyStatus, Trip, Notification, AuditLog)
- `updatedAt` on mutable data (not on operational records)
- `lastUpdated` on BusLiveStatus for freshness tracking

---

## Relationship Diagram

```
User
  ├─ Student (1:1)
  │   ├─ dailyStatus: StudentDailyStatus[] (1:n)
  │   ├─ route: Route (1:n, optional)
  │   └─ pickupStop: Stop (1:n, optional)
  │
  ├─ Driver (1:1)
  │   └─ trips: Trip[] (1:n)
  │
  └─ notifications: Notification[] (1:n)

Bus
  ├─ liveStatus: BusLiveStatus (1:1, optional)
  └─ trips: Trip[] (1:n)

Route
  ├─ stops: Stop[] (1:n)
  ├─ students: Student[] (1:n)
  ├─ timetables: Timetable[] (1:n)
  └─ trips: Trip[] (1:n)

Stop
  ├─ pickupStudents: Student[] (1:n)
  ├─ busLiveStatusCurrent: BusLiveStatus[] (1:n)
  └─ busLiveStatusNext: BusLiveStatus[] (1:n)

Trip ⭐ (Central Operational Entity)
  ├─ route: Route
  ├─ bus: Bus
  └─ driver: Driver
```

---

## Dataset Alignment

### Static Student Bus Master → Schema Mapping
```
Student Table:
  studentNo       → Student.studentNo
  program         → Student.program
  semester        → Student.semester
  campus          → Student.campus
  default_route   → Student.route (Route.id)
  default_stop    → Student.pickupStop (Stop.id)
  user_id         → Student.userId
```

### Daily Student Live Status → Schema Mapping
```
Daily Participation:
  student_id      → StudentDailyStatus.studentId
  date            → StudentDailyStatus.date
  status          → StudentDailyStatus.status (enum)
  pickup_time     → StudentDailyStatus.pickupTime
  dropoff_time    → StudentDailyStatus.dropoffTime
```

### Live Bus Status → Schema Mapping
```
Real-time Tracking:
  bus_id          → BusLiveStatus.busId
  latitude        → BusLiveStatus.latitude
  longitude       → BusLiveStatus.longitude
  speed           → BusLiveStatus.speed
  current_stop    → BusLiveStatus.currentStop (Stop relation)
  next_stop       → BusLiveStatus.nextStop (Stop relation)
  students_count  → BusLiveStatus.totalStudentsOnboard
  status          → BusLiveStatus.status (enum)
```

---

## Future Features Enabled

✅ **Rule Engine**: Generate daily Trips based on Timetable type and StudentDailyStatus
✅ **Live Tracking**: Real-time bus location with currentStop/nextStop
✅ **Delay Management**: Update Trip status to DELAYED with notifications
✅ **Trip Analytics**: Query trips by date, route, driver, bus for KPIs
✅ **Student Insights**: Dashboard showing participation patterns per program/campus
✅ **Driver Performance**: Track trips, punctuality, and ratings per driver
✅ **Route Optimization**: Historical duration data for algorithm tuning
✅ **Audit Trail**: Full history of Rule Engine decisions via AuditLog
✅ **Multi-Campus**: Support multiple campuses with campus-level reporting
✅ **Academic Integration**: Holiday/exam schedules affect trip generation

---

## Migration Path

1. **Backup existing data**
2. **Create migration**: `npx prisma migrate dev --name refactor_trip_model`
3. **Data migration script**:
   - Create Trip records from historical Route-Bus assignments
   - Mark trips as `generatedByRuleEngine: false` (manual/legacy)
   - Update Student.stopId → pickupStopId
   - Populate Student.program, campus fields from imports
4. **Validation**: Verify no data loss, all foreign keys valid
5. **Deploy**: Update API to use Trip as central entity

---

## Production Checklist

- ✅ Schema formatted with `prisma format`
- ✅ Schema validated with `prisma validate`
- ✅ All enums properly defined
- ✅ All foreign keys indexed
- ✅ Cascading delete policies set
- ✅ Unique constraints on business keys
- ✅ Timestamps on audit-critical entities
- ✅ No duplicate data (normalized)
- ✅ Relation names explicit and clear
- ✅ Compound indexes for query optimization
- ✅ Compatible with existing dataset imports
- ✅ Supports Rule Engine requirements

---

## Commands

```bash
# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Generate migration (after DB setup)
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Prisma Studio (interactive explorer)
npx prisma studio
```

---

## Schema Version: 2.0
**Last Updated**: 2026-07-29
**Status**: ✅ Production Ready
**Validation**: ✅ Passed
