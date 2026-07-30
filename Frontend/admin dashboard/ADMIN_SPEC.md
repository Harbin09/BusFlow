# ADMIN_SPEC.md — BusFlow Admin Dashboard Specification

## 🎯 Admin Dashboard Goal
Enable the Transport Manager to manage buses, monitor operations, communicate with students, and make informed decisions from a single dashboard. As the operational heart of **BusFlow**, the Admin Dashboard drives all real-time data feeding into the Student and Driver client applications.

---

## 🏗️ System Architecture

```text
                           Admin Dashboard
                           ┌──────────────┐
                           │   Dashboard  │
                           └──────┬───────┘
                                  │
     ┌────────────────────────────┼────────────────────────────┐
     ▼                            ▼                            ▼
 Fleet Management            Route Management            User Management
     │                            │                            │
     └────────────────────────────┼────────────────────────────┘
                                  ▼
                         Real-Time Monitoring
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
 Notifications             Weather Alerts               Analytics
```

---

## 🗂️ Sidebar Navigation Structure

* 🏠 **Dashboard** (Overview & Key Metrics)
* 🚌 **Fleet** (Bus Allocation & Status)
* 🗺️ **Routes** (Route & Stop Management)
* 📍 **Live Tracking** (Real-Time GPS Map)
* 👨‍🎓 **Students** (Student Directory & Stop Assigns)
* 👨‍✈️ **Drivers** (Driver Roster & Licenses)
* 📅 **Timetable** (Schedule CSV Import & Sync)
* 🌧️ **Weather** (Dawn Weather Monitor & Trigger)
* 📢 **Notifications** (Broadcast Console)
* 📊 **Analytics** (Operational Reports)
* ⚙️ **Settings** (System Configuration)

---

## 🧩 Module Breakdown

### Module 1 — Dashboard (Landing Page)
* **KPI Cards:** Active Buses, Total Students, Today's Trips, Delayed Buses, Weather Status, RSVP Count.
* **Live Map:** Interactive Google Maps view rendering current bus locations and real-time ETAs.
* **Today's Summary:** High-level metrics bar (e.g., `18 Buses Running | 6 Routes | 1278 Students | 2 Delayed | Rain Alert Active`).

### Module 2 — Fleet Management
* **Capabilities:** View, Add, Edit, Enable/Disable buses; assign driver and route.
* **Data Schema Example:** `Bus 12` | Driver: `Rajesh` | Route: `R3` | Capacity: `50` | Status: `Running`.

### Module 3 — Route Management
* **Workflow:** Create Route $ightarrow$ Add Stops $ightarrow$ Assign Bus $ightarrow$ Schedule Times.
* **Table View:** Route Name, Stops List, Total Distance, Assigned Bus, Assigned Driver.

### Module 4 — Live Tracking ⭐
* **Core Value:** Real-time driver GPS stream rendered on Google Maps showing current speed, dynamic ETA, and delay status (e.g., `Bus 4` | `Moving` | `ETA: 8:32 AM` | `Delay: 4 min`).

### Module 5 — Student Management
* **Import Workflow:** Upload CSV $ightarrow$ FastAPI Batch Parser $ightarrow$ DB Record Creation.
* **Capabilities:** View, Edit, Deactivate students; assign primary bus stops and routes.

### Module 6 — Driver Management
* **Capabilities:** Register Driver, Assign Bus, Upload License, Contact Number, Track Status.

### Module 7 — Timetable Upload
* **Workflow:** Upload Academic CSV $ightarrow$ FastAPI Parser $ightarrow$ Database Schedule Mapping.
* **Admin View:** Filterable schedule table by Department, Semester, Section, and Class start times.

### Module 8 — Weather Intelligence
* **Capabilities:** Dawn weather poller, precipitation probability tracker, route vulnerability mapping, estimated delay calculator.
* **Actions:** Manual / Automated "Send Rain Alert" push trigger.

### Module 9 — Notifications & Broadcast
* **Capabilities:** Broadcast message to All Students, Specific Route, Specific Bus, or Drivers.
* **Example:** Select `Route R2` $ightarrow$ Broadcast: *"Bus 4 delayed by 15 mins due to heavy rain."*

