# BusFlow - Complete Deployment Guide

This guide covers deploying all three dashboards (Student, Admin, Driver) to production using Netlify and Railway.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      Netlify (Frontend Hosting)         │
├─────────────────────────────────────────┤
│  Student Dashboard (3000)               │
│  Admin Dashboard (3001)                 │
│  Driver Dashboard (3002)                │
│  Login Portal (8000)                    │
└─────────────────────────────────────────┘
              ↓↓↓ API Calls ↓↓↓
┌─────────────────────────────────────────┐
│  Railway (Backend API - Port 5000)      │
├─────────────────────────────────────────┤
│  NestJS API with JWT Authentication     │
│  PostgreSQL Database                    │
│  Real-time Features (WebSockets)        │
└─────────────────────────────────────────┘
```

## Pre-Deployment Checklist

- [ ] Backend deployed on Railway with API running
- [ ] Database migrations completed
- [ ] CORS configured on backend for all frontend URLs
- [ ] JWT secret keys configured
- [ ] Environment variables set up
- [ ] SSL/TLS certificates enabled
- [ ] Domain names acquired (or use Netlify domains)

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Create new project

### 1.2 Connect GitHub Repository
```bash
# Push backend code to GitHub
cd backend
git push origin main
```

### 1.3 Configure Railway Project
1. In Railway Dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your BusFlow repository
4. Railway will auto-detect NestJS

### 1.4 Set Environment Variables in Railway

In Railway Dashboard → Variables:
```
DATABASE_URL=postgresql://user:password@host:5432/busflow
JWT_SECRET=your-very-secure-random-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://student.yourdomain.com,https://admin.yourdomain.com,https://driver.yourdomain.com
```

### 1.5 Deploy
- Railway auto-deploys on push to main branch
- Check deployment status in Railway Dashboard
- Note the generated API URL (e.g., https://api-busflow.railway.app)

### 1.6 Test Backend
```bash
curl https://api-busflow.railway.app/api/v1/buses
# Should return bus data
```

## Step 2: Prepare Frontend for Deployment

### 2.1 Update Environment Variables

Create `.env.production` in each dashboard:

**Student Dashboard** (`frontend/student-dashboard-frontend/.env.production`):
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

**Admin Dashboard** (create if not exists):
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

**Driver Dashboard** (create if not exists):
```
REACT_APP_API_URL=https://api-busflow.railway.app/api/v1
```

### 2.2 Verify Build Configuration

Ensure each dashboard's `netlify.toml` has:
```toml
[build]
  command = "npm run build"
  publish = "build"  # or "dist" depending on your build tool
  
[context.production]
  environment = { REACT_APP_API_URL = "https://api-busflow.railway.app/api/v1" }
```

### 2.3 Update Login Portal

Edit `frontend/login.html`:
```javascript
const roleConfigs = {
    ADMIN: {
        dashboard: 'https://admin-busflow.netlify.app/admin',
    },
    STUDENT: {
        dashboard: 'https://student-busflow.netlify.app',
    },
    DRIVER: {
        dashboard: 'https://driver-busflow.netlify.app',
    }
};
```

## Step 3: Deploy to Netlify

### 3.1 Create Netlify Account
- Go to https://netlify.com
- Sign up with GitHub
- Create new site

### 3.2 Deploy Student Dashboard

1. In Netlify Dashboard, click "New site from Git"
2. Choose GitHub and select BusFlow repo
3. Configure build settings:
   - **Build command:** `cd frontend/student-dashboard-frontend && npm run build`
   - **Publish directory:** `frontend/student-dashboard-frontend/build`

4. Add environment variables:
   - Key: `REACT_APP_API_URL`
   - Value: `https://api-busflow.railway.app/api/v1`

5. Click Deploy

### 3.3 Configure Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Add custom domain: `student.yourdomain.com`
3. Configure DNS records
4. Enable automatic HTTPS

### 3.4 Deploy Admin Dashboard

