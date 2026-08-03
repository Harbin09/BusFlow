# BUS FLOW - Rule Engine Specification

## Overview

The **Rule Engine** (`engines/rule-engine`) is the centralized, deterministic decision maker for BUS FLOW. It evaluates business conditions across 8 core domain policies without relying on hardcoded procedural code scattered throughout the codebase.

---

## Rule Domains

### 1. Boarding Validation Rules
- **Student Active Registration**: Validates student is enrolled on the target bus/route.
- **Stop Location Proximity**: Verifies student boarding ping is within allowed radius of the active stop.
- **Seat Availability**: Checks current bus occupancy vs. maximum capacity.

### 2. Bus Switching Rules
- **Monthly Credit Limit**: Enforces max 5 bus switches per student per calendar month.
- **Switch Window Constraint**: Requests must be submitted at least N minutes prior to trip start.
- **Target Bus Capacity Check**: Ensures recipient bus has available space for the switch period.

### 3. Missed Bus Rules
- **Departure Confirmation**: Triggered when bus leaves stop geofence without student boarding ping.
- **Alternative Route Recommendation**: Evaluates nearby active buses on overlapping routes.
- **Notification Trigger**: Dispatches instant alert to student portal.

### 4. Capacity Management Rules
- **Soft Limit Alert (85%)**: Triggers warning to fleet manager for potential overflow.
- **Hard Limit Enforcement (100%)**: Blocks further student assignments or bus switch approvals.

### 5. Dynamic Route Override Rules
- **Expiration TTL**: Overrides auto-expire upon trip completion or pre-configured timeout.
- **Base Route Integrity**: Guarantees base route remains untouched in primary database.

### 6. Trip Validation Rules
- **Pre-trip Driver Inspection**: Driver must acknowledge bus state before trip start.
- **Route Sequence Compliance**: Validates driver is traversing stops in order.

### 7. Notification Rules
- **Rate Limiting**: Prevents alert fatigue (e.g. max 1 ETA alert per 3 minutes).
- **Channel Selection**: Routes high-severity alerts (breakdowns) to SMS/Push, low-severity to in-app.

### 8. Geo-fencing Rules
- **Stop Arrival Boundary**: 50-meter radius around stop coordinates.
- **Stop Departure Boundary**: 100-meter exit boundary to prevent false departure triggers.