### Module 10 — Analytics (MVP Scope)
* **Charts & Indicators:** Daily Trips, Bus Capacity Utilization, Delay Logs, Attendance Metrics, Route Performance.

---

## 🛠️ Required Backend APIs (FastAPI)

| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/api/v1/dashboard/summary` | `GET` | Fetch KPI cards & today's summary |
| | `/api/v1/dashboard/map` | `GET` | Fetch initial map markers and statuses |
| **Fleet** | `/api/v1/buses` | `GET`, `POST` | List all buses / Add new bus |
| | `/api/v1/buses/{id}` | `PUT`, `DELETE` | Update bus details / Disable bus |
| **Routes** | `/api/v1/routes` | `GET`, `POST` | List all routes / Create route |
| | `/api/v1/routes/{id}` | `PUT`, `DELETE` | Update route / Delete route |
| **Students** | `/api/v1/students` | `GET`, `POST` | List students / Upload student CSV |
| | `/api/v1/students/{id}` | `PUT`, `DELETE` | Update student / Deactivate account |
| **Drivers** | `/api/v1/drivers` | `GET`, `POST` | List drivers / Register driver |
| | `/api/v1/drivers/{id}` | `PUT` | Update driver info & assigned bus |
| **Tracking** | `/api/v1/tracking/live` | `GET` | Fetch current active positions |
| | `/ws/tracking/ws` | `WebSocket` | Real-time GPS stream broadcast |
| **Timetable** | `/api/v1/timetable/upload` | `POST` | Upload & parse timetable CSV |
| | `/api/v1/timetable` | `GET` | Fetch mapped schedules |
| **Weather** | `/api/v1/weather` | `GET` | Fetch current weather data & forecasts |
| | `/api/v1/weather/check` | `POST` | Trigger rain delay evaluation engine |
| **Notifications**| `/api/v1/notifications/send` | `POST` | Dispatch target push notification |
| | `/api/v1/notifications` | `GET` | Fetch notification history |

---

## 🗄️ Database Tables Required (SQLAlchemy)

1. `users` (System User Accounts)
2. `roles` (RBAC: Admin, Driver, Student)
3. `routes` (Bus Routes & Paths)
4. `stops` (Geographic Bus Stops)
5. `buses` (Vehicle Fleet Metadata)
6. `drivers` (Driver Profiles & Licenses)
7. `trips` (Active & Historical Trips)
8. `gps_logs` (Historical & Real-Time Coordinates)
9. `timetables` (Academic Schedules)
10. `notifications` (Broadcast & Push Logs)
11. `weather_logs` (Dawn Weather Cache & Alerts)

---

## 📅 Suggested Development Order (10-Day Sprint Plan)

* **Phase 1 — Foundation (Days 1–2):** Admin Auth, Dashboard Layout, Sidebar & Navigation, Database Setup.
* **Phase 2 — Core Operations (Days 3–5):** Fleet Management, Route Management, Student Management, Driver Management.
* **Phase 3 — Real-Time & Alerts (Days 6–8):** Timetable Upload, Live GPS Tracking, Notifications Engine, Weather Trigger Script.
* **Phase 4 — Dashboard & Polish (Days 9–10):** Analytics Charts, Live KPI Cards, Route Map Integration, End-to-End Testing.

---

## 🎯 Hackathon Focus (End-to-End Demo Workflow)

To maximize pitch impact, implement and demonstrate this primary end-to-end user path:
1. **Admin CSV Upload:** Import students and academic timetables via CSV.
2. **Resource Allocation:** Create route `R2` and assign bus `BUS-102` + driver `Rajesh`.
3. **Trip Activation:** Driver starts trip via browser; live GPS coordinates stream over WebSocket.
4. **Student Client View:** Student sees live map marker and updated arrival ETA.
5. **Weather Alert Trigger:** Admin clicks `/api/v1/weather/check` to simulate rain $ightarrow$ ETA adjusts by $+15$ mins and fires push notification.
6. **Command Center Control:** Admin monitors trip status, live coordinates, and alert status from the Dashboard.