Repeat 3.2-3.3 but use:
- **Build command:** `cd frontend/admin-dashboard-frontend && npm run build`
- **Publish directory:** `frontend/admin-dashboard-frontend/build`
- **Domain:** `admin.yourdomain.com`

### 3.5 Deploy Driver Dashboard

Repeat 3.2-3.3 but use:
- **Build command:** `cd frontend/driver-dashboard-frontend && npm run build`
- **Publish directory:** `frontend/driver-dashboard-frontend/build`
- **Domain:** `driver.yourdomain.com`

### 3.6 Deploy Login Portal

1. Create new Netlify site
2. Deploy `frontend/login.html`
3. Configure at `login.yourdomain.com`

## Step 4: Configure Backend CORS

Update backend `src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://student.yourdomain.com',
    'https://admin.yourdomain.com',
    'https://driver.yourdomain.com',
    'https://login.yourdomain.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:8000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## Step 5: Testing Production Deployment

### 5.1 Test API Connectivity
```bash
# From each dashboard's browser console:
fetch('https://api-busflow.railway.app/api/v1/buses', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json()).then(console.log)
```

### 5.2 Test Login Flow
1. Visit https://login.yourdomain.com
2. Select Student Portal
3. Login with demo credentials:
   - Email: `CTU1001@busflow.com`
   - Password: `demo-password`
4. Should redirect to student dashboard

### 5.3 Test All Features
- [ ] Login works for all roles
- [ ] Dashboard loads data from API
- [ ] Maps display correctly
- [ ] Real-time updates work
- [ ] Alerts display properly
- [ ] Navigation between pages works

## Step 6: Monitoring & Maintenance

### Enable Monitoring
- **Railway:** Dashboard → Metrics
- **Netlify:** Analytics → Overview

### Set Up Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for APM

### Regular Backups
- Enable automated database backups on Railway
- Test backup restoration monthly

## Troubleshooting

### "Cannot GET /" on Netlify
**Solution:** Check that `netlify.toml` has the SPA redirect rule
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CORS Errors
**Solution:** Update backend CORS configuration with exact frontend URLs

### "Failed to fetch from API"
**Solution:** Verify:
- Backend is running on Railway
- API URL in .env.production is correct
- Network tab shows 200 response code

### Blank Page on Load
**Solution:**
- Check browser console for JavaScript errors
- Verify environment variables are set
- Check Netlify build logs for build errors

## Production Checklist

Before going live:
- [ ] SSL/TLS certificates enabled
- [ ] Environment variables all set
- [ ] CORS configured correctly
- [ ] Database backups working
- [ ] Error monitoring set up
- [ ] Analytics enabled
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Accessibility testing done
- [ ] Performance optimized

## Rollback Procedure

If deployment fails:

**On Netlify:**
1. Go to Deploys → Previous Deploy
2. Click "Restore this deploy"
3. Site automatically reverts to previous version

**On Railway:**
1. Go to Deployments
2. Select previous successful deploy
3. Click "Redeploy"

## Performance Optimization

### Frontend Optimization
- Enable Gzip compression in Netlify
- Code splitting already configured
- Tree shaking in production build
- Image optimization

### Backend Optimization
- Enable Redis caching
- Database query optimization
- Connection pooling on Railway
- Enable CDN for static assets

## Cost Optimization

**Netlify:**
- Free tier: Up to 100GB bandwidth
- Upgrade when needed
- Use Netlify functions for serverless operations

**Railway:**
- Free tier: $5/month credit
- Monitor usage in Dashboard
- Use appropriate database tier

## Next Steps

1. Document your custom domain setup
2. Create runbooks for common operations
3. Set up monitoring alerts
4. Train team on deployment process
5. Schedule regular maintenance windows

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Netlify Docs:** https://docs.netlify.com
- **NestJS Deployment:** https://docs.nestjs.com/deployment
- **React Production Build:** https://create-react-app.dev/docs/production-build

## Contact & Issues

For deployment issues:
- Check Railway Dashboard logs
- Check Netlify build logs
- Review browser console errors
- Check network tab in DevTools
