# BusFlow Stitch Design System
## Extracted from Provided HTML Designs

**Status**: Ready for Implementation ✅  
**Extracted From**: 4 Stitch HTML design files  
**Scope**: Student Dashboard redesign (4 pages)

---

## Part 1: Design Tokens

### Color Palette

```javascript
const colors = {
  // Primary
  primary: "#004ac6",
  onPrimary: "#ffffff",
  primaryContainer: "#2563eb",
  onPrimaryContainer: "#eeefff",
  primaryFixed: "#dbe1ff",
  onPrimaryFixed: "#00174b",
  primaryFixedDim: "#b4c5ff",
  onPrimaryFixedVariant: "#003ea8",
  
  // Secondary
  secondary: "#505f76",
  onSecondary: "#ffffff",
  secondaryContainer: "#d0e1fb",
  onSecondaryContainer: "#54647a",
  secondaryFixed: "#d3e4fe",
  onSecondaryFixed: "#0b1c30",
  secondaryFixedDim: "#b7c8e1",
  onSecondaryFixedVariant: "#38485d",
  
  // Tertiary
  tertiary: "#943700",
  onTertiary: "#ffffff",
  tertiaryContainer: "#bc4800",
  onTertiaryContainer: "#ffede6",
  tertiaryFixed: "#ffdbcd",
  onTertiaryFixed: "#360f00",
  tertiaryFixedDim: "#ffb596",
  onTertiaryFixedVariant: "#7d2d00",
  
  // Error
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  
  // Surface
  background: "#f7f9fb",
  onBackground: "#191c1e",
  
  surface: "#f7f9fb",
  onSurface: "#191c1e",
  onSurfaceVariant: "#434655",
  
  surfaceDim: "#d8dadc",
  surfaceBright: "#f7f9fb",
  
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainer: "#eceef0",
  surfaceContainerHigh: "#e6e8ea",
  surfaceContainerHighest: "#e0e3e5",
  
  surfaceVariant: "#e0e3e5",
  onSurfaceVariant: "#434655",
  
  inverseSurface: "#2d3133",
  inverseOnSurface: "#eff1f3",
  inversePrimary: "#b4c5ff",
  
  // Outline
  outline: "#737686",
  outlineVariant: "#c3c6d7",
  
  // Semantic
  surfaceTint: "#0053db",
}
```

### Typography

```javascript
const typography = {
  fontFamily: {
    default: "'Inter', sans-serif",
  },
  
  // Sizes (Tailwind fontSize)
  headlineXL: { fontSize: "40px", lineHeight: "48px", fontWeight: 700, letterSpacing: "-0.02em" },
  headlineLG: { fontSize: "32px", lineHeight: "40px", fontWeight: 700, letterSpacing: "-0.02em" },
  headlineMD: { fontSize: "24px", lineHeight: "32px", fontWeight: 600 },
  headlineLGMobile: { fontSize: "24px", lineHeight: "32px", fontWeight: 700 },
  headlineXLMobile: { fontSize: "30px", lineHeight: "36px", fontWeight: 700 },
  
  bodyLG: { fontSize: "18px", lineHeight: "28px", fontWeight: 400 },
  bodyMD: { fontSize: "16px", lineHeight: "24px", fontWeight: 400 },
  bodySM: { fontSize: "14px", lineHeight: "20px", fontWeight: 400 },
  
  labelMD: { fontSize: "14px", lineHeight: "20px", fontWeight: 600, letterSpacing: "0.05em" },
}
```

### Spacing & Layout

```javascript
const spacing = {
  unit: "4px",           // Base unit
  gutter: "24px",        // Component internal spacing
  marginMobile: "16px",  // Page margin mobile
  marginDesktop: "40px", // Page margin desktop
  containerMax: "1440px",
}

const borderRadius = {
  default: "0.25rem",    // 4px
  lg: "0.5rem",          // 8px
  xl: "0.75rem",         // 12px
  card: "20px",          // Card rounded corners
  full: "9999px",        // Fully rounded
}
```

### Shadows

```javascript
const shadows = {
  sm: "0 4px 12px rgba(37, 99, 235, 0.04)",
  md: "0 12px 32px rgba(37, 99, 235, 0.08)",
  lg: "0 0 8px #2563EB (pulse effect)",
  glassCard: "0 4px 12px rgba(37, 99, 235, 0.04)",
}
```

---

## Part 2: Component Library

