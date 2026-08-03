# BusFlow - Complete Implementation Guide

## 📋 Overview of Changes Implemented

This guide covers all the new features implemented:

1. **Student Issue Reporting** - Students can report problems
2. **Notification History** - View past notifications with filtering
3. **Driver Dashboard** - New PWA for drivers to manage buses
4. **Auto Location Updates** - Drivers' locations update every 10 seconds
5. **Missed Bus Student Details** - Driver sees full info of alternate boarders
6. **Push Notifications** - Real-time phone notifications
7. **PWA Installation** - Install dashboards as standalone apps

---

## 🆘 STUDENT ISSUE REPORTING

### Feature Details
- **Location:** `/report-issue` route in student dashboard
- **Fields:**
  - Issue Type: BUS_ISSUE, DRIVER_ISSUE, ROUTE_ISSUE, APP_ISSUE, OTHER
  - Title: Brief summary (max 100 chars)
  - Description: Detailed info (max 500 chars)
  - Severity: LOW, MEDIUM, HIGH
  
### How It Works
1. Student navigates to "Report Issue" page
2. Fills out the form with details
3. Submits the report
4. Admin receives notification
5. Admin can view and respond to issues

### API Endpoint
```
POST /api/students/issues/report
{
  title: string,
  description: string,
  type: 'BUS_ISSUE' | 'DRIVER_ISSUE' | 'ROUTE_ISSUE' | 'APP_ISSUE' | 'OTHER',
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}
```

---

## 📚 NOTIFICATION HISTORY

### Feature for Students
- **Route:** `/notifications` in student dashboard
- **Shows:** All notifications with filters
- **Filters:**
  - ALL: All notifications
  - UNREAD: Only unread ones
  - DELAY: Delay alerts only
  - ALERT: Critical alerts only

### Feature for Drivers
- **Route:** `/notifications` in driver dashboard
- **Shows:** All driver alerts/notifications
- **Auto-refresh:** Every 30 seconds

### API Endpoints
```
GET /api/students/notifications/history?limit=50
GET /api/drivers/notifications?limit=50
```

### Database
```sql
-- New Table for notification logs
CREATE TABLE notification_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  target_role VARCHAR(50),
  target_users TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚌 DRIVER DASHBOARD (NEW)

### Overview
- **Port:** 3003 (development)
- **Technology:** React (mobile-responsive)
- **Type:** Progressive Web App (PWA)
- **Real-time Updates:** Every 10 seconds

### Main Features

#### 1. **Bus Status Card**
- Shows assigned bus details
- Displays status (Active/Inactive)
- Shows capacity and current occupancy
- Last location update timestamp

#### 2. **Live Map**
- Shows driver's current location
- Bus marker with plate number
- OpenStreetMap tiles
- Pan and zoom support

#### 3. **Auto Location Updates**
- **NO manual update button** (automatic only)
- Updates every 10 seconds
- Uses browser Geolocation API
- Shows update status (updating/live)
- Timestamp of last update

#### 4. **Missed Bus Students** ⭐
When a student misses their primary bus and boards an alternate one, driver sees:

**For Each Student:**
- Name and Student ID
- Program and Semester
- **Original Pickup Stop:** (Where they should have boarded)
  - Stop name
  - GPS coordinates
  - Status: "Student was not at this stop"
  
- **New Boarding Stop (Alternate Bus):** ⭐⭐⭐
  - Stop name
  - GPS coordinates
  - Status indicator if student is at this stop
  
- Full student details in expandable card
- Action buttons: Confirm Boarding, Contact Student

#### 5. **Passenger List**
- **Boarding Soon:** Students waiting at pickup points
- **Already Boarded:** Students on the bus
- Shows student name and ID
- Status badges
- Scrollable list (max 10 visible)

#### 6. **Notification Center**
- Recent alerts (last 5)
- Shows message and timestamp
- Link to view all notifications

#### 7. **Bottom Navigation** (Mobile)
- Home icon
- Update Location (manual force update)
- Alerts
- Logout

### Routes
```
/                 - Dashboard (protected)
/login            - Login page (public)
/notifications    - Notification history (protected)
```

### Database Changes Required
```sql
-- Add to bus table
ALTER TABLE bus ADD COLUMN current_driver_id UUID;
ALTER TABLE bus ADD COLUMN last_location_update TIMESTAMP;

