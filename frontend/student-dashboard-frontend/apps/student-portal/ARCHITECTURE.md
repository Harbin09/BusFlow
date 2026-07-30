# Student Portal Architecture

## Design Principles

1. **Pure Frontend**: No backend logic, all data from APIs
2. **API-First**: All decisions come from API responses
3. **Responsive**: Mobile-first design approach
4. **Type-Safe**: Full TypeScript coverage
5. **Reusable**: Component-based architecture

## Directory Structure

```
src/
├── pages/
│   └── Dashboard/
│       ├── Dashboard.tsx          # Main dashboard page
│       └── components/
│           ├── BusCard.tsx        # Today's bus info
│           ├── PickupPointCard.tsx # Pickup location
│           ├── NotificationsCard.tsx # Alerts
│           ├── ReturnTripCard.tsx # Return journey
│           ├── MissedBusCard.tsx  # Missed bus info
│           └── QuickActionsCard.tsx # Navigation buttons
├── components/
│   ├── Card.tsx                   # Reusable card wrapper
│   ├── Loading/
│   │   └── LoadingSpinner.tsx     # Loading states
│   └── Error/
│       └── ErrorAlert.tsx         # Error handling
├── services/
│   └── api/
│       └── studentApi.ts          # API service layer
├── types/
│   └── index.ts                   # TypeScript interfaces
├── styles/
│   └── tailwind.css               # Tailwind styles
├── App.tsx                        # Main app component
└── index.tsx                      # Entry point
```

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Service Call (studentApi)
    ↓
HTTP Request to Backend
    ↓
Backend API Response
    ↓
State Update (useState)
    ↓
Component Re-render
    ↓
UI Display
```

## Component Hierarchy

```
<App>
  <BrowserRouter>
    <Routes>
      <Dashboard>
        <Card> - Bus Card
          <BusCard>
        <Card> - Pickup Point Card
          <PickupPointCard>
        <Card> - Notifications
          <NotificationsCard>
        <Card> - Return Trip
          <ReturnTripCard>
        <Card> - Missed Bus
          <MissedBusCard>
        <Card> - Quick Actions
          <QuickActionsCard>
</App>
```

## State Management

- **React Hooks** (useState) for component state
- **useEffect** for data fetching
- **useNavigate** for routing
- No external state management library needed for this dashboard

## API Integration

The dashboard consumes these endpoints:

```
GET /api/students/profile           # Student information
GET /api/students/today-bus         # Bus assignment
GET /api/students/today-trip        # Trip details
GET /api/students/pickup-point      # Pickup location
GET /api/students/return-trip       # Return journey
GET /api/students/missed-bus        # Missed bus info
GET /api/students/notifications    # Recent alerts
POST /api/students/notifications/{id}/read  # Mark as read
```

## Error Handling Strategy

1. **Network Errors**: Display connection error
2. **4xx Errors**: Display specific error message
3. **5xx Errors**: Display server error
4. **No Data**: Display empty state
5. **Retry Option**: Allow users to retry failed requests

## Loading States

1. **Full Page Loading**: DashboardSkeleton
2. **Card Loading**: CardSkeleton
3. **Button Loading**: Loading spinner in button
4. **Data Loading**: LoadingSpinner component

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Performance Considerations

1. **Lazy Loading**: Notifications load separately
2. **Parallel Requests**: Multiple API calls in parallel
3. **Error Isolation**: One failed request doesn't break dashboard
4. **Caching**: Consider implementing cache headers
5. **Code Splitting**: Dashboard route is code-split

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus visible indicators

## Security

- **No Credentials in Code**: Tokens from localStorage
- **HTTPS Only**: Production deployment
- **CORS Handling**: Backend handles CORS
- **Input Validation**: DTOs on backend
- **XSS Prevention**: React auto-escapes content