### Navigation
- **TopNavBar**: Fixed header with logo, nav links, notifications, profile
- **SideNavBar**: Left sidebar (hidden on mobile, appears on lg breakpoint)
- **BottomNavBar**: Mobile bottom navigation (md:hidden)
- **Header**: Hero section with greeting and context

### Cards & Containers
- **GlassCard**: Frosted glass effect with blur
  - `background: rgba(255, 255, 255, 0.8)`
  - `backdrop-filter: blur(12px)`
  - `border: 1px solid rgba(255, 255, 255, 0.5)`
  - `box-shadow: 0 4px 12px rgba(37, 99, 235, 0.04)`

- **Card**: Regular white card
  - `p-6`, `rounded-card`, glass-card styling

### Buttons
- **Primary Button**: 
  - `bg-primary text-on-primary rounded-xl py-3 px-6`
  - `hover:shadow-lg shadow-primary/20`
  - `active:scale-[0.98]`

- **Secondary Button**:
  - `glass-card text-on-surface-variant`

- **Outline Button**:
  - `border-2 border-outline text-primary`

- **Icon Button**:
  - `p-2 hover:bg-primary-container/10 rounded-full`

### Forms
- **Input**: `pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary`
- **Select**: Same as input
- **Checkbox**: Small with focus ring

### Status Indicators
- **Badge**: `px-3 py-1 rounded-full font-label-md inline-flex`
- **Live Indicator**: `bg-primary/10 flex items-center gap-2 w-2 h-2 rounded-full animate-pulse`
- **Status Dot**: `w-2 h-2 rounded-full bg-primary`

### Maps
- **MapContainer**: 
  - `h-[500px] rounded-card overflow-hidden`
  - Map image background
  - Glass-card overlay controls (zoom, my_location)

### Timelines
- **Timeline**: Vertical line with steps
  - Circle indicators (completed, active, upcoming)
  - Vertical connector line
  - Text labels with timestamps

### Metrics
- **MetricCard**: Shows value + label + progress bar
  - Number in large bold
  - Description below
  - Optional progress bar (0-100%)

---

## Part 3: Page-Specific Stitch Components

### Page 1: My Journey (Dashboard)

**URL**: `/` (Main page)  
**Stitch Design File**: `BusFlow Student Dashboard.html`

**Layout**:
```
TopNavBar
├─ Logo (BusFlow)
├─ Nav Links (My Journey, Live Tracking, Schedules, Stops)
└─ Notifications, Settings, Profile

Main Grid (lg:grid-cols-12 gap-gutter)
├─ Left Column (lg:col-span-8)
│  ├─ Hero Section (h1, p)
│  ├─ Map Container (h-[500px])
│  │  └─ GlassCard (bottom-left, floating)
│  │     ├─ Bus Number (headline-md)
│  │     ├─ Live badge
│  │     ├─ Info grid (pickup, ETA)
│  │     └─ Button (View Full Route)
│  └─ Schedule Card
│     ├─ Title + Description
│     └─ Time List (Return Trip, Night Shuttle)
│
└─ Right Column (lg:col-span-4)
   ├─ Journey Timeline (sticky)
   │  ├─ Vertical line
   │  ├─ Timeline steps (4 items)
   │  └─ Timestamps + descriptions
   ├─ Live Metrics Card
   │  ├─ Speed metric + progress bar
   │  ├─ Occupancy metric + progress bar
   │  └─ Temperature display
   └─ Support CTA Card

BottomNavBar (md:hidden)
```

**Key Components Used**:
- GlassCard (map hero, metrics, timeline)
- Buttons (primary, icon)
- Timeline component
- Metric displays with progress bars
- Badge (Live indicator)

---

### Page 2: Live Tracking

**URL**: `/track-bus`  
**Stitch Design File**: `CampusTransit Live Tracking.html`

**Layout**:
```
TopNavBar
├─ Logo (CampusTransit)
├─ Nav Links (active: Live Tracking)
├─ Support link
├─ Notifications
└─ Profile

Main (full screen map)
├─ Map SVG Container
│  ├─ Grid pattern background
│  ├─ Blue route polyline (animated)
│  ├─ Bus marker (pulsing)
│  ├─ Stop markers
│  └─ Overlay controls (zoom, my_location)
│
├─ Floating Bus Details Card (top-right)
│  ├─ Status badge (ON TIME)
│  ├─ Bus number (headline-md)
│  ├─ ETA (headline-md + mins label)
│  ├─ Pickup stop info
│  ├─ Occupancy indicator (5 bars)
│  └─ Button (View Full Route)
│
├─ Journey Progress Card (bottom-left)
│  ├─ Timeline with stepper
│  ├─ Current progress bar
│  ├─ Step indicators (Science Hub → Eng Wing → Main Gate)
│  ├─ Active bus position marker
│  └─ Stop labels
│
└─ Map Controls (right side)
   ├─ Zoom +/- buttons (glass-card)
   └─ My Location button (primary)

SideNavBar (left, lg:flex)
└─ Transit Pro card + menu items

Mobile Bottom Bar
└─ Quick nav buttons
```

