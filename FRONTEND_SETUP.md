# BusFlow Admin Dashboard - Frontend Setup

## Project Structure

```
BusFlow/
├── app/                          # Next.js App Router
│   └── admin/                    # Admin dashboard routes
│       ├── layout.tsx            # Admin layout with sidebar & top nav
│       ├── page.tsx              # Dashboard overview page
│       ├── fleet/                # Fleet management pages
│       ├── routes/               # Route management pages
│       ├── tracking/             # Live tracking/map pages
│       ├── students/             # Student management pages
│       ├── drivers/              # Driver management pages
│       └── alerts/               # Weather & alerts pages
├── lib/
│   └── api.ts                    # API client helper with caching & fallbacks
├── public/                       # Static assets
├── tsconfig.json                 # TypeScript configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Dependencies
└── .env.example                 # Environment variables template
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp .env.example .env.local
```

Update `.env.local` with your backend API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) in your browser.

## Key Features

### Admin Layout (`app/admin/layout.tsx`)

- **Responsive Sidebar** with collapsible navigation
- **Navigation Links:**
  - 🏠 Overview (/admin)
  - 🚌 Fleet (/admin/fleet)
  - 🗺️ Routes (/admin/routes)
  - 📍 Live Map (/admin/tracking)
  - 👨‍🎓 Students (/admin/students)
  - 👨‍✈️ Drivers (/admin/drivers)
  - 🌧️ Weather & Alerts (/admin/alerts)

- **Top Navigation Bar** featuring:
  - Page title
  - System Status Badge (green operational indicator)
  - Simulate Rain Alert button
  - User profile section with role display

### API Client (`lib/api.ts`)

#### Features

- **Fetch Wrapper** with error handling
- **Request Caching** (5-minute TTL for GET requests)
- **Fallback Handlers** for offline scenarios
- **Environment Configuration** via `NEXT_PUBLIC_API_URL`
- **Network Detection** with cached data fallback

#### Usage Examples

```typescript
import { 
  apiClient, 
  dashboardApi, 
  fleetApi, 
  studentsApi 
} from '@/lib/api';

// Get dashboard summary with automatic caching
const response = await dashboardApi.getSummary();
if (response.error) {
  console.log('Error:', response.error);
  // Fallback data is handled automatically
} else {
  console.log('Data:', response.data);
}

// List buses
const busesResponse = await fleetApi.listBuses();

// Upload CSV file
const file = new File(/* ... */);
const uploadResponse = await studentsApi.uploadCSV(file);

// Custom request
const customResponse = await apiClient.get('/api/v1/custom-endpoint');
```

#### API Helper Methods

- **Dashboard:** `getSummary()`, `getMap()`
- **Fleet:** `listBuses()`, `getBus()`, `createBus()`, `updateBus()`, `deleteBus()`
- **Routes:** `listRoutes()`, `getRoute()`, `createRoute()`, `updateRoute()`, `deleteRoute()`
- **Tracking:** `getLiveTracking()`
- **Students:** `listStudents()`, `getStudent()`, `createStudent()`, `updateStudent()`, `deleteStudent()`, `uploadCSV()`
- **Drivers:** `listDrivers()`, `getDriver()`, `createDriver()`, `updateDriver()`
- **Weather:** `getWeather()`, `checkWeather()`
- **Notifications:** `sendNotification()`, `getNotifications()`
- **Timetable:** `uploadTimetable()`, `getTimetable()`

### Dashboard Overview Page (`app/admin/page.tsx`)

Displays:
- **KPI Cards** for active buses, total students, today's trips, delayed buses
- **Today's Summary** bar with operational metrics
- **Live Map Placeholder** for Google Maps integration
- **Quick Action Buttons** for CSV uploads and broadcasts

## Styling

The project uses **Tailwind CSS** for all styling:
- Responsive mobile-first design
- Dark sidebar with light main content area
- Color-coded status indicators
- Smooth transitions and hover states

## Development Workflow

### Creating New Pages

1. Create a folder in `app/admin/<page-name>/`
2. Add `page.tsx` with your component
3. The layout automatically applies sidebar and top nav

### Adding API Calls

1. Import helpers from `lib/api.ts`
2. Use in `useEffect` with proper loading/error states
3. API client handles caching and fallbacks automatically

## Backend Integration

The frontend expects these API endpoints (documented in ADMIN_SPEC.md):

- `/api/v1/dashboard/summary` - Dashboard KPIs
- `/api/v1/buses` - Fleet management
- `/api/v1/routes` - Route management
- `/api/v1/students` - Student management with CSV upload
- `/api/v1/drivers` - Driver management
- `/api/v1/tracking/live` - Live GPS coordinates
- `/api/v1/weather` - Weather data
- `/api/v1/weather/check` - Trigger weather evaluation
- `/api/v1/notifications/send` - Send notifications
- `/api/v1/timetable/upload` - Upload timetables

## Testing the Rain Alert Simulation

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Click the **"Simulate Rain Alert"** button in the top right
3. The frontend will POST to `/api/v1/weather/check`
4. Backend processes weather evaluation and returns delay adjustments
5. Students and drivers receive push notifications

## Performance Tips

- The API client caches GET requests for 5 minutes
- Use `skipCache: true` option to bypass cache when needed
- Network detection automatically serves cached data when offline
- Use `apiClient.clearCache()` to reset cache if needed

## Troubleshooting

### "Network offline and no cached data available"

- Ensure backend is running at `NEXT_PUBLIC_API_URL`
- Check network connectivity
- Try a request that has been previously cached

### CORS Errors

- Backend must enable CORS for `http://localhost:3000`
- Check FastAPI CORS middleware configuration

### Missing Environment Variables

- Copy `.env.example` to `.env.local`
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Restart dev server after changes

## Next Steps

1. **Fleet Management Module** - Create bus list, add/edit bus pages
2. **Route Management Module** - Create route builder with stop mapping
3. **Live Tracking** - Integrate Google Maps with WebSocket GPS stream
4. **Student Management** - CSV uploader and bulk editor
5. **Weather Intelligence** - Weather widget and alert system
