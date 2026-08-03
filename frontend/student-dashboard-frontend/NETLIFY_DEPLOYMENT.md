# Student Dashboard - Netlify Deployment Guide

## Prerequisites
- Backend deployed on Railway, Render, or similar (needs to be accessible via HTTPS)
- Netlify account
- GitHub repository with the code

## Step 1: Deploy Backend

Deploy the backend first to Railway or Render:
- Push backend code to GitHub
- Connect to Railway/Render
- Set DATABASE_URL in environment variables
- Note the deployed API URL (e.g., `https://api-production.railway.app`)

## Step 2: Configure Environment Variables for Netlify

Create environment variables in Netlify:

1. Go to Netlify Dashboard → Your Site → Site Settings → Build & Deploy → Environment
2. Add these variables:

```
REACT_APP_API_URL=https://your-api-url.railway.app/api/v1
```

Replace `your-api-url.railway.app` with your actual backend URL.

## Step 3: Configure CORS on Backend

Update backend `main.ts` to allow requests from Netlify:

```typescript
app.enableCors({
  origin: [
    'https://your-site.netlify.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
});
```

## Step 4: Deploy to Netlify

### Option A: Connect GitHub (Recommended)

1. Go to Netlify → New site from Git
2. Select your GitHub repo
3. Set Build Command: `npm run build`
4. Set Publish Directory: `dist` (or `build` depending on your setup)
5. Add environment variables from Step 2
6. Click Deploy

### Option B: Manual Deploy

1. Run: `npm run build`
2. Drag and drop the `dist` folder to Netlify

## Step 5: Test Deployment

1. Go to `https://your-site.netlify.app/login`
2. Login with demo credentials:
   - Email: `CTU1001@busflow.com`
   - Password: `demo-password`
3. Should redirect to dashboard

## Troubleshooting

### "API request failed" error
- Check that backend URL in environment variables is correct
- Verify backend is running and accessible
- Check browser console for exact error

### "Invalid token" error
- Verify backend is returning valid JWT tokens
- Check that token is being stored in localStorage

### CORS errors
- Ensure backend has CORS enabled for your Netlify domain
- Add your Netlify URL to the backend CORS allowed origins

### Login page appears after logging in
- Check browser console for errors
- Verify API_URL environment variable is set correctly
- Make sure backend login endpoint is working

## Local Development

For local development, use `.env.local`:

```
REACT_APP_API_URL=http://localhost:5000/api/v1
```

Then run:
```bash
npm start
```

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Admin & Driver Dashboards

Deploy these the same way:
- Admin Dashboard: port 3001 locally, separate Netlify site for production
- Driver Dashboard: port 3002 locally, separate Netlify site for production
- Login Portal: port 8000 locally, can be served from same backend or separate site

For production, update login portal URLs to point to deployed sites.