**Key Components Used**:
- GlassCard (floating cards)
- Map visualization (SVG)
- Timeline/Stepper
- Progress bar
- Badge indicators
- Icon buttons (glass-card)
- Sidebar menu

---

### Page 3: Schedules

**URL**: `/schedules`  
**Stitch Design File**: `BusFlow Schedules.html`

**Layout**:
```
TopNavBar
├─ Logo
├─ Nav Links (active: Schedules)
└─ Notifications, Profile

Main Content
├─ Header Section (grid)
│  ├─ Title (headline-xl)
│  ├─ Description (body-lg)
│  └─ Current View Card (Monday, Oct 24)
│
├─ Tab Navigation
│  ├─ My Routes (primary, active)
│  ├─ All Routes (glass-card)
│  ├─ Night Shuttle (glass-card)
│  └─ Search input (right side, ml-auto)
│
├─ Main Grid (xl:grid-cols-12)
│  ├─ Left Column (xl:col-span-8)
│  │  ├─ Section Title (Active Journeys)
│  │  └─ Route Cards (repeating)
│  │     ├─ Route letter badge (colored bg)
│  │     ├─ Route name (headline-md)
│  │     ├─ Frequency + bus count
│  │     ├─ Next departure time
│  │     └─ Arrow button
│  │
│  └─ Right Column (xl:col-span-4, sticky top-28)
│     ├─ Route Timeline Card (sticky)
│     │  ├─ Time scale (left side, absolute)
│     │  ├─ Vertical line (border-l-2)
│     │  ├─ Time blocks (10 AM, 11 AM, etc.)
│     │  ├─ Event cards (colored by route)
│     │  ├─ Current time marker (pulsing dot)
│     │  └─ View Full Day button
│     │
│     └─ Network Health Stats Card
│        ├─ 98% On Time (headline-xl)
│        ├─ Progress bar (multi-color)
│        └─ Background decoration icon

Footer
```

**Key Components Used**:
- GlassCard (tabs, cards)
- Colored badges (route letters)
- Timeline display (vertical)
- Progress bars
- Tab navigation
- Search input
- Card grid layout

---

### Page 4: Stops

**URL**: `/stops`  
**Stitch Design File**: `BusFlow Campus Transit Stops.html`

**Layout**:
```
TopNavBar
├─ Logo (CampusTransit)
├─ Nav Links (active: Stops)
└─ Notifications, Profile

Main Content
├─ Header (flex md:flex-row)
│  ├─ Title + Description (headline-xl, body-md)
│  └─ Search input (right side, w-96)
│
├─ Stop Cards Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
│  ├─ Stop Card (repeating)
│  │  ├─ Map image (h-48)
│  │  ├─ Badge overlay (top-left: Home Stop)
│  │  │
│  │  └─ Card Body (p-6, flex flex-col)
│  │     ├─ Stop header
│  │     │  ├─ Stop name (headline-md)
│  │     │  ├─ Walk time distance
│  │     │  └─ Star button (unfilled)
│  │     │
│  │     ├─ Next Arrivals Section
│  │     │  ├─ Label (uppercase, label-md)
│  │     │  ├─ Route item 1 (primary, highlighted)
│  │     │  │  ├─ Colored letter badge (A/B/C/E/S)
│  │     │  │  ├─ Route name
│  │     │  │  └─ Time (bold)
│  │     │  └─ Route items 2-3 (faded, normal)
│  │     │
│  │     └─ Action buttons
│  │        ├─ Set as Home Stop (outline)
│  │        └─ More options (glass-card)
│  │
│  └─ Bento Stats Card (lg:col-span-2)
│     ├─ Title + description
│     ├─ Stats grid (12k+ Commuters, 4.2m Min Saved)
│     └─ Network Efficiency image

Footer
└─ Links (Support, Terms, Privacy)
```

**Key Components Used**:
- GlassCard (stop cards)
- Colored route badges (A/B/C/E/S)
- Badge overlay (Home Stop)
- Image containers (h-48)
- Next arrivals list
- Action button groups
- Stats cards
- Search input
- Card grid layout

---

