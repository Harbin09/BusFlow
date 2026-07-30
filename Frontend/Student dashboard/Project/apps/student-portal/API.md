# API Integration Guide

## Overview

The Student Portal is a pure frontend application that consumes REST APIs provided by the backend.

**Important**: No business logic, calculations, or data transformations are performed in the frontend. All decisions come directly from API responses.

## API Service

The `studentApi` service in `src/services/api/studentApi.ts` handles all API communication.

### Initialization

```typescript
import { studentApi } from '../../services/api/studentApi';
```

### Features

1. **Auto-configured Base URL**: From `REACT_APP_API_URL` environment variable
2. **Request Interceptor**: Automatically adds JWT token from localStorage
3. **Response Interceptor**: Handles errors and formats responses
4. **Timeout**: 10-second timeout for all requests

## API Endpoints

### Get Today's Bus

```typescript
const bus = await studentApi.getTodayBus();
```

**Endpoint**: `GET /api/students/today-bus`

**Response Type**: `Bus`

**Returns**:
```typescript
{
  id: string;
  busNumber: string;
  status: 'APPROACHING' | 'ARRIVED' | 'DEPARTED' | 'IN_TRANSIT' | 'DELAYED';
  currentLocation: { latitude: number; longitude: number };
  capacity: { total: number; occupied: number; available: number };
  eta: number; // minutes
  etaTime: string; // ISO datetime
}
```

---

### Get Today's Trip

```typescript
const trip = await studentApi.getTodayTrip();
```

**Endpoint**: `GET /api/students/today-trip`

**Response Type**: `Trip`

**Returns**:
```typescript
{
  id: string;
  studentId: string;
  busId: string;
  routeId: string;
  tripDate: string; // YYYY-MM-DD
  tripType: 'MORNING' | 'EVENING' | 'RETURN';
  status: 'SCHEDULED' | 'BOARDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  pickupStop: Stop;
  droppingStop: Stop;
  scheduledTime: string; // ISO datetime
  actualTime?: string;
  boardedTime?: string;
}
```

---

### Get Pickup Point

```typescript
const pickupPoint = await studentApi.getPickupPoint();
```

**Endpoint**: `GET /api/students/pickup-point`

**Response Type**: `Stop`

**Returns**:
```typescript
{
  id: string;
  stopName: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  scheduledTime: string; // ISO datetime
  estimatedTime: string;
}
```

---

### Get Return Trip

```typescript
const returnTrip = await studentApi.getReturnTrip();
```

**Endpoint**: `GET /api/students/return-trip`

**Response Type**: `Trip | null`

**Returns**: Trip object or null if no return trip scheduled

---

### Get Missed Bus Info

```typescript
const missedBus = await studentApi.getMissedBusInfo();
```

**Endpoint**: `GET /api/students/missed-bus`

**Response Type**: `MissedBus | null`

**Returns**:
```typescript
{
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  missedAt: string; // ISO datetime
  creditsDeducted: number;
}
```

---

### Get Notifications

```typescript
const notifications = await studentApi.getNotifications(10);
```

**Endpoint**: `GET /api/students/notifications?limit=10`

**Response Type**: `Notification[]`

**Returns**:
```typescript
{
  id: string;
  type: 'ROUTE_UPDATE' | 'DELAY_ALERT' | 'CAPACITY_WARNING' | 'RETURN_TRIP' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  timestamp: string; // ISO datetime
  read: boolean;
  actionUrl?: string;
}
```

---

### Get Student Profile

```typescript
const student = await studentApi.getStudentProfile();
```

**Endpoint**: `GET /api/students/profile`

**Response Type**: `StudentProfile`

