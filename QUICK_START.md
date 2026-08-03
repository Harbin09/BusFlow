# BusFlow - Quick Start Guide

## 🚀 Fastest Way to Start

### Option 1: Automated Script (Recommended)
```powershell
.\START_ALL.ps1
```
This opens 3 new terminal windows and starts everything automatically.

---

### Option 2: Manual Launch (3 Terminal Windows)

**Copy and paste each command into a separate terminal:**

#### Terminal 1 - Backend API
```powershell
cd BusFlow/backend
npm run start:dev
```

#### Terminal 2 - Admin Dashboard
```powershell
cd BusFlow/frontend/admin-dashboard-frontend
npm run dev
```

#### Terminal 3 - Student Dashboard
```powershell
cd BusFlow/frontend/student-dashboard-frontend/apps/student-portal
$env:PORT=3001
npm start
```

---

## 📍 Access Points

| Service | URL | Status |
|---------|-----|--------|
| Student Dashboard | http://localhost:3001 | Auto-logs in ✅ |
| Admin Dashboard | http://localhost:3000 | Manual login |
| Backend API | http://localhost:5000 | API Server |

---

## 🔐 Test Credentials

**Student Account:**
- Email: `CTU1001@busflow.com`
- Password: `demo-password`

**Driver Account:**
- Email: `DRV-001@busflow.com`
- Password: `demo-password`

---

## ⚙️ One-Time Setup (Run Once Only)

If this is your first time or you reset the database:

```powershell
# Install dependencies (one-time)
cd BusFlow/backend
npm install

cd ../frontend/admin-dashboard-frontend
npm install

cd ../student-dashboard-frontend/apps/student-portal
npm install

# Setup database (one-time)
cd BusFlow/backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 🔧 Troubleshooting

### Port Already in Use?
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Not Found?
```powershell
# For the service with error:
rm -r node_modules
npm install
```

### 401 Errors in Student Dashboard?
```powershell
# Backend might not be running, ensure it's started first
# Or reseed the database:
cd BusFlow/backend
npx prisma db seed
```

### Clear Browser Cache
- Press `F12` → Application → Local Storage → Clear All
- Refresh page with `Ctrl+Shift+R`

---

## 📋 Service Status Checklist

After launching, verify:

- [ ] Backend terminal shows: `NestApplication successfully started`
- [ ] Admin Dashboard terminal shows: `Local: http://localhost:3000`
- [ ] Student Dashboard terminal shows: `On Your Network`
- [ ] Student Dashboard at http://localhost:3001 loads without 401 errors
- [ ] Can access http://localhost:3000 for admin dashboard

---

## 💡 Pro Tips

1. **Keep terminals open** - Services keep running as long as terminal is open
2. **Separate windows** - Use different terminal windows for each service
3. **Read error messages** - First line usually tells you what's wrong
4. **Refresh browser** - If page looks broken, hard refresh with `Ctrl+Shift+R`
5. **Check port** - If service won't start, something else is using the port

---

## 📞 Still Need Help?

1. Check `STARTUP_GUIDE.md` for detailed instructions
2. Check terminal output - error messages are helpful
3. Verify Node.js is installed: `node --version`
4. Verify npm is installed: `npm --version`
5. Try restarting the service

---

**Last Updated:** August 3, 2026
