# BusFlow Setup Verification Checklist

Complete this checklist before launching the dashboards.

---

## ✅ System Requirements

- [ ] Windows 10 or later (or equivalent OS)
- [ ] Node.js v18+ installed
- [ ] npm installed
- [ ] PostgreSQL running locally

**Verify:** Run these commands in PowerShell:
```powershell
node --version
npm --version
```

---

## ✅ Project Structure

- [ ] `BusFlow/backend/` exists
- [ ] `BusFlow/frontend/admin-dashboard-frontend/` exists
- [ ] `BusFlow/frontend/student-dashboard-frontend/apps/student-portal/` exists
- [ ] `STARTUP_GUIDE.md` exists in project root
- [ ] `QUICK_START.md` exists in project root
- [ ] `START_ALL.ps1` exists in project root
- [ ] `START_ALL.bat` exists in project root

---

## ✅ Environment Configuration

### Backend (.env)
Location: `BusFlow/backend/.env`

Check if file exists and contains:
```
DATABASE_URL=postgresql://user:password@localhost:5432/busflow
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=5000
```

- [ ] `.env` file exists in `BusFlow/backend/`
- [ ] DATABASE_URL is set correctly
- [ ] JWT_SECRET is set (any value works for dev)

**To verify:**
```powershell
cat BusFlow/backend/.env
```

### Frontend Environments (Optional)
These should work with defaults, but verify:

- [ ] Admin Dashboard: `BusFlow/frontend/admin-dashboard-frontend/` (uses port 3000)
- [ ] Student Portal: `BusFlow/frontend/student-dashboard-frontend/apps/student-portal/` (uses port 3001)

---

## ✅ Dependencies Installation

- [ ] Backend dependencies installed
  ```powershell
  # Verify node_modules exists
  Test-Path BusFlow/backend/node_modules
  ```

- [ ] Admin Dashboard dependencies installed
  ```powershell
  Test-Path BusFlow/frontend/admin-dashboard-frontend/node_modules
  ```

- [ ] Student Dashboard dependencies installed
  ```powershell
  Test-Path BusFlow/frontend/student-dashboard-frontend/apps/student-portal/node_modules
  ```

**If any show FALSE, run:**
```powershell
# For backend
cd BusFlow/backend
npm install

# For admin dashboard
cd BusFlow/frontend/admin-dashboard-frontend
npm install

# For student dashboard
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
npm install
```

---

## ✅ Database Setup

### Migrations
- [ ] Database migrations completed
  ```powershell
  cd BusFlow/backend
  npx prisma migrate deploy
  ```
  
  **Expected output:** `✓ Database migrated successfully` or `Already at latest migration`

### Seed Data
- [ ] Database seeded with test data
  ```powershell
  cd BusFlow/backend
  npx prisma db seed
  ```
  
  **Expected output:**
  ```
  Seeding Database...
  ...
  ✓ Updated password for CTU1001@busflow.com
  ✓ Updated password for CTU1002@busflow.com
  ✓ Updated password for CTU1300@busflow.com
  Demo password set for all accounts: demo-password
  Seeding completed.
  ```

---

## ✅ Port Availability

Before launching, verify ports are free:

```powershell
# Check port 5000 (Backend)
netstat -ano | findstr :5000

# Check port 3000 (Admin Dashboard)
netstat -ano | findstr :3000

# Check port 3001 (Student Dashboard)
netstat -ano | findstr :3001
```

- [ ] Port 5000 is free (or noted if already used)
- [ ] Port 3000 is free (or noted if already used)
- [ ] Port 3001 is free (or noted if already used)

**If ports are in use:**
```powershell
# Find and kill process (replace PID)
taskkill /PID <PID> /F
```

---

## ✅ Code Changes Verification

These changes should already be applied:

- [ ] Student Dashboard App.tsx includes auto-login logic
  ```powershell
  # Verify by checking if file contains "Auto-login"
  Select-String "Auto-login" BusFlow/frontend/student-dashboard-frontend/apps/student-portal/src/App.tsx
  ```

---

## 🚀 Ready to Launch?

If all checkboxes above are checked:

### Option 1: Automated (Easiest)
```powershell
.\START_ALL.ps1
```
or
```
Double-click START_ALL.bat
```

### Option 2: Manual (3 Terminal Windows)

**Terminal 1:**
```powershell
cd BusFlow/backend
npm run start:dev
```

**Terminal 2:**
```powershell
cd BusFlow/frontend/admin-dashboard-frontend
npm run dev
```

**Terminal 3:**
```powershell
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
$env:PORT=3001
npm start
```

---

## ✅ Post-Launch Verification

After launching, verify everything works:

- [ ] Backend terminal shows success message
- [ ] Admin Dashboard opens at http://localhost:3000
- [ ] Student Dashboard opens at http://localhost:3001
- [ ] Student Dashboard loads data without 401 errors
- [ ] Browser console shows "Auto-logged in with test credentials"

**Test URLs:**
- Student Dashboard: http://localhost:3001
- Admin Dashboard: http://localhost:3000
- Backend Health: http://localhost:5000/api

---

## 🆘 If Something Goes Wrong

1. **Check port usage:**
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Check Node.js:**
   ```powershell
   node --version
   npm --version
   ```

3. **Verify .env file:**
   ```powershell
   cat BusFlow/backend/.env
   ```

4. **Rebuild dependencies:**
   ```powershell
   rm -r BusFlow/backend/node_modules
   cd BusFlow/backend
   npm install
   ```

5. **Reseed database:**
   ```powershell
   cd BusFlow/backend
   npx prisma db seed
   ```

---

## 📝 Notes

- Keep all three terminals open while developing
- Services auto-restart on file changes (except database changes)
- Ctrl+C in terminal stops that service
- Database seeding only needs to run once
- Auto-login works in development mode only

---

**Checklist Date:** August 3, 2026
**Status:** Ready for daily use