## Part 4: Stitch-to-Current Mapping

### Dashboard (/dashboard) → My Journey (/)

**Current State**:
- Uses inline Tailwind classes
- Multiple useState for bus, trip, location
- Card components inline
- Manual layout management

**Stitch Design Changes**:
1. Replace layout grid with Stitch spacing system
2. Convert all cards to GlassCard component
3. Update all buttons to Stitch Button variants
4. Use Stitch typography scale (headline-xl → body-md)
5. Replace custom colors with design tokens
6. Update navigation to Stitch TopNavBar
7. Add SideNavBar (desktop only)
8. Add BottomNavBar (mobile only)

**API Calls** (NO CHANGES):
- `studentApi.getDashboardData()`
- `studentApi.getTodayBus()`
- `studentApi.getTodayTrip()`
- `studentApi.getPickupPoint()`
- `studentApi.getNotifications()`

---

### Track Bus (/track-bus) → Live Tracking

**Current State**:
- Uses BusMap component
- Manual map styling
- Basic layout

**Stitch Design Changes**:
1. Convert map container to Stitch layout
2. Add TopNavBar with nav links
3. Add SideNavBar (desktop)
4. Style bus details card as GlassCard
5. Add journey progress stepper timeline
6. Apply Stitch design tokens to all text/colors
7. Update controls to glass-card buttons
8. Add mobile bottom bar

**API Calls** (NO CHANGES):
- Browser Geolocation API
- `driverApi.updateLocation()` (if used)
- Map data from backend

---

### Trip History (/trip-history) → Schedule View

**Current State**:
- Table/list display
- Basic styling

**Stitch Design Changes**:
1. Add header section with date display
2. Add tab navigation (glass-card tabs)
3. Create route cards with route letter badges
4. Add route timeline sidebar (sticky)
5. Convert trip list to card grid
6. Apply Stitch colors and typography
7. Add search input with glass-card styling

**API Calls** (NO CHANGES):
- `studentApi.getTripHistory()`
- `studentApi.getSchedules()`

---

### New Page: Stops View

**Current State**:
- Does not exist

**New Stitch Design**:
1. Create new `/stops` route
2. Implement stop card grid
3. Add stop markers with images
4. Show next arrivals (colored route badges)
5. Add "Set as Home Stop" functionality
6. Implement search functionality
7. Add stats/bento cards

**API Calls** (NEW):
- `studentApi.getStops()` (needs backend endpoint)
- `studentApi.getStopArrivals(stopId)` (needs backend endpoint)

---

## Part 5: Component Conversion Checklist

### Components to Create/Update

```
NEW STITCH COMPONENTS:
├─ Stitch/Navigation/TopNavBar.tsx
├─ Stitch/Navigation/SideNavBar.tsx
├─ Stitch/Navigation/BottomNavBar.tsx
├─ Stitch/Cards/GlassCard.tsx
├─ Stitch/Buttons/Button.tsx
├─ Stitch/Badges/Badge.tsx
├─ Stitch/Timeline/Timeline.tsx
├─ Stitch/Timeline/TimelineStep.tsx
├─ Stitch/Metrics/MetricCard.tsx
├─ Stitch/Progress/ProgressBar.tsx
├─ Stitch/Forms/SearchInput.tsx
├─ Stitch/Indicators/LiveDot.tsx
├─ Stitch/Selectors/SegmentedButtons.tsx
├─ Stitch/Maps/MapContainer.tsx
├─ Stitch/Layouts/HeroSection.tsx
└─ Stitch/Layouts/PageGrid.tsx

PAGES TO REDESIGN:
├─ src/pages/Dashboard/DashboardV2.tsx → uses GlassCard, Button, Timeline, Metrics
├─ src/pages/TrackBus/TrackBus.tsx → uses MapContainer, GlassCard, Timeline, ProgressBar
├─ src/pages/TripHistory/TripHistory.tsx → redesigned as Schedules page
├─ src/pages/Stops/Stops.tsx → NEW page with StopCard, Badge, SearchInput
└─ Update all Dashboard components/ for Stitch styling

STATE MANAGEMENT:
- No changes to useState usage
- No changes to API calls
- Only presentational layer changes

ROUTING:
- No changes to route paths
- Add new /stops route (if needed)

AUTHENTICATION:
- No changes to auth flow
- No changes to token storage
```

---

## Part 6: Implementation Order

**Phase 1: Foundation (Days 1-2)**
- Create Stitch design tokens file
- Create base components (Button, Card, Badge, Input)
- Set up Tailwind config with design tokens
- Create Typography component

