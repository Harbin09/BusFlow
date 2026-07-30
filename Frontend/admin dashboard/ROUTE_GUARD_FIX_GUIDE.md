# Route Guard Fix - Testing Guide

**Issue:** Dashboard switching between admin and student/driver after login  
**Root Cause:** `/admin/layout.tsx` was checking for ADMIN role, blocking non-admin users  
**Status:** ✅ FIXED

---

## What Was Wrong

```
Routes Structure:
/admin/layout.tsx (checks: MUST be ADMIN)
  ├─ /admin/page.tsx (admin dashboard)
  ├─ /admin/driver/layout.tsx (checks: MUST be DRIVER)
  │   └─ /admin/driver/page.tsx
  └─ /admin/student/layout.tsx (checks: MUST be STUDENT)
      └─ /admin/student/page.tsx

Problem:
When DRIVER visits /admin/driver:
1. Hits /admin/layout.tsx
2. Checks: hasRole('ADMIN') = false
3. Redirects to /login immediately ❌
4. Never reaches /admin/driver/layout.tsx
```

---

## The Fix

### File 1: `/admin/layout.tsx` (Line 27-36)

**BEFORE:**
```typescript
useEffect(() => {
  setLastUpdated(new Date().toLocaleTimeString());

  if (!isAuthenticated() || !hasRole('ADMIN')) {  // ❌ Blocks everyone except ADMIN
    router.replace('/login');
    return;
  }
  setUser(getUser());
  setIsLoading(false);
}, []);
```

**AFTER:**
```typescript
useEffect(() => {
  setLastUpdated(new Date().toLocaleTimeString());

  // Check if user is authenticated (don't check role here - child routes will check)
  if (!isAuthenticated()) {
    router.replace('/login');
    return;
  }

  // If on main /admin page (not /admin/driver or /admin/student), check for ADMIN role
  if (pathname === '/admin' && !hasRole('ADMIN')) {
    router.replace('/login');
    return;
  }

  setUser(getUser());
  setIsLoading(false);
}, [pathname]);  // ✅ Re-run when pathname changes
```

**Key Changes:**
- ✅ Removed blanket ADMIN check
- ✅ Only check ADMIN for `/admin` route
- ✅ Added `[pathname]` to dependency array to re-check on route change

### File 2: `/admin/driver/layout.tsx` (Line 16-23)

**BEFORE:**
```typescript
useEffect(() => {
  if (!isAuthenticated() || !hasRole('DRIVER')) {
    router.replace('/login');
    return;
  }
  setUser(getUser());
  setIsLoading(false);
}, []);  // ❌ Empty dependency array - only runs once on mount
```

**AFTER:**
```typescript
useEffect(() => {
  if (!isAuthenticated() || !hasRole('DRIVER')) {
    router.replace('/login');
    return;
  }
  setUser(getUser());
  setIsLoading(false);
}, [router]);  // ✅ Runs whenever router changes
```

### File 3: `/admin/student/layout.tsx` (Line 16-23)

**Same fix as driver layout** - Changed dependency from `[]` to `[router]`

---

## New Route Flow

### When DRIVER logs in and visits /admin/driver:

```
DRIVER visits /admin/driver
        ↓
1. /admin/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: pathname === '/admin'? NO (it's /admin/driver)
   - Skip ADMIN check
   - Render children ✅
        ↓
2. /admin/driver/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: hasRole('DRIVER') = true ✅
   - Render driver layout
   - Show Driver Portal ✅
```

### When STUDENT logs in and visits /admin/student:

```
STUDENT visits /admin/student
        ↓
1. /admin/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: pathname === '/admin'? NO (it's /admin/student)
   - Skip ADMIN check
   - Render children ✅
        ↓
2. /admin/student/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: hasRole('STUDENT') = true ✅
   - Render student layout
   - Show Student Portal with Map ✅
```

### When ADMIN visits /admin:

```
ADMIN visits /admin
        ↓
1. /admin/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: pathname === '/admin'? YES
   - Check: hasRole('ADMIN') = true ✅
   - Render children ✅
        ↓
2. /admin/page.tsx renders
   - Admin Dashboard loads ✅
```

### When non-ADMIN tries to visit /admin:

```
STUDENT visits /admin directly
        ↓
1. /admin/layout.tsx runs
   - Check: isAuthenticated() = true ✅
   - Check: pathname === '/admin'? YES
   - Check: hasRole('ADMIN') = false ❌
   - Redirects to /login ✅
```

---

## Test Instructions

### Test 1: Admin Login (Should work normally)

```
1. Open http://localhost:3000/login
2. Click "admin@busflow.com"
3. Click "Sign In"
4. Expected: ✅ Go to /admin
5. Expected: ✅ See Admin Dashboard with sidebar
6. Expected: ✅ Can access Fleet, Routes, Students, Drivers
7. Expected: ✅ Logout button works
```

### Test 2: Driver Login (THE KEY TEST - This was broken)

```
1. Open http://localhost:3000/login
2. Click "driver@busflow.com"
3. Click "Sign In"
4. Expected: ✅ Go to /admin/driver
5. Expected: ✅ See Driver Portal (no sidebar)
6. Expected: ✅ Stay on driver page (no switching to admin)
7. Expected: ✅ Can click logout
8. Try to visit /admin directly
9. Expected: ✅ Blocked - redirected to /login
```

### Test 3: Student Login (THE KEY TEST - This was broken)

