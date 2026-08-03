# Component Documentation

## Dashboard Page Component

### Purpose
Main dashboard page that displays all student information and quick actions.

### Props
None (Uses internal state and API calls)

### Features
- Loads dashboard data on mount
- Handles loading and error states
- Responsive layout
- Credit balance display
- Header and footer

### Usage
```tsx
<Dashboard />
```

---

## Card Component

### Purpose
Reusable card wrapper with loading and error states.

### Props
```tsx
interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
}
```

### Example
```tsx
<Card title="Today's Bus" subtitle="Your assigned bus and status">
  <BusCard bus={todayBus} />
</Card>
```

---

## BusCard Component

### Purpose
Displays today's bus information and real-time status.

### Props
```tsx
interface BusCardProps {
  bus: Bus;
}
```

### Displays
- Bus number
- Current status (APPROACHING, ARRIVED, etc.)
- ETA in minutes and time
- Capacity information (total, occupied, available)
- Capacity progress bar
- Availability warnings

---

## PickupPointCard Component

### Purpose
Shows where and when the student should be picked up.

### Props
```tsx
interface PickupPointCardProps {
  pickupPoint: Stop;
  tripTime?: string;
}
```

### Displays
- Stop name with icon
- Pickup time
- Time remaining until pickup
- GPS coordinates (latitude/longitude)
- Stop number in route sequence
- Reminder to arrive early

---

## NotificationsCard Component

### Purpose
Displays recent alerts and updates.

### Props
```tsx
interface NotificationsCardProps {
  notifications: Notification[];
}
```

### Features
- Color-coded by notification type
- Time formatting (relative)
- Icons for different alert types
- Action links
- Empty state handling

### Notification Types
- ROUTE_UPDATE (📋)
- DELAY_ALERT (⏰)
- CAPACITY_WARNING (🚌)
- RETURN_TRIP (🔄)
- SYSTEM_ALERT (⚠️)

---

## ReturnTripCard Component

### Purpose
Shows information about the evening return journey.

### Props
```tsx
interface ReturnTripCardProps {
  trip: Trip;
  bus: Bus;
}
```

### Displays
- Trip status badge
- Return journey time
- Pickup and dropping stops
- Bus information for return
- Timeline visualization
- Helpful notes

---

## MissedBusCard Component

### Purpose
Informs user about missed bus and credit deduction.

### Props
```tsx
interface MissedBusCardProps {
  missedBus: MissedBus;
  credits: number;
}
```

### Displays
- Alert about missed bus
- Bus and route details
- Credits deducted
- Current credit balance
- Credit progress bar
- Warnings if credits are low
- Information about consequences

---

## QuickActionsCard Component

### Purpose
Provides quick navigation buttons to key features.

### Props
```tsx
interface QuickActionsCardProps {
  navigate: NavigateFunction;
}
```

### Actions
1. **Track Bus** → Navigate to /track-bus
2. **Trip History** → Navigate to /trip-history
3. **Report Issue** → Navigate to /report-issue
4. **My Profile** → Navigate to /profile

---

## LoadingSpinner Component

### Purpose
Shows loading indicator while data is being fetched.

### States
- **LoadingSpinner**: Rotating spinner with text
- **CardSkeleton**: Skeleton loading for card content
- **DashboardSkeleton**: Full dashboard loading state

### Usage
```tsx
{loadingState === 'loading' ? <LoadingSpinner /> : <Content />}
```

---

## ErrorAlert Component

### Purpose
Displays error messages with retry option.

### Props
```tsx
interface ErrorAlertProps {
  error: ApiError;
  onRetry?: () => void;
}
```

### Features
- Error type icon
- Error message and code
- Error details (if available)
- Retry button
- Color-coded by error type

### Error Types
- NETWORK_ERROR (📡)
- NOT_FOUND (🔍)
- UNAUTHORIZED (🔐)
- SERVER_ERROR (⚠️)

---

## EmptyState Component

### Purpose
Displays empty state when no data is available.

### Props
```tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}
```

### Usage
```tsx
<EmptyState
  icon="📭"
  title="No Notifications"
  message="You're all caught up!"
/>
```

---

## Component Hierarchy

```
Dashboard
├── LoadingSpinner (if loading)
├── ErrorAlert (if error)
└── (if success)
    ├── Card
    │   └── BusCard
    ├── Card
    │   └── PickupPointCard
    ├── Card
    │   └── NotificationsCard
    ├── Card
    │   └── ReturnTripCard
    ├── Card
    │   └── MissedBusCard
    ├── Card
    │   └── QuickActionsCard
    └── Credits Info Card
```

---

## Styling

All components use **Tailwind CSS** classes for styling:

- **Colors**: Blue (primary), Gray (secondary), with semantic colors
- **Spacing**: 4-unit grid system
- **Responsive**: Mobile-first approach with md: and lg: breakpoints
- **Animations**: Smooth transitions and hover effects
- **Shadows**: Subtle shadows for depth
- **Rounded Corners**: Rounded-lg for consistency

---

## Accessibility

- Semantic HTML elements (button, section, etc.)
- ARIA labels where needed
- Color contrast WCAG AA compliant
- Focus visible indicators
- Keyboard navigation support
- Alt text for icons (via title attributes)
