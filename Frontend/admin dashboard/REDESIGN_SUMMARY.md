# Frontend Redesign Summary

## Audit Complete: Backend-First Redesign

The frontend has been audited against the actual NestJS backend. This document summarizes findings and the redesign plan.

---

## 1. Every Endpoint Currently Used (After Redesign)

### ✅ Real Endpoints (Exist in Backend)

#### Public Endpoints
| Method | Endpoint | Service | Hook | Status |
|--------|----------|---------|------|--------|
| GET | `/api/v1/health` | - | - | ✅ Health check (exists) |

#### Trip Management
| Method | Endpoint | Service | Hook | Auth | Status |
|--------|----------|---------|------|------|--------|
| POST | `/api/v1/trips/generate` | `operationsService.generateTrips()` | `useGenerateTrips()` | Public | ✅ Create trips for date |

#### Driver Operations
| Method | Endpoint | Service | Hook | Auth | Status |
|--------|----------|---------|------|------|--------|
| GET | `/api/v1/drivers/workflow/today` | `operationsService.getDriverTodayTrip()` | `useDriverTodayTrip()` | DRIVER | ✅ Get driver's today trip |
| POST | `/api/v1/drivers/workflow/trips/{tripId}/start` | `operationsService.startTrip()` | `useStartTrip()` | DRIVER | ✅ Start trip |
| POST | `/api/v1/drivers/workflow/trips/{tripId}/end` | `operationsService.endTrip()` | `useEndTrip()` | DRIVER | ✅ End trip |
| GET | `/api/v1/drivers/workflow/trips/{tripId}/passengers` | `operationsService.getTripPassengers()` | `useTripPassengers()` | DRIVER | ✅ Get passengers |

#### Student Operations
| Method | Endpoint | Service | Hook | Auth | Status |
|--------|----------|---------|------|------|--------|
| GET | `/api/v1/students/workflow/today` | `operationsService.getStudentTodayTrip()` | `useStudentTodayTrip()` | STUDENT | ✅ Get student's today trip |
| GET | `/api/v1/students/workflow/bus-location/{tripId}` | `operationsService.getBusLocation()` | `useBusLocation()` | STUDENT | ✅ Get bus location |

#### Tracking Operations
| Method | Endpoint | Service | Hook | Auth | Status |
|--------|----------|---------|------|------|--------|
| POST | `/api/v1/tracking/location` | `operationsService.updateLocation()` | `useUpdateLocation()` | DRIVER | ✅ Update GPS location |
| POST | `/api/v1/tracking/activate` | `operationsService.activateTracking()` | `useActivateTracking()` | DRIVER | ✅ Activate tracking |
| POST | `/api/v1/tracking/complete` | `operationsService.completeTracking()` | `useCompleteTracking()` | DRIVER | ✅ Complete tracking |

#### WebSocket (Real-time)
| Namespace | Event | Purpose | Status |
|-----------|-------|---------|--------|
| `tracking` | `subscribe:trip` | Subscribe to trip updates | ✅ Real-time tracking |
| `tracking` | `location:update` | Receive location updates | ✅ Broadcast bus position |
| `tracking` | `unsubscribe:trip` | Unsubscribe from updates | ✅ Stop tracking |
| `tracking` | `ping/pong` | Keep-alive heartbeat | ✅ Connection maintenance |

### ❌ Non-existent Endpoints (Remove from Frontend)

These endpoints do NOT exist in the backend and should be removed:

| Endpoint | Currently Used By | Action |
|----------|------------------|--------|
| GET `/api/v1/dashboard/summary` | `dashboard.ts` | DELETE - No admin dashboard endpoint |
| GET `/api/v1/dashboard/map` | `dashboard.ts` | DELETE - Use WebSocket instead |
| GET `/api/v1/drivers` | `drivers.ts` | DELETE - No admin list endpoint |
| GET/POST/PUT/DELETE `/api/v1/drivers/*` | `drivers.ts` | DELETE - No CRUD endpoints |
| GET `/api/v1/buses` | `fleet.ts` | DELETE - No admin list endpoint |
| GET/POST/PUT/DELETE `/api/v1/buses/*` | `fleet.ts` | DELETE - No CRUD endpoints |
| GET `/api/v1/routes` | `routes.ts` | DELETE - No admin list endpoint |
| GET/POST/PUT/DELETE `/api/v1/routes/*` | `routes.ts` | DELETE - No CRUD endpoints |
| GET `/api/v1/routes/temporary` | `routes.ts` | DELETE - No temporary routes endpoint |
| GET `/api/v1/analytics/student-density` | `routes.ts` | DELETE - No analytics endpoint |
| GET `/api/v1/analytics/route-comparison` | `routes.ts` | DELETE - No analytics endpoint |
| POST `/api/v1/routes/deploy` | `routes.ts` | DELETE - No route deploy endpoint |
| GET `/api/v1/students` | `students.ts` | DELETE - No admin list endpoint |
| GET/POST/PUT/DELETE `/api/v1/students/*` | `students.ts` | DELETE - No CRUD endpoints |
| POST `/api/v1/students/upload` | `students.ts` | DELETE - No CSV upload endpoint |
| GET `/api/v1/tracking/live` | `tracking.ts` | DELETE - Use WebSocket instead |