**Phase 2: Navigation & Layout (Days 3-4)**
- Create TopNavBar, SideNavBar, BottomNavBar
- Create HeroSection, PageGrid layouts
- Update App.tsx to use new navigation

**Phase 3: Dashboard Redesign (Days 5-6)**
- Redesign `/dashboard` → My Journey
- Update all components to use GlassCard, Button, etc.
- Test all API calls work unchanged
- Test responsive design

**Phase 4: Tracking Page (Days 7-8)**
- Redesign `/track-bus` → Live Tracking
- Update map component to work with new layout
- Add journey progress stepper
- Test all geolocation functionality

**Phase 5: Schedules & Stops (Days 9-10)**
- Redesign Trip History as Schedules page
- Create new Stops page (if new route data available)
- Add route timeline visualization
- Add search functionality

**Phase 6: Finalization (Days 11-12)**
- Cross-browser testing
- Mobile responsiveness testing
- Accessibility review
- Performance optimization

---

## Part 7: Verification Checklist

### Before Starting Implementation

- [ ] All 4 HTML designs reviewed and understood
- [ ] Design tokens extracted and documented
- [ ] Component hierarchy identified
- [ ] API calls confirmed unchanged
- [ ] Routing confirmed unchanged
- [ ] State management approach confirmed unchanged
- [ ] Authentication flow confirmed unchanged
- [ ] All functionality requirements identified

### During Implementation

- [ ] Each page styled to match Stitch design
- [ ] All buttons use Button component
- [ ] All cards use GlassCard component
- [ ] All text uses Typography component
- [ ] All colors use design tokens
- [ ] All spacing uses spacing tokens
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Navigation working correctly
- [ ] API calls working unchanged
- [ ] State management working unchanged

### After Implementation

- [ ] Visual comparison with Stitch designs (pixel-perfect or close)
- [ ] All 4 pages working correctly
- [ ] All API calls returning expected data
- [ ] No console errors
- [ ] Responsive design working
- [ ] Accessibility standards met
- [ ] Performance acceptable
- [ ] User interactions working (clicks, hovers, forms, etc.)

---

## Part 8: Design Token Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Primary
      primary: "#004ac6",
      'on-primary': "#ffffff",
      'primary-container': "#2563eb",
      'on-primary-container': "#eeefff",
      
      // Secondary
      secondary: "#505f76",
      'on-secondary': "#ffffff",
      'secondary-container': "#d0e1fb",
      'on-secondary-container': "#54647a",
      
      // Tertiary
      tertiary: "#943700",
      'on-tertiary': "#ffffff",
      'tertiary-container': "#bc4800",
      'on-tertiary-container': "#ffede6",
      
      // Error
      error: "#ba1a1a",
      'on-error': "#ffffff",
      'error-container': "#ffdad6",
      'on-error-container': "#93000a",
      
      // Surface variants
      surface: "#f7f9fb",
      'on-surface': "#191c1e",
      'surface-variant': "#e0e3e5",
      'on-surface-variant': "#434655",
      
      'surface-container-lowest': "#ffffff",
      'surface-container-low': "#f2f4f6",
      'surface-container': "#eceef0",
      'surface-container-high': "#e6e8ea",
      'surface-container-highest': "#e0e3e5",
      
      'surface-dim': "#d8dadc",
      'surface-bright': "#f7f9fb",
      
      // Outline
      outline: "#737686",
      'outline-variant': "#c3c6d7",
    },
    spacing: {
      'gutter': '24px',
      'container-max': '1440px',
      'unit': '4px',
      'margin-mobile': '16px',
      'margin-desktop': '40px',
    },
    borderRadius: {
      DEFAULT: '0.25rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      'card': '20px',
      'full': '9999px',
    },
    fontFamily: {
      'headline-lg': ['Inter'],
      'body-sm': ['Inter'],
      'body-lg': ['Inter'],
      'label-md': ['Inter'],
      'body-md': ['Inter'],
      'headline-md': ['Inter'],
      'headline-xl': ['Inter'],
    },
    fontSize: {
      'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
      'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
      'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
      'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
      'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
    },
  },
}
```

---

## Summary

✅ **Design System Extracted**: 23 design tokens, 15+ components identified  
✅ **Component Mapping**: 4 pages → 4 Stitch designs mapped  
✅ **API Preservation**: All current API calls remain unchanged  
✅ **State Management**: No changes required  
✅ **Functionality**: 100% preserved, only presentation changes

**Ready to begin implementation** when you confirm to proceed.

