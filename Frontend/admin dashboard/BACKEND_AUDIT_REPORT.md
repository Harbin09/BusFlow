# Backend API Audit Report

## Critical Finding: API Mismatch

The frontend services are calling endpoints that **DO NOT EXIST** in the backend.

### Endpoints That Don't Exist (Frontend expects these)

| Endpoint | Frontend Service | Status | Why Missing |
|----------|------------------|--------|------------|
| GET `/api/v1/dashboard/summary` | dashboard.ts | ❌ Missing | No admin dashboard endpoint in backend |
| GET `/api/v1/dashboard/map` | dashboard.ts | ❌ Missing | No admin map endpoint in backend |
| GET `/api/v1/drivers` | drivers.ts | ❌ Missing | Only `/drivers/workflow/today` exists (driver-centric) |
| GET `/api/v1/drivers/{id}` | drivers.ts | ❌ Missing | Only `/drivers/workflow/today` exists |
| POST `/api/v1/drivers` | drivers.ts | ❌ Missing | No driver creation endpoint |
| PUT `/api/v1/drivers/{id}` | drivers.ts | ❌ Missing | No driver update endpoint |
| DELETE `/api/v1/drivers/{id}` | drivers.ts | ❌ Missing | No driver delete endpoint |
| GET `/api/v1/buses` | fleet.ts | ❌ Missing | No bus list endpoint |
| GET `/api/v1/buses/{id}` | fleet.ts | ❌ Missing | No bus detail endpoint |
| POST `/api/v1/buses` | fleet.ts | ❌ Missing | No bus creation endpoint |
| PUT `/api/v1/buses/{id}` | fleet.ts | ❌ Missing | No bus update endpoint |
| DELETE `/api/v1/buses/{id}` | fleet.ts | ❌ Missing | No bus delete endpoint |
| GET `/api/v1/routes` | routes.ts | ❌ Missing | No route list endpoint |
| GET `/api/v1/routes/{id}` | routes.ts | ❌ Missing | No route detail endpoint |
| POST `/api/v1/routes` | routes.ts | ❌ Missing | No route creation endpoint |
| PUT `/api/v1/routes/{id}` | routes.ts | ❌ Missing | No route update endpoint |
| DELETE `/api/v1/routes/{id}` | routes.ts | ❌ Missing | No route delete endpoint |
| GET `/api/v1/routes/temporary` | routes.ts | ❌ Missing | No temporary routes endpoint |
| GET `/api/v1/analytics/student-density` | routes.ts | ❌ Missing | Analytics module imported but no endpoints |
| GET `/api/v1/analytics/route-comparison` | routes.ts | ❌ Missing | Analytics module imported but no endpoints |
| POST `/api/v1/routes/deploy` | routes.ts | ❌ Missing | No route deploy endpoint |
| GET `/api/v1/students` | students.ts | ❌ Missing | Only `/students/workflow/today` exists (student-centric) |
| GET `/api/v1/students/{id}` | students.ts | ❌ Missing | Only `/students/workflow/today` exists |
| POST `/api/v1/students` | students.ts | ❌ Missing | No student creation endpoint |
| PUT `/api/v1/students/{id}` | students.ts | ❌ Missing | No student update endpoint |
| DELETE `/api/v1/students/{id}` | students.ts | ❌ Missing | No student delete endpoint |
| POST `/api/v1/students/upload` | students.ts | ❌ Missing | No CSV upload endpoint |
| GET `/api/v1/tracking/live` | tracking.ts | ❌ Missing | Use WebSocket instead |

---

## Actual Endpoints That Exist in Backend

### Public Endpoints
- **GET** `/api/v1/health` ✅ 
  - Response: `{status, timestamp, service}`
  - Purpose: Health check

### Driver Workflow (Requires DRIVER role)
- **GET** `/api/v1/drivers/workflow/today` ✅
  - Purpose: Get driver's assigned trip for today
  - Response: Trip details
  
- **POST** `/api/v1/drivers/workflow/trips/{tripId}/start` ✅
  - Purpose: Start a trip (SCHEDULED → IN_PROGRESS)
  
- **POST** `/api/v1/drivers/workflow/trips/{tripId}/end` ✅
  - Purpose: End a trip (IN_PROGRESS → COMPLETED)
  
- **GET** `/api/v1/drivers/workflow/trips/{tripId}/passengers` ✅
  - Purpose: Get passenger list for a trip

