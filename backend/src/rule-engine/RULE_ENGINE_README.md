# Rule Engine Foundation - BUS FLOW

## Overview

The Rule Engine is the decision-making system for BUS FLOW's trip generation. It evaluates multiple rules against a trip context and returns a structured decision: **APPROVED** or **REJECTED**.

This is the foundation that will power the daily trip generation workflow.

---

## Architecture

### Principle: Separation of Concerns

The Rule Engine is designed with clear separation:

- **RuleEngineService**: Orchestrates rule evaluation (no business logic)
- **Rules (IRule implementations)**: Evaluate specific aspects independently
- **RuleContext**: Data carrier (no dependencies)
- **RuleResult**: Structured output (no logic)

**Key Benefit**: Rules don't access the database directly. Data is passed via RuleContext. This keeps the Rule Engine decoupled from Prisma and makes testing trivial.

### Architecture Diagram

```
RuleEngineService (Orchestrator)
    ↓
Registers & Executes Rules
    ↓
Rule 1: TimetableEvaluator (priority 110)
Rule 2: CapacityEvaluator (priority 100)
Rule 3: DriverAvailabilityEvaluator (priority 90)
    ↓
RuleEngineDecision (Final Result)
```

---

## Core Components

### 1. IRule Interface

All rules implement this interface:

```typescript
export interface IRule {
  id: string;              // Unique identifier
  name: string;            // Human-readable name
  priority: number;        // Higher = evaluated first
  isCritical: boolean;     // Critical = trip rejected if fails
  
  evaluate(context: RuleContext): Promise<RuleResult> | RuleResult;
}
```

**Example**: CapacityEvaluator
- `id`: "CRITICAL_CAPACITY_CHECK"
- `priority`: 100 (evaluated after Timetable, before Driver)
- `isCritical`: true (rejected if fails)

### 2. RuleContext

Data carrier passed to all rules. Contains everything needed for evaluation:

```typescript
class RuleContext {
  date: Date;                      // Trip date
  routeId: string;                 // Route assignment
  busId: string;                   // Bus assignment
  busCapacity: number;             // Total bus seats
  driverId: string;                // Driver assignment
  departureTime: Date;             // Departure time
  arrivalTime?: Date;              // Arrival time
  assignedStudentIds: string[];    // Students for this trip
  availableDriverIds: string[];    // Drivers available today
  estimatedDurationMinutes?: number;
  timetableType?: 'CLASS' | 'EXAM' | 'HOLIDAY' | 'EVENT';
  isHoliday?: boolean;
  metadata?: Record<string, unknown>; // For extensions
}
```

### 3. RuleResult

Structured output from a single rule:

```typescript
class RuleResult {
  ruleId: string;           // Which rule?
  ruleName: string;         // For humans
  passed: boolean;          // Pass or fail?
  message: string;          // Why?
  details?: Record<string>; // Metrics
  evaluatedAt: Date;        // When?
  evaluationTimeMs: number; // How long?
}
```

### 4. RuleEngineDecision

Final decision from the engine:

```typescript
class RuleEngineDecision {
  approved: boolean;              // Trip approved?
  ruleResults: RuleResult[];      // All rule results
  criticalFailures: RuleResult[]; // Which critical rules failed
  warnings: RuleResult[];         // Non-critical failures
  summary: string;                // Human readable
  totalEvaluationTimeMs: number;  // Total time
}
```

---

## Built-in Evaluators

### 1. TimetableEvaluator

**Purpose**: Validate trip against timetable and holidays

**Checks**:
- ✓ No trips on holidays
- ✓ Departure time is same day as trip date
- ⚠ Warning on EXAM and EVENT days

**Priority**: 110 (highest, evaluated first)  
**Critical**: Yes (holiday blocks trip)

```typescript
const evaluator = new TimetableEvaluator();
const result = await evaluator.evaluate(context);

// If isHoliday = true → REJECTED
// If timetableType = EXAM → ACCEPTED with warning
```

### 2. CapacityEvaluator

**Purpose**: Validate student count against bus capacity

**Checks**:
- ✓ Students ≤ 90% of bus capacity (safety factor)
- ✓ Calculates utilization percentage

**Priority**: 100  
**Critical**: Yes (overcrowding blocks trip)

**Configuration**:
```typescript
// Default: 90% safety factor
const evaluator = new CapacityEvaluator(0.9);

// Custom: 80% safety factor
const evaluator = new CapacityEvaluator(0.8);
```

**Example**:
```
Bus capacity: 50
Assigned students: 46
Safe capacity: 45 (50 * 0.9)
Result: REJECTED (46 > 45)
```