-- New table for location history
CREATE TABLE bus_location_history (
  id SERIAL PRIMARY KEY,
  bus_id UUID NOT NULL,
  driver_id UUID,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy INT,
  speed INT,
  updated_by VARCHAR(50), -- MANUAL, GPS, SIMULATOR
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (bus_id) REFERENCES bus(id),
  FOREIGN KEY (driver_id) REFERENCES driver(id)
);

-- Missed bus tracking
CREATE TABLE missed_bus_students (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL,
  original_bus_id UUID,
  original_stop_id UUID,
  alternate_bus_id UUID,
  alternate_stop_id UUID,
  status VARCHAR(50), -- MISSED, BOARDED_ALTERNATE, RESOLVED
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES student(id),
  FOREIGN KEY (original_bus_id) REFERENCES bus(id),
  FOREIGN KEY (alternate_bus_id) REFERENCES bus(id)
);
```

---

## 📍 AUTO LOCATION UPDATES (Every 10 Seconds)

### How It Works

```
Driver Dashboard Loads
    ↓
Geolocation API is initialized
    ↓
Every 10 seconds:
├─ Get current GPS coordinates
├─ Send to: POST /api/driver/bus/{busId}/location
├─ Backend stores in database
└─ WebSocket broadcast to:
   ├─ Student Dashboard (updates map)
   ├─ Admin Dashboard (tracks drivers)
   └─ Other drivers (if needed)
```

### API Endpoint
```
POST /api/driver/bus/{busId}/location
{
  latitude: number,
  longitude: number,
  accuracy: number,
  timestamp: string (ISO),
  updatedBy: 'GEOLOCATION' | 'MANUAL' | 'SIMULATOR'
}
```

### Code Implementation
```typescript
// In DriverDashboard.tsx
useEffect(() => {
  const interval = setInterval(updateLocation, 10000); // 10 seconds
  return () => clearInterval(interval);
}, []);