```
1. Open http://localhost:3000/login
2. Click "student@busflow.com"
3. Click "Sign In"
4. Expected: ✅ Go to /admin/student
5. Expected: ✅ See Student Portal with Interactive Map
6. Expected: ✅ Stay on student page (no switching to admin)
7. Expected: ✅ Map shows pickup location, destination, bus marker
8. Expected: ✅ Can click logout
9. Try to visit /admin directly
10. Expected: ✅ Blocked - redirected to /login
```

### Test 4: Route Protection

```
DRIVER trying to access STUDENT route:
1. Login as driver@busflow.com
2. Try to manually visit http://localhost:3000/admin/student
3. Expected: ✅ Blocked by /admin/student/layout.tsx
4. Expected: ✅ Redirected to /login

STUDENT trying to access DRIVER route:
1. Login as student@busflow.com
2. Try to manually visit http://localhost:3000/admin/driver
3. Expected: ✅ Blocked by /admin/driver/layout.tsx
4. Expected: ✅ Redirected to /login

NON-ADMIN trying to access ADMIN:
1. Login as driver@busflow.com or student@busflow.com
2. Try to manually visit http://localhost:3000/admin
3. Expected: ✅ Blocked by /admin/layout.tsx (pathname check)
4. Expected: ✅ Redirected to /login
```

### Test 5: Session Persistence

```
1. Login as driver@busflow.com
2. Press F5 (refresh)
3. Expected: ✅ Still on /admin/driver
4. Expected: ✅ Still authenticated
5. Expected: ✅ No redirect to login

Repeat for:
- student@busflow.com → /admin/student
- admin@busflow.com → /admin
```

### Test 6: Switching Users (Fast Login)

```
1. Login as driver@busflow.com
2. See Driver Portal
3. Click "Logout"
4. See login form
5. Click "admin@busflow.com"
6. Click "Sign In"
7. Expected: ✅ Go to /admin (NOT driver)
8. Expected: ✅ See Admin Dashboard
9. Expected: ✅ No switching or flickering
```

---

## Expected Behavior Summary

| Login As | Redirect To | Can Access | Blocked From |
|----------|-------------|------------|--------------|
| ADMIN | `/admin` | `/admin/*` | `/admin/driver`, `/admin/student` |
| DRIVER | `/admin/driver` | `/admin/driver` | `/admin`, `/admin/student` |
| STUDENT | `/admin/student` | `/admin/student` | `/admin`, `/admin/driver` |
| Not Logged In | `/login` | `/login` | All `/admin/*` |

---

## Technical Details

### Dependency Array Fix

**Problem:** Empty dependency array `[]` means useEffect only runs once on mount
```typescript
// ❌ Bad - only checks role once
useEffect(() => {
  if (!hasRole('DRIVER')) router.replace('/login');
}, []);
```

**Solution:** Include dependency that changes when auth state changes
```typescript
// ✅ Good - re-checks whenever router changes
useEffect(() => {
  if (!hasRole('DRIVER')) router.replace('/login');
}, [router]);
```

### Pathname Check in Admin Layout

**Problem:** Parent layout was blocking all non-admin users
```typescript
// ❌ Bad - blocks DRIVER and STUDENT from /admin/driver and /admin/student
if (!hasRole('ADMIN')) {
  router.replace('/login');
}
```

**Solution:** Only check ADMIN role for the actual /admin route
```typescript
// ✅ Good - lets child routes handle their own checks
if (pathname === '/admin' && !hasRole('ADMIN')) {
  router.replace('/login');
}
```

---

## Verification Checklist

After testing, verify:

- ✅ Admin can access `/admin`
- ✅ Driver can access `/admin/driver` (NOT switching to admin)
- ✅ Student can access `/admin/student` (NOT switching to admin)
- ✅ Driver cannot access `/admin` or `/admin/student`
- ✅ Student cannot access `/admin` or `/admin/driver`
- ✅ Sessions persist after page refresh
- ✅ Logout clears all state
- ✅ Route protection works (manual URL changes are blocked)
- ✅ No flickering or redirect loops
- ✅ Map shows for student with Socket.IO events

---

## Troubleshooting

### Still seeing dashboard switching?

1. **Hard refresh browser:** `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear browser cache:**
   - Open DevTools (F12)
   - Application tab → Clear storage
3. **Check localStorage:**
   - DevTools → Application → Storage → localStorage
   - Should show correct JWT token and user role
4. **Check console errors:**
   - DevTools → Console
   - Look for any redirect errors

### Still getting redirected to login?

1. **Verify token exists:**
   - Open DevTools → Application
   - Check `bus_flow_auth_token` exists
   - Check `bus_flow_user` has correct role
2. **Check JWT expiration:**
   - Token should be valid (not expired)
3. **Verify role matches:**
   - User role should match intended route role

---

## Dev Server Status

```
URL: http://localhost:3000
Build: ✅ Successful
Route Guards: ✅ Fixed
Dependencies: ✅ Updated
```

---

## Summary

The route guard issue has been fixed by:

1. ✅ Removing ADMIN check from `/admin/layout.tsx`
2. ✅ Adding pathname check to only block non-admin from `/admin`
3. ✅ Adding proper dependency arrays to re-run effects
4. ✅ Letting child layouts handle their own role checks

**Now test in your browser to confirm the fix!** 🧪

---

**Next Step:** Open http://localhost:3000 and test each role login to verify no more dashboard switching.