### 3. DriverAvailabilityEvaluator

**Purpose**: Validate driver is available for this trip

**Checks**:
- ✓ Driver ID is valid and non-empty
- ✓ Driver is in availableDriverIds list

**Priority**: 90  
**Critical**: Yes (unavailable driver blocks trip)

**Usage**:
```typescript
// availableDriverIds should contain drivers who:
// - Are active (status = ACTIVE)
// - Not already assigned to another trip at this time
// - Not on leave
context.availableDriverIds = ['driver-1', 'driver-2'];

const result = await evaluator.evaluate(context);
// REJECTED if driverId not in availableDriverIds
```

---

## RuleEngineService

The orchestrator that manages rule execution.

### API

```typescript
// Register a single rule
service.registerRule(new CapacityEvaluator());

// Register multiple rules
service.registerRules([
  new TimetableEvaluator(),
  new CapacityEvaluator(),
  new DriverAvailabilityEvaluator(),
]);

// Get all registered rules (sorted by priority)
const rules = service.getRules();

// Evaluate a trip
const decision = await service.evaluate(context);
if (decision.approved) {
  // Create the trip
} else {
  // Log rejection reason
  console.log(decision.getDetailedReport());
}

// Quick yes/no check
const approved = await service.isApproved(context);

// Get formatted report
console.log(service.getReport(decision));

// Clear all rules (for testing or reconfiguration)
service.clearRules();
```

### Execution Flow

1. **Registration**: Rules registered and sorted by priority (highest first)
2. **Evaluation**: Each rule evaluated in priority order
3. **Early Exit**: If a critical rule fails, stop evaluation immediately
4. **Collection**: All results collected into RuleEngineDecision
5. **Report**: Formatted summary available for logging/debugging

### Example: Full Workflow

```typescript
// Setup
const engine = new RuleEngineService();
engine.registerRules([
  new TimetableEvaluator(),
  new CapacityEvaluator(),
  new DriverAvailabilityEvaluator(),
]);

// Prepare context (from database)
const context = new RuleContext({
  date: new Date('2026-07-30'),
  routeId: 'route-A1',
  busId: 'bus-001',
  busCapacity: 50,
  driverId: 'driver-emp-001',
  departureTime: new Date('2026-07-30T08:00:00Z'),
  assignedStudentIds: ['stu-1', 'stu-2', '...'], // From StudentDailyStatus
  availableDriverIds: ['driver-emp-001', 'driver-emp-002'], // Pre-filtered
  timetableType: 'CLASS',
  isHoliday: false,
});

// Evaluate
const decision = await engine.evaluate(context);

// Decide
if (decision.approved) {
  console.log('Trip approved! Creating database record...');
} else {
  console.log('Trip rejected:');
  decision.criticalFailures.forEach(fail => {
    console.log(`  - ${fail.ruleName}: ${fail.message}`);
  });
}

// Report
console.log(engine.getReport(decision));
```

---

## Creating New Rules

Rules are simple to create. Follow this template:

```typescript
import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';

export class MyCustomEvaluator implements IRule {
  id = 'CUSTOM_MY_RULE';
  name = 'My Custom Rule';
  priority = 75;  // Between existing rules
  isCritical = false;  // Warning only, doesn't block trip

  async evaluate(context: RuleContext): Promise<RuleResult> {
    const startTime = performance.now();

    // Your business logic here
    const passed = context.assignedStudentIds.length > 0;

    const evaluationTimeMs = Math.round(performance.now() - startTime);

    return new RuleResult({
      ruleId: this.id,
      ruleName: this.name,
      passed,
      message: passed
        ? 'At least one student assigned'
        : 'No students assigned to trip',
      details: {
        studentCount: context.assignedStudentIds.length,
      },
      evaluationTimeMs,
    });
  }
}
```

**Key Guidelines**:
1. Don't access database directly (data via context)
2. Return structured RuleResult
3. Include performance metrics (evaluationTimeMs)
4. Provide clear message and details
5. Mark isCritical based on whether failure should block trip

---

## Integration with Prisma

The Rule Engine is database-agnostic. Integration happens at the service layer:

