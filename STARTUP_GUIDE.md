# BusFlow Dashboards - Complete Startup Guide

## Overview
This guide will help you launch the entire BusFlow system with three components:
- **Backend API** (NestJS) - Port 5000
- **Admin Dashboard** (Next.js) - Port 3000
- **Student Dashboard** (React) - Port 3001

---

## Prerequisites

Before starting, ensure you have:
1. **Node.js** installed (v18+)
2. **npm** installed
3. **PostgreSQL** running locally or via Docker
4. Environment files properly configured

Check if Node.js is installed:
```bash
node --version
npm --version
```

---

## Step-by-Step Startup Instructions

### Step 1: Verify Environment Setup

#### 1.1 Backend Environment
Navigate to `BusFlow/backend` and check/create `.env` file:

**Required variables:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/busflow
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=5000
```

**To check if DATABASE_URL is set:**
```powershell
$env:DATABASE_URL
```

#### 1.2 Student Dashboard Environment
Navigate to `BusFlow/frontend/student-dashboard-frontend/apps/student-portal` and check `.env.local` (if needed):

```
REACT_APP_API_URL=http://localhost:5000/api/v1
```

**Note:** This app uses PORT 3001 by default

#### 1.3 Admin Dashboard Environment
Navigate to `BusFlow/frontend/admin-dashboard-frontend` and check `.env.local` (if needed):

Default uses PORT 3000

---

### Step 2: Database Setup

#### 2.1 Run Database Migrations
```powershell
cd BusFlow/backend
npx prisma migrate deploy
```

**Expected output:** ✓ Database migrated successfully

#### 2.2 Seed Database with Test Data
```powershell
cd BusFlow/backend
npx prisma db seed
```

**Expected output:**
```
Seeding Database...
Seeding Drivers...
Seeding Buses...
...
✓ Updated password for CTU1001@busflow.com
✓ Updated password for CTU1002@busflow.com
✓ Updated password for CTU1300@busflow.com
Demo password set for all accounts: demo-password
Seeding completed.
```

**Test Credentials Created:**
- Student: `CTU1001@busflow.com` / `demo-password`
- Student: `CTU1002@busflow.com` / `demo-password`
- Driver: `DRV-001@busflow.com` / `demo-password`

---

### Step 3: Install Dependencies

#### 3.1 Backend Dependencies
```powershell
cd BusFlow/backend
npm install
```

#### 3.2 Admin Dashboard Dependencies
```powershell
cd BusFlow/frontend/admin-dashboard-frontend
npm install
```

#### 3.3 Student Dashboard Dependencies
```powershell
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
npm install
```

---

### Step 4: Launch Services

**⚠️ IMPORTANT:** Launch in this order for best results

#### 4.1 Start Backend API (Port 5000)
```powershell
cd BusFlow/backend
npm run start:dev
```

**Wait for:** `NestApplication successfully started` message

Expected console output:
```
[Nest] [timestamp] Start  - NestFactory.create()
...
[NestApplication] Listening on port 5000
```

#### 4.2 Start Admin Dashboard (Port 3000)
Open a **NEW PowerShell window** and run:
```powershell
cd BusFlow/frontend/admin-dashboard-frontend
npm run dev
```

**Wait for:** `Local: http://localhost:3000` message

#### 4.3 Start Student Dashboard (Port 3001)
Open **ANOTHER NEW PowerShell window** and run:
```powershell
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
$env:PORT=3001
npm start
```

**Wait for:** Browser opens or shows `On Your Network: http://localhost:3001`

---

## Step 5: Access the Dashboards

Once all three services are running:

1. **Admin Dashboard:** http://localhost:3000
2. **Student Dashboard:** http://localhost:3001
   - Auto-logs in as `CTU1001@busflow.com` in development
   - No manual login needed
3. **Backend API:** http://localhost:5000
   - API Swagger Docs: http://localhost:5000/api/docs (if available)

---

## Troubleshooting

### Issue: "Port already in use"
**Solution:** Kill the process on that port

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: "Database connection failed"
**Solution:** Verify DATABASE_URL environment variable

```powershell
# Check if environment variable is set
$env:DATABASE_URL

# If empty, set it manually
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/busflow"
```

### Issue: "Cannot find module" errors
**Solution:** Reinstall dependencies

```powershell
# For the specific component:
cd <component-path>
rm -r node_modules
npm install
```

### Issue: Student Dashboard shows 401 errors
**Cause:** Backend not running or database not seeded

**Solution:**
1. Ensure backend is running (`npm run start:dev` in BusFlow/backend)
2. Verify database is seeded:
   ```powershell
   cd BusFlow/backend
   npx prisma db seed
   ```
3. Clear browser localStorage:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Clear all entries
   - Refresh page

### Issue: Admin Dashboard shows blank page
**Solution:**
1. Check browser console for errors (F12)
2. Ensure backend is running
3. Try hard refresh: Ctrl+Shift+R

### Issue: "PRISMA_DATABASE_URL not set"
**Solution:** Add to your system environment or .env file

```powershell
# Permanent (requires restart):
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://...", "User")

# Temporary (current session only):
$env:DATABASE_URL = "postgresql://..."
```

---

## Quick Command Reference

### One-Time Setup
```powershell
# Backend setup
cd BusFlow/backend
npm install
npx prisma migrate deploy
npx prisma db seed

# Admin Dashboard setup
cd BusFlow/frontend/admin-dashboard-frontend
npm install

# Student Dashboard setup
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
npm install
```

### Daily Startup (3 Terminal Windows)

**Terminal 1 - Backend:**
```powershell
cd BusFlow/backend
npm run start:dev
```

**Terminal 2 - Admin Dashboard:**
```powershell
cd BusFlow/frontend/admin-dashboard-frontend
npm run dev
```

**Terminal 3 - Student Dashboard:**
```powershell
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
$env:PORT=3001
npm start
```

---

## Accessing the Applications

| Service | URL | Auto-Login? | Manual Login |
|---------|-----|-------------|--------------|
| Student Dashboard | http://localhost:3001 | ✅ Yes (Dev Mode) | N/A |
| Admin Dashboard | http://localhost:3000 | ❌ No | Depends on Auth |
| Backend API | http://localhost:5000 | N/A | Via Login Endpoint |

---

## Development Credentials

**Always use these for testing:**

### Students
- Email: `CTU1001@busflow.com`
- Email: `CTU1002@busflow.com`
- Email: `CTU1300@busflow.com`
- Password: `demo-password` (all)

### Drivers
- Email: `DRV-001@busflow.com`
- Email: `DRV-002@busflow.com`
- Email: `DRV-007@busflow.com`
- Password: `demo-password` (all)

---

## Notes

- ✅ Student Dashboard auto-logs in during development
- ✅ Backend must be running before dashboards make API calls
- ✅ Always use separate terminal windows for each service
- ✅ Database seed only needs to run once (unless you reset DB)
- ✅ Environment variables should be set before launching services
- ✅ All three services can run simultaneously without conflict

---

## Still Having Issues?

1. Check the browser console (F12) for error messages
2. Check the terminal output where the service is running
3. Verify all services are in their correct directories
4. Ensure Node.js and npm are in PATH: `node --version` && `npm --version`
5. Restart the problematic service
6. If persistence: delete `node_modules` and reinstall with `npm install`

---

**Last Updated:** August 3, 2026