### Student Workflow (Requires STUDENT role)
- **GET** `/api/v1/students/workflow/today` ✅
  - Purpose: Get student's assigned trip for today
  
- **GET** `/api/v1/students/workflow/bus-location/{tripId}` ✅
  - Purpose: Get current bus location for assigned trip

### Tracking (Requires DRIVER role)
- **POST** `/api/v1/tracking/location` ✅
  - Purpose: Update bus location (GPS tracking)
  
- **POST** `/api/v1/tracking/activate` ✅
  - Purpose: Activate trip and start GPS tracking simulation
  
- **POST** `/api/v1/tracking/complete` ✅
  - Purpose: Complete trip and stop tracking

### Trip Management
- **POST** `/api/v1/trips/generate` ✅ (Public)
  - Purpose: Generate trips for a given date

### WebSocket (Real-time Tracking)
- **Namespace**: `tracking` 
- **Connection**: `/tracking` WebSocket
- **Events**: `subscribe:trip`, `location:update`, `unsubscribe:trip`, `ping`, `get:active-simulations`

---

## Architecture Mismatch

### Current Frontend Design
- Assumes **Admin Portal** with CRUD operations for all entities
- Expects endpoints for:
  - Listing/managing all drivers, students, buses, routes
  - Analytics and reporting
  - Dashboard summaries

### Actual Backend Design
- **Role-based task workflows**:
  - Drivers can view their own trip for today and manage it
  - Students can view their own trip for today and get bus location
  - Real-time location updates via WebSocket
- **No admin endpoints** for viewing all entities
- **No CRUD endpoints** for master data management
- **Trip generation** is public but trip management is driver-centric

---

## What Admin Portal CAN Build With Current Backend

With the existing endpoints, an admin portal can:
1. ✅ Generate trips for a date → POST `/api/v1/trips/generate`
2. ✅ View real-time bus locations → WebSocket `/tracking`
3. ✅ Monitor driver trips → Requires admin token + access to `/drivers/workflow/today`
4. ✅ Monitor student trips → Requires admin token + access to `/students/workflow/today`

### What Admin Portal CANNOT Build
1. ❌ View all drivers/students/buses/routes (no list endpoints)
2. ❌ Manage drivers (no CRUD endpoints)
3. ❌ Manage students (no CRUD endpoints)  
4. ❌ Manage buses/routes (no CRUD endpoints)
5. ❌ Generate admin reports or analytics
6. ❌ View historical data

---

## Next Steps

### Option 1: Build Backend Admin Endpoints
Create new NestJS controllers for admin operations:
- GET `/api/v1/admin/trips/today` - List all trips for today
- GET `/api/v1/admin/buses/active` - List active buses with locations
- GET `/api/v1/admin/students/today` - List students assigned today
- GET `/api/v1/admin/drivers/today` - List drivers on duty
- GET `/api/v1/admin/routes` - List all routes
- etc.

### Option 2: Build Admin-Scoped Real-time Dashboard
Use existing endpoints to build real-time operational dashboard:
- Trip generation interface
- WebSocket-based live map of all buses
- Ability to view individual driver/student trips
- Real-time tracking without CRUD operations

### Option 3: Hybrid Approach
- Use available endpoints for real-time monitoring (Option 2)
- Flag missing endpoints for future backend development
- Build admin portal for what's actually available now

---

## Recommendation

**Option 2: Real-time Operations Dashboard**

Since the backend is designed for **real-time operations** (driver workflows, live tracking), redesign the admin portal to match:

1. **Dashboard** - Real-time operational view:
   - Trip generator
   - Active buses count
   - WebSocket-based live map
   - Trip status summary

2. **Driver Operations** - Trip management interface:
   - Driver's current trip
   - Passenger list
   - Trip start/end controls

3. **Student View** - Trip tracking:
   - Student's assigned trip
   - Real-time bus location
   - ETA estimation

4. **Real-time Tracking** - WebSocket-based map:
   - All active buses
   - Location updates
   - Trip status indicators

This aligns the **frontend with the actual backend architecture** rather than forcing the backend into a traditional admin portal model.

---

## Summary

- **20+ endpoints called by frontend don't exist** in the backend
- Backend is **task-workflow focused**, not admin-CRUD focused
- Backend prioritizes **real-time operations** over data management
- Frontend needs **fundamental redesign** to match backend reality