```typescript
// In a TripGenerationService or similar:

async generateTripsForDate(date: Date): Promise<void> {
  // 1. Fetch data from Prisma
  const route = await prisma.route.findUnique({ where: { id: routeId } });
  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  const studentDailyStatus = await prisma.studentDailyStatus.findMany({
    where: { date, status: 'PRESENT' },
  });
  const availableDrivers = await this.getAvailableDrivers(date);

  // 2. Build context (don't pass database connections)
  const context = new RuleContext({
    date,
    routeId,
    busId,
    busCapacity: bus.capacity,
    driverId,
    departureTime,
    assignedStudentIds: studentDailyStatus.map(s => s.studentId),
    availableDriverIds: availableDrivers.map(d => d.id),
    timetableType: 'CLASS',
    isHoliday: false,
  });

  // 3. Evaluate
  const decision = await this.ruleEngine.evaluate(context);

  // 4. Persist if approved
  if (decision.approved) {
    await prisma.trip.create({
      data: {
        routeId,
        busId,
        driverId,
        date,
        departureTime,
        status: 'SCHEDULED',
        generatedByRuleEngine: true,
      },
    });
    
    // Create StudentTripAssignment records
    for (const studentId of context.assignedStudentIds) {
      await prisma.studentTripAssignment.create({
        data: { tripId, studentId, status: 'SCHEDULED' },
      });
    }
  } else {
    // Log rejection
    await prisma.auditLog.create({
      data: {
        action: 'TRIP_GENERATION_REJECTED',
        entity: 'Trip',
        details: decision.getDetailedReport(),
      },
    });
  }
}
```

---

## Testing

All components have comprehensive unit tests with mock data:

```bash
npm test -- rule-engine.service.spec.ts
npm test -- capacity.evaluator.spec.ts
npm test -- driver-availability.evaluator.spec.ts
npm test -- timetable.evaluator.spec.ts
```

### Test Coverage

- ✓ Individual rule evaluation (happy path, error cases)
- ✓ Rule registration and priority ordering
- ✓ Critical vs non-critical rule handling
- ✓ Early exit on critical failure
- ✓ Error handling and recovery
- ✓ Integration scenarios (full trip generation)

---

## Performance Considerations

### Evaluation Time

- **Single rule**: ~0-2ms (negligible)
- **All rules (3)**: ~1-5ms
- **Per trip**: <10ms typical

No database queries in rule evaluation → fast and consistent.

### Scalability

- Rules are stateless → can run in parallel (future enhancement)
- No I/O → CPU-bound, easily parallelizable
- Memory: ~1KB per decision object

---

## Future Extensions

### Planned Rules

1. **StudentParticipationRateEvaluator**
   - Minimum % of enrolled students must opt-in
   - Prevents trips with < 70% participation

2. **EquipmentAvailabilityEvaluator**
   - Check if spare seats, wheelchair access, etc.

3. **RouteConflictEvaluator**
   - Prevent overlapping trips on same route

4. **WeatherEvaluator**
   - Skip trips during extreme weather

5. **MaintenanceScheduleEvaluator**
   - Bus can't run during scheduled maintenance

### Adding Extensions

1. Create new evaluator implementing IRule
2. Register with engine
3. Done! No existing code changes needed.

```typescript
engine.registerRule(new StudentParticipationRateEvaluator());
```

---

## Configuration

Currently hardcoded; planned for future externalization:

### Capacity Safety Factor

```typescript
const evaluator = new CapacityEvaluator(0.9); // Default
// or
const evaluator = new CapacityEvaluator(0.8); // Conservative
```

### Rule Priorities

Edit in each evaluator's `priority` field.

### Critical vs Non-Critical

Set `isCritical` based on business rules.

**Future**: Load from RuleEngineConfig model (see Architectural Review).

---

## Troubleshooting

### Trip Rejected But Should Be Approved

1. Check the detailed report:
   ```typescript
   console.log(decision.getDetailedReport());
   ```

2. Verify context data:
   ```typescript
   console.log('Context:', context);
   console.log('Decision:', decision);
   ```

3. Check rule priorities (higher priority rules evaluated first)

### Rule Evaluation Too Slow

1. Check `evaluationTimeMs` in results
2. Typical: <1ms per rule
3. If higher, rule may be doing I/O (shouldn't happen)

### Adding Rule Doesn't Work

1. Ensure it implements IRule interface
2. Ensure it's registered: `engine.registerRule(rule)`
3. Check rule.isCritical and priority settings

---

## Deployment Checklist

- [ ] All tests passing
- [ ] No database calls in rules (context-only)
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Performance metrics understood
- [ ] Integration with Prisma documented
- [ ] New rules documented
- [ ] Configuration externalized (future)

---

## Links

- **Architectural Review**: `../ARCHITECTURE_REVIEW.md`
- **Prisma Schema**: `../prisma/schema.prisma`
- **Database Models**: Trip, StudentDailyStatus, Bus, Route, Driver
- **Integration Point**: TripGenerationService (future)