---

## 2. Pages Connected to Backend

### Current Frontend Pages (To Be Redesigned)

| Page | Location | Current Endpoint(s) | New Endpoint(s) | Status |
|------|----------|-------------------|-----------------|--------|
| Dashboard | `/admin` | ❌ `/api/v1/dashboard/summary` | ✅ WebSocket + `/api/v1/trips/generate` | TODO |
| Students | `/admin/students` | ❌ `/api/v1/students` | N/A (No admin endpoint) | BLOCKED |
| Drivers | `/admin/drivers` | ❌ `/api/v1/drivers` | N/A (No admin endpoint) | BLOCKED |
| Routes | `/admin/routes` | ❌ `/api/v1/routes` | N/A (No admin endpoint) | BLOCKED |
| Fleet | `/admin/fleet` | ❌ `/api/v1/buses` | N/A (No admin endpoint) | BLOCKED |
| Tracking | `/admin/tracking` | ❌ `/api/v1/tracking/live` | ✅ WebSocket `/tracking` | TODO |
| Settings | `/admin/alerts` | ❌ No backend integration | N/A | BLOCKED |

### Redesigned Pages (Work in Progress)

**New Structure - Based on Backend Capabilities:**

#### Page 1: Operations Dashboard
- **Path**: `/admin`
- **Purpose**: Real-time view of today's transportation operations
- **Endpoints Used**:
  - `POST /api/v1/trips/generate` - Trip generation interface
  - WebSocket `tracking` - Live bus locations
- **Features**:
  - Trip generator for today's date
  - Real-time bus count and status
  - Active drivers count
  - Active students in transit
  - Live map via WebSocket

#### Page 2: Driver Portal (Coming Soon)
- **Path**: `/admin/driver` (role-based, only if user has DRIVER role)
- **Purpose**: Driver-facing trip management
- **Endpoints Used**:
  - `GET /api/v1/drivers/workflow/today` - Get assigned trip
  - `POST /api/v1/drivers/workflow/trips/{tripId}/start` - Start trip
  - `POST /api/v1/drivers/workflow/trips/{tripId}/end` - End trip
  - `GET /api/v1/drivers/workflow/trips/{tripId}/passengers` - Passenger list
  - `POST /api/v1/tracking/location` - GPS updates
- **Features**:
  - Trip details and timeline
  - Passenger list with boarding status
  - Trip start/end controls
  - GPS tracking activation

#### Page 3: Student Portal (Coming Soon)
- **Path**: `/admin/student` (role-based, only if user has STUDENT role)
- **Purpose**: Student-facing trip tracking
- **Endpoints Used**:
  - `GET /api/v1/students/workflow/today` - Get assigned trip
  - `GET /api/v1/students/workflow/bus-location/{tripId}` - Get bus location
- **Features**:
  - Trip details
  - Real-time bus location
  - ETA estimation
  - Stop information

#### Page 4: Live Tracking Map (Enhanced)
- **Path**: `/admin/tracking`
- **Purpose**: Admin view of all active buses in real-time
- **Endpoints Used**:
  - WebSocket `tracking` namespace - Subscribe to all bus updates
- **Features**:
  - Live map with all active buses
  - Real-time location updates
  - Bus status indicators
  - Trip information on bus click

---

## 3. Backend Endpoints That Don't Exist

### Blocking Items for Admin Portal

These endpoints don't exist in the backend and would be needed for a full admin portal:

| Endpoint | Purpose | Status | Workaround |
|----------|---------|--------|-----------|
| GET `/api/v1/admin/trips/today` | List all trips for today | ❌ Missing | Use `/api/v1/trips/generate` + WebSocket |
| GET `/api/v1/admin/drivers` | List all drivers | ❌ Missing | No current workaround |
| GET `/api/v1/admin/drivers/{id}` | Get driver details | ❌ Missing | No current workaround |
| POST/PUT/DELETE `/api/v1/admin/drivers/*` | Manage drivers | ❌ Missing | Not possible with current API |
| GET `/api/v1/admin/students` | List all students | ❌ Missing | No current workaround |
| GET `/api/v1/admin/students/{id}` | Get student details | ❌ Missing | No current workaround |
| POST/PUT/DELETE `/api/v1/admin/students/*` | Manage students | ❌ Missing | Not possible with current API |
| POST `/api/v1/admin/students/import` | Bulk import students | ❌ Missing | No current workaround |
| GET `/api/v1/admin/buses` | List all buses | ❌ Missing | No current workaround |
| GET `/api/v1/admin/buses/{id}` | Get bus details | ❌ Missing | No current workaround |
| POST/PUT/DELETE `/api/v1/admin/buses/*` | Manage buses | ❌ Missing | Not possible with current API |
| GET `/api/v1/admin/routes` | List all routes | ❌ Missing | No current workaround |
| GET `/api/v1/admin/routes/{id}` | Get route details | ❌ Missing | No current workaround |
| POST/PUT/DELETE `/api/v1/admin/routes/*` | Manage routes | ❌ Missing | Not possible with current API |
| GET `/api/v1/admin/reports/*` | Generate reports | ❌ Missing | No current workaround |
| GET `/api/v1/analytics/*` | Get analytics data | ❌ Missing | No current workaround |