const updateLocation = async () => {
  if (!location || !bus) return;
  try {
    await driverApi.updateLocation(location.latitude, location.longitude);
    setLastUpdate(new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Failed to update location:', error);
  }
};
```

---

## 📱 PWA INSTALLATION

### What is PWA?
PWA (Progressive Web App) allows users to install web apps on their devices like native apps.

### Installation Steps for Users

#### **Android**
1. Open the dashboard in Chrome/Android browser
2. Tap **⋯** (menu icon) in the address bar
3. Select **"Install app"** or **"Add to Home screen"**
4. Confirm installation
5. App appears on home screen with icon

#### **iOS**
1. Open the dashboard in Safari
2. Tap **Share** button (⬆️) at bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** to confirm
5. App appears on home screen

#### **Desktop (Windows/Mac)**
1. Open the dashboard in Chrome/Edge
2. Look for install icon in the address bar
3. Click the install button
4. Confirm installation
5. App is added to applications menu

### Browser Support
- ✅ Chrome (Android & Desktop)
- ✅ Edge (Windows & Mac)
- ✅ Safari (iOS)
- ✅ Firefox (Desktop)
- ⚠️ Opera (Mobile & Desktop)

### Files Involved
```
public/
├─ manifest.json          ← App metadata
└─ service-worker.js      ← Offline support & push notifications

src/
├─ services/
│  ├─ pwaService.ts       ← PWA management
│  └─ notificationService.ts ← Push notifications
```

### manifest.json Contents
```json
{
  "name": "BusFlow...",
  "short_name": "BusFlow",
  "display": "standalone",    ← Remove browser UI
  "icons": [...],            ← Home screen icon
  "start_url": "/",          ← App entry point
  "scope": "/",              ← App scope
  "theme_color": "#3b82f6",  ← Status bar color
  "shortcuts": [...]         ← Quick actions
}
```

---

## 🔔 PUSH NOTIFICATIONS

### How It Works

```
Browser                    Backend                    Phone
  │                          │                          │
  ├─ Request permission      │                          │
  │  (user approves)         │                          │
  │                          │                          │
  ├─ Register Service Worker │                          │
  │                          │                          │
  ├─ Subscribe to Push       │                          │
  │  (gets token)            │                          │
  │                          │                          │
  ├─ Send token to Backend   │                          │
  │────────────────────────→ │                          │
  │                          ├─ Store token in DB      │
  │                          │                          │
  │                          │                          │
  │   Admin sends            │                          │
  │   notification           │                          │
  │                          ├─ Send via Web Push      │
  │                          │  (uses token)           │
  │                          │────────────────────────→│
  │                          │                          │
  │  Receives notification   │                          ├─ Shows notification
  │  on lock screen          │                          │  on lock screen
  │                          │                          │
  │ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← │
```

### Permission Request
```typescript
import { notificationService } from './services/notificationService';

// Request permission (shown to user first time)
const permission = await notificationService.requestPermission();

// Check permission status
if (notificationService.hasPermission()) {
  // Subscribe to push
  await notificationService.subscribeToPushNotifications(userId, 'STUDENT');
}
```

### Browser Notifications (App Open)
```typescript
notificationService.showBrowserNotification(
  'Bus Delayed',
  { body: 'Your bus is delayed by 15 minutes' }
);
```

### Push Notifications (App Closed)
- Handled by Service Worker
- Shows on lock screen
- With sound and vibration

### Notification Types Shown
- **Delays:** ⏱️ Bus is running late
- **Status Updates:** 📊 Trip status changed
- **Alerts:** 🚨 Critical issues
- **General:** 📢 Other announcements

---

## 🔐 UNIFIED AUTHENTICATION (Netlify)

### Single Login Screen for All Roles

**URL:** `https://busflow.netlify.app/login`

```
User enters credentials
    ↓
Backend validates
    ↓
Returns role (ADMIN, STUDENT, DRIVER)
    ↓
Role-based redirect:
├─ ADMIN  → https://admin.busflow.netlify.app
├─ STUDENT → https://student.busflow.netlify.app
└─ DRIVER  → https://driver.busflow.netlify.app
```

### Test Credentials
```
Student:
Email:    CTU1001@busflow.com
Password: demo-password

Driver:
Email:    DRV-001@busflow.com
Password: demo-password

Admin:
Email:    ADMIN@busflow.com
Password: demo-password
```

---

## 📊 DATABASE SCHEMA UPDATES

### New Tables

```sql
-- Issue Reports
CREATE TABLE student_issues (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'OPEN',
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES student(id)
);

-- Notification Logs
CREATE TABLE notification_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  target_role VARCHAR(50),
  target_users TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (admin_id) REFERENCES "user"(id)
);

-- Device Tokens (for Push Notifications)
CREATE TABLE device_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- Bus Location History
CREATE TABLE bus_location_history (
  id SERIAL PRIMARY KEY,
  bus_id UUID NOT NULL,
  driver_id UUID,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy INT,
  speed INT,
  updated_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (bus_id) REFERENCES bus(id),
  FOREIGN KEY (driver_id) REFERENCES driver(id)
);

-- Missed Bus Tracking
CREATE TABLE missed_bus_students (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL,
  original_bus_id UUID,
  original_stop_id UUID,
  alternate_bus_id UUID,
  alternate_stop_id UUID,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES student(id),
  FOREIGN KEY (original_bus_id) REFERENCES bus(id),
  FOREIGN KEY (alternate_bus_id) REFERENCES bus(id)
);

-- Driver Notifications
CREATE TABLE driver_notifications (
  id SERIAL PRIMARY KEY,
  driver_id UUID NOT NULL,
  message TEXT,
  type VARCHAR(50),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (driver_id) REFERENCES driver(id)
);
```

---

## 🚀 DEPLOYMENT

### Netlify Deployments

```
https://busflow.netlify.app/              ← Unified Login
https://admin.busflow.netlify.app/        ← Admin Dashboard
https://student.busflow.netlify.app/      ← Student Dashboard
https://driver.busflow.netlify.app/       ← Driver Dashboard
```

### Environment Variables Required

```env
# Student Dashboard
REACT_APP_API_URL=https://api.busflow.com
REACT_APP_VAPID_PUBLIC_KEY=<vapid_key>

# Driver Dashboard
REACT_APP_API_URL=https://api.busflow.com
REACT_APP_VAPID_PUBLIC_KEY=<vapid_key>

# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
VAPID_PRIVATE_KEY=...
VAPID_PUBLIC_KEY=...
```

---

## ✅ CHECKLIST FOR JURY

- ✅ Students can report issues with details
- ✅ View notification history with filtering
- ✅ Driver dashboard for real-time management
- ✅ Auto location updates every 10 seconds
- ✅ Detailed missed bus student information
- ✅ Push notifications on phone screens
- ✅ PWA installation for home screen
- ✅ Unified authentication for all roles
- ✅ Mobile-responsive design
- ✅ Real-time WebSocket updates

---

## 📞 Support

For questions or issues, contact: support@busflow.com

**Last Updated:** August 3, 2026
