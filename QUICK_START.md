# 🚀 BusFlow Admin Dashboard - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local and ensure NEXT_PUBLIC_API_URL is set
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. View Admin Dashboard
Open your browser to: **http://localhost:3000/admin**

You should see:
- ✅ Responsive sidebar with navigation links
- ✅ Top navigation bar with status badge and rain alert button
- ✅ Dashboard overview with KPI cards
- ✅ Summary metrics and quick actions

---

## 📁 Key Files at a Glance

| File | Purpose | Status |
|------|---------|--------|
| `app/admin/layout.tsx` | Main admin layout with sidebar & top nav | ✅ Complete |
| `lib/api.ts` | API client with caching & fallbacks | ✅ Complete |
| `app/admin/page.tsx` | Dashboard overview page | ✅ Complete |
| `package.json` | Dependencies (Next.js, React, Tailwind) | ✅ Complete |
| `tsconfig.json` | TypeScript configuration | ✅ Complete |
| `tailwind.config.js` | Tailwind CSS setup | ✅ Complete |
| `.env.example` | Environment variables template | ✅ Complete |

---

## 🎯 What's Working Right Now

### ✅ Admin Layout
- Sidebar with 7 navigation links
- Collapsible sidebar for mobile
- Top navigation with status badge
- Rain alert simulation button
- User profile display

### ✅ API Client (`lib/api.ts`)
- Fetch wrapper with error handling
- 5-minute request caching
- Network offline detection
- Fallback to cached data
- Type-safe API helpers

### ✅ Dashboard Overview
- KPI cards (buses, students, trips, delays)
- Today's summary metrics
- Live map placeholder
- Quick action buttons
- Loading and error states

---

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

---

## 📚 Navigation

### Main Links to Read
1. **[README.md](./README.md)** - Project overview
2. **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Development guide
3. **[ADMIN_SPEC.md](./ADMIN_SPEC.md)** - Feature specifications
4. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built

### Admin Routes (Ready to Build)
- `/admin` - Dashboard overview (✅ exists)
- `/admin/fleet` - Fleet management (create `app/admin/fleet/page.tsx`)
- `/admin/routes` - Route management (create `app/admin/routes/page.tsx`)
- `/admin/tracking` - Live map (create `app/admin/tracking/page.tsx`)
- `/admin/students` - Student management (create `app/admin/students/page.tsx`)
- `/admin/drivers` - Driver management (create `app/admin/drivers/page.tsx`)
- `/admin/alerts` - Weather & alerts (create `app/admin/alerts/page.tsx`)

---

## 💻 API Integration Examples

### Fetch Dashboard Data
```typescript
import { dashboardApi } from '@/lib/api';

const response = await dashboardApi.getSummary();
if (response.error) {
  console.log('Error:', response.error);
} else {
  console.log('Data:', response.data);
}
```

### List Buses
```typescript
import { fleetApi } from '@/lib/api';

const response = await fleetApi.listBuses();
```

### Upload Student CSV
```typescript
import { studentsApi } from '@/lib/api';

const file = new File(['...'], 'students.csv');
const response = await studentsApi.uploadCSV(file);
```

### Trigger Rain Alert
```typescript
import { weatherApi } from '@/lib/api';

const response = await weatherApi.checkWeather();
```

---

## 🔍 Troubleshooting

### "Cannot find module '@/lib/api'"
- Check that `tsconfig.json` has path alias: `"@/*": ["./*"]`
- Restart the dev server

### "API connection failed"
- Ensure backend is running at `NEXT_PUBLIC_API_URL`
- Check `.env.local` has correct API URL
- Fallback demo data will still display

### Sidebar not showing
- Clear browser cache
- Check that you're on `/admin` route (not `/`)
- Verify `app/admin/layout.tsx` exists

### Styles not loading
- Run `npm install` to ensure Tailwind is installed
- Check that `app/globals.css` has Tailwind directives
- Restart dev server

---

## 📋 File Structure Reference

```
BusFlow/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global Tailwind styles
│   └── admin/
│       ├── layout.tsx ✨          # Admin sidebar & nav
│       └── page.tsx ✨            # Dashboard overview
├── lib/
│   └── api.ts ✨                  # API client with caching
├── public/                        # Static assets (create as needed)
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS config
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
└── README.md                      # This project

✨ = Core files created for admin dashboard
```

---

## 🎨 UI Components Available

### Admin Layout Provides:
- Responsive sidebar with navigation
- Top navigation bar with status badge
- Main content area with proper padding
- User profile section
- Rain alert trigger button

### Dashboard Page Provides:
- KPI cards component
- Summary metrics component
- Map placeholder component
- Quick actions component
- Loading states
- Error handling

---

## 🚀 Next Steps

### Short Term (Today)
1. ✅ Run `npm install`
2. ✅ Configure `.env.local`
3. ✅ Start dev server with `npm run dev`
4. ✅ Visit `/admin` to see the layout

### Medium Term (This Sprint)
1. Create `/admin/fleet` page with bus listing
2. Create `/admin/routes` page with route management
3. Create `/admin/students` page with CSV import
4. Create `/admin/drivers` page with driver listing
5. Integrate Google Maps for `/admin/tracking`

### Long Term (Backend Ready)
1. Connect all pages to actual API endpoints
2. Implement WebSocket for live tracking
3. Add real-time updates using polling
4. Build weather intelligence module
5. Create analytics and reporting

---

## 📞 Need Help?

### Documentation
- **Setup Issues?** → [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)
- **Feature Specs?** → [ADMIN_SPEC.md](./ADMIN_SPEC.md)
- **Code Style?** → [CLAUDE.md](./CLAUDE.md)
- **Project Overview?** → [README.md](./README.md)

### Common Questions

**Q: Can I use the API client offline?**
A: Yes! The API client automatically caches GET requests for 5 minutes and returns cached data when offline.

**Q: How do I add a new admin page?**
A: Create `app/admin/[page-name]/page.tsx` and the layout will automatically apply.

**Q: Can I modify the sidebar?**
A: Yes, edit the `navLinks` array in `app/admin/layout.tsx` to add/remove navigation items.

**Q: How do I customize colors?**
A: Edit `tailwind.config.js` to customize the theme, or use Tailwind utility classes directly.

**Q: What's the API base URL?**
A: It's set in `NEXT_PUBLIC_API_URL` environment variable, defaulting to `http://localhost:8000`.

---

**Status:** ✅ Ready to develop!

**Deployment Preview:** Backend must be running at `NEXT_PUBLIC_API_URL` for full functionality.