---

## 4. Remaining Work to Complete Admin Portal

### Phase 1: Real-time Operations Dashboard ✅ (READY TO IMPLEMENT)
- [x] Create `operationsService` with correct endpoints
- [x] Create `useOperations` hooks
- [ ] Create Dashboard page using Trip generation + WebSocket
- [ ] Implement live bus map via WebSocket
- [ ] Add real-time statistics display
- [ ] Add loading and error states

### Phase 2: Driver Portal ✅ (READY TO IMPLEMENT)
- [x] Service endpoints mapped
- [ ] Create Driver page with trip details
- [ ] Implement trip start/end controls
- [ ] Display passenger list with boarding status
- [ ] Add GPS tracking controls

### Phase 3: Student Portal ✅ (READY TO IMPLEMENT)
- [x] Service endpoints mapped
- [ ] Create Student page with trip details
- [ ] Implement real-time bus location map
- [ ] Add ETA estimation
- [ ] Display stop information

### Phase 4: WebSocket Integration ✅ (READY TO IMPLEMENT)
- [x] Socket.io connection setup planned
- [ ] Implement tracking namespace subscription
- [ ] Handle real-time location updates
- [ ] Implement reconnection logic
- [ ] Add connection status indicator

### Phase 5: Backend Extensions (🚫 REQUIRES BACKEND CHANGES)
**These require NEW backend endpoints that don't currently exist:**
- [ ] Admin endpoints to list all drivers/students/buses/routes
- [ ] Admin endpoints to CRUD manage all entities
- [ ] Analytics endpoints for reporting
- [ ] CSV import for students
- [ ] Weather alert integration

---

## 5. Services to Delete

These services call non-existent endpoints and should be completely removed:

```
lib/services/dashboard.ts     - ❌ DELETE
lib/services/drivers.ts       - ❌ DELETE (no admin endpoints)
lib/services/fleet.ts         - ❌ DELETE (no admin endpoints)
lib/services/routes.ts        - ❌ DELETE (no admin endpoints)
lib/services/students.ts      - ❌ DELETE (no admin endpoints)
```

**Files to Keep:**
```
lib/services/operations.ts    - ✅ NEW (correct endpoints)
lib/services/auth.ts          - ✅ KEEP (mock auth)
lib/services/socket.ts        - ✅ KEEP (WebSocket wrapper)
lib/services/index.ts         - UPDATE (export operations only)
```

---

## 6. Next Immediate Steps

### Step 1: Remove Non-existent Service Calls
- Delete old services that call non-existent endpoints
- Update `lib/services/index.ts` to export only `operationsService`

### Step 2: Implement Real-time Dashboard
- Create new dashboard page using:
  - Trip generation endpoint
  - WebSocket real-time bus tracking
  - Live statistics

### Step 3: Implement Driver & Student Portals
- Create role-specific pages
- Use correct workflow endpoints
- Add real-time updates

### Step 4: (Future) Request Backend Admin Endpoints
- Document required admin endpoints
- Propose backend additions to support full admin CRUD

---

## Summary

**Backend provides:**
- ✅ Real-time operations (drivers/students managing trips)
- ✅ Real-time location tracking (WebSocket)
- ✅ Trip generation and management
- ❌ No admin data management APIs

**Frontend should be redesigned to:**
- ✅ Leverage real-time capabilities
- ✅ Focus on operational dashboard
- ✅ Provide driver/student portals
- ❌ NOT attempt CRUD operations (not supported by backend)

**Decision point:**
- If admin needs to manage students/drivers/buses/routes → Backend needs new admin endpoints
- If admin only needs real-time operations monitoring → Proceed with Phase 1-4

---

## Files Created for Correct Backend Integration

**New files (create with backend endpoints):**
- ✅ `lib/services/operations.ts` - Created
- ✅ `lib/hooks/useOperations.ts` - Created

**Files to create (pages using correct endpoints):**
- TODO: `/app/admin/page.tsx` - Real-time operations dashboard
- TODO: `/app/admin/driver/page.tsx` - Driver portal (if needed)
- TODO: `/app/admin/student/page.tsx` - Student portal (if needed)
- TODO: `/app/admin/tracking/page.tsx` - Enhanced live tracking map

**Files to delete:**
- TODO: Delete `lib/services/dashboard.ts`
- TODO: Delete `lib/services/drivers.ts`
- TODO: Delete `lib/services/fleet.ts`
- TODO: Delete `lib/services/routes.ts`
- TODO: Delete `lib/services/students.ts`
- TODO: Update `lib/services/index.ts` - Only export operations