**Returns**:
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  credits: number;
  totalMissedBuses: number;
  homeAddress: string;
  schoolAddress: string;
  enrolledRoutes: Route[];
}
```

---

### Mark Notification as Read

```typescript
await studentApi.markNotificationAsRead('notification-id');
```

**Endpoint**: `POST /api/students/notifications/{notificationId}/read`

**Response Type**: `void`

---

### Get All Dashboard Data

```typescript
const data = await studentApi.getDashboardData();
```

Fetches all required data in parallel:
- Student profile
- Today's bus
- Today's trip
- Pickup point
- Return trip
- Missed bus info
- Notifications

**Returns**: Combined dashboard data object

---

## Error Handling

### Error Structure

```typescript
interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, any>;
}
```

### Common Error Codes

- `NETWORK_ERROR` - No internet or server unavailable
- `HTTP_400` - Bad request
- `HTTP_401` - Unauthorized
- `HTTP_403` - Forbidden
- `HTTP_404` - Not found
- `HTTP_500` - Server error
- `TIMEOUT` - Request timeout

### Error Handling in Components

```typescript
try {
  const data = await studentApi.getDashboardData();
  setData(data);
} catch (error) {
  const apiError = error as ApiError;
  setError(apiError);
  // Show error alert to user
}
```

---

## Authentication

### Token Management

1. **Storing Token**: After login, store JWT in localStorage
   ```typescript
   localStorage.setItem('accessToken', token);
   ```

2. **Auto-injection**: All requests automatically include token
   ```typescript
   // Request interceptor adds:
   headers.Authorization = `Bearer ${token}`;
   ```

3. **Token Refresh**: Handle token expiration
   - If 401 Unauthorized, redirect to login
   - Implement refresh token logic if needed

---

## Environment Variables

### Required

- `REACT_APP_API_URL` - Backend API base URL

### Optional

- `REACT_APP_ENV` - Environment (development/production)
- `REACT_APP_DEBUG` - Enable debug logging

### Example (.env file)

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
REACT_APP_DEBUG=false
```

---

## Request/Response Flow

```
Component Event
    ↓
Call studentApi method
    ↓
Request Interceptor
├─ Add JWT token
└─ Add headers
    ↓
HTTP Request
    ↓
Backend Processing
    ↓
HTTP Response
    ↓
Response Interceptor
├─ Check status
├─ Handle errors
└─ Parse JSON
    ↓
Return to component
```

---

## Best Practices

### 1. Always Handle Errors
```typescript
try {
  const data = await studentApi.getTodayBus();
} catch (error) {
  // Show error to user
}
```

### 2. Load Data on Mount
```typescript
useEffect(() => {
  loadDashboardData();
}, []); // Empty dependency array
```

### 3. Show Loading States
```typescript
const [loading, setLoading] = useState(false);

const load = async () => {
  setLoading(true);
  try {
    const data = await studentApi.getDashboardData();
  } finally {
    setLoading(false);
  }
};
```

### 4. Update Data on Refr esh
```typescript
const handleRetry = async () => {
  setError(null);
  await loadDashboardData();
};
```

### 5. Use Proper Types
```typescript
const [bus, setBus] = useState<Bus | null>(null);
// Instead of: useState<any>(null)
```

---

## Debugging

### Enable Debug Mode

```
REACT_APP_DEBUG=true
```

### Check Network Requests

Use browser DevTools Network tab:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check request URLs and responses

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if token is in localStorage |
| 404 Not Found | Verify API endpoint URL |
| CORS Error | Check backend CORS configuration |
| Network Timeout | Check API server is running |
| Empty Response | Check API response format |

---

## Testing the API

### Using cURL

```bash
# Get today's bus
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/students/today-bus

# Get all dashboard data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/students/profile
```

### Using Postman

1. Create new collection
2. Set environment variable for `API_URL`
3. Add `Authorization` header: `Bearer YOUR_TOKEN`
4. Test each endpoint

---

## Rate Limiting

The API may implement rate limiting. If you receive 429 Too Many Requests:

1. Implement exponential backoff
2. Reduce request frequency
3. Cache responses locally
4. Show message to user

---

## Caching Strategy

Consider caching to reduce API calls:

```typescript
// Simple cache implementation
const cache = new Map();

async function getCachedData(key, fetcher) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

---

## Security

1. **Never log tokens**: Remove auth headers from logs
2. **Use HTTPS**: In production only
3. **Validate responses**: Check response shape
4. **Sanitize data**: React auto-escapes, but be careful
5. **CORS headers**: Let backend handle CORS
