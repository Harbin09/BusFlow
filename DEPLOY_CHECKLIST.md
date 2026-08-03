# BusFlow Deployment Checklist - Production Ready

## Quick Start: Deploy in 30 minutes

### Prerequisites (5 min)
- [ ] GitHub account (code pushed to Harbin09/BusFlow)
- [ ] Netlify account (https://netlify.com)
- [ ] Railway account (https://railway.app)
- [ ] Custom domain (optional, can use Netlify subdomains)
- [ ] Backend API URL from Railway

### Backend Deployment (10 min)

#### Railway Setup
- [ ] Create Railway project
- [ ] Connect GitHub repo (Harbin09/BusFlow)
- [ ] Set DATABASE_URL environment variable
- [ ] Set JWT_SECRET environment variable
- [ ] Set NODE_ENV=production
- [ ] Set CORS_ORIGIN with all frontend URLs
- [ ] Wait for build to complete
- [ ] Note API URL (e.g., https://api-busflow.railway.app)
- [ ] Test API: `curl https://api-busflow.railway.app/api/v1/buses`

#### Backend CORS Configuration
- [ ] Update `backend/src/main.ts` with all frontend URLs
- [ ] Commit and push to trigger Railway rebuild
- [ ] Verify rebuild completes successfully

### Frontend Deployment (10 min)

#### Student Dashboard
- [ ] Create Netlify site from Git
- [ ] Set build command: `cd frontend/student-dashboard-frontend && npm run build`
- [ ] Set publish directory: `frontend/student-dashboard-frontend/build`
- [ ] Add environment variable:
  - Key: `REACT_APP_API_URL`
  - Value: `https://api-busflow.railway.app/api/v1`
- [ ] Deploy and wait for completion
- [ ] Note Netlify URL (e.g., https://student-busflow.netlify.app)

#### Admin Dashboard
- [ ] Repeat student dashboard steps
- [ ] Use: `cd frontend/admin-dashboard-frontend && npm run build`
- [ ] Use directory: `frontend/admin-dashboard-frontend/build`
- [ ] Note admin URL

#### Driver Dashboard
- [ ] Repeat student dashboard steps
- [ ] Use: `cd frontend/driver-dashboard-frontend && npm run build`
- [ ] Use directory: `frontend/driver-dashboard-frontend/build`
- [ ] Note driver URL

#### Login Portal
- [ ] Create Netlify site for login portal
- [ ] Update `frontend/login.html` with production URLs
- [ ] Commit and redeploy
- [ ] Note login URL

### Testing (5 min)

#### API Health Check
- [ ] Backend API responding: ✓
- [ ] Database connected: ✓
- [ ] Auth endpoints working: ✓

#### Login Flow
- [ ] Go to login URL
- [ ] Select Student Portal
- [ ] Login with: CTU1001@busflow.com / demo-password
- [ ] Redirects to student dashboard: ✓
- [ ] Dashboard loads data: ✓

#### All Dashboards
- [ ] Student dashboard accessible: ✓
- [ ] Admin dashboard accessible: ✓
- [ ] Driver dashboard accessible: ✓
- [ ] Maps display: ✓
- [ ] Data loading: ✓

## Post-Deployment Tasks

### Security (15 min)
- [ ] Enable HTTPS on all domains
- [ ] Set security headers (should be auto in netlify.toml)
- [ ] Enable CORS properly in backend
- [ ] Test CORS with curl:
  ```bash
  curl -H "Origin: https://student-busflow.netlify.app" \
       -H "Access-Control-Request-Method: GET" \
       -H "Access-Control-Request-Headers: Authorization" \
       -X OPTIONS https://api-busflow.railway.app/api/v1/auth/login -v
  ```

### Monitoring (10 min)
- [ ] Set up Railway monitoring
- [ ] Set up Netlify analytics
- [ ] Configure error alerts
- [ ] Enable database backups

### Documentation (5 min)
- [ ] Document all deployed URLs
- [ ] Document all environment variables
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

## Environment Variables Reference

### Railway Backend
```
DATABASE_URL=postgresql://user:password@host:5432/busflow
JWT_SECRET=your-secure-random-key
NODE_ENV=production
CORS_ORIGIN=https://student.yourdomain.com,https://admin.yourdomain.com,https://driver.yourdomain.com
```

### Netlify Student Dashboard
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

### Netlify Admin Dashboard
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

### Netlify Driver Dashboard
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

## URLs After Deployment

| Service | URL | Notes |
|---------|-----|-------|
| API Backend | https://api-busflow.railway.app | From Railway |
| Student Portal | https://student-busflow.netlify.app | Dashboard login required |
| Admin Portal | https://admin-busflow.netlify.app | Fleet management |
| Driver Portal | https://driver-busflow.netlify.app | Trip management |
| Login Portal | https://login-busflow.netlify.app | Unified login |

## Troubleshooting Quick Fix

### Blank page on Netlify
```bash
# Check netlify.toml has:
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

### API 404 errors
```bash
# Verify REACT_APP_API_URL in Netlify env vars
# Should be: https://api-busflow.railway.app/api/v1
# NOT: http://localhost:5000/api/v1
```

### CORS errors
```bash
# Backend must have CORS enabled for your Netlify URLs
# Check backend/src/main.ts enableCors() configuration
```

### Login not working
```bash
# Check API is responding:
curl https://api-busflow.railway.app/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"CTU1001@busflow.com","password":"demo-password"}'
```

## Rollback Instructions

### Rollback on Netlify
1. Go to Deploys tab
2. Find last successful deploy
3. Click "Restore this deploy"
4. Site automatically reverts

### Rollback on Railway
1. Go to Deployments
2. Select previous successful deployment
3. Click "Redeploy"

## Performance Benchmarks

After deployment, check:
- [ ] Homepage loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] Maps render smoothly
- [ ] No console errors
- [ ] Lighthouse score > 80

## Success Criteria

✅ Deployment is successful when:
- All three dashboards accessible
- Login works with demo credentials
- Dashboard data loads from API
- Maps display correctly
- No 404 or CORS errors
- All features functional
- Performance acceptable

## Support

If deployment fails:
1. Check Railway build logs
2. Check Netlify build logs
3. Check browser console for errors
4. Verify environment variables
5. Test API connectivity

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates
3. Enable analytics and monitoring
4. Set up alerting for failures
5. Create backup procedures
6. Document for team

---

**Estimated Time:** 30 minutes  
**Difficulty:** Intermediate  
**Success Rate:** 95%+ with this checklist
