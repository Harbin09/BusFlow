# Student Portal - BUS FLOW

Pure frontend Student Dashboard for the BUS FLOW Transportation Management System.

## Features

- **Today's Bus Information** - Real-time bus assignment and status
- **Pickup Point Details** - Location and pickup time
- **Notifications** - Route updates and alerts
- **Return Trip Tracking** - Return journey information
- **Missed Bus Management** - Credit balance and options
- **Quick Actions** - Track bus, report issues, view history

## Tech Stack

- **Frontend Framework**: React 18+
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Hooks + Context API
- **HTTP Client**: Axios
- **Responsive Design**: Mobile-first approach

## API Consumption

The dashboard is a pure frontend consumer of:
- GET `/api/students/today-bus` - Today's bus assignment
- GET `/api/students/today-trip` - Trip information
- GET `/api/students/notifications` - Recent notifications
- GET `/api/students/pickup-point` - Pickup location
- GET `/api/students/return-trip` - Return trip details
- GET `/api/students/missed-bus` - Missed bus info

## Project Structure

```
student-portal/
├── src/
│   ├── pages/
│   │   └── Dashboard/
│   ├── components/
│   │   ├── Cards/
│   │   ├── Loading/
│   │   └── Common/
│   ├── services/
│   │   └── api/
│   ├── types/
│   ├── hooks/
│   ├── context/
│   ├── styles/
│   └── App.tsx
├── public/
├── tests/
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm build
```

## Key Components

1. **Dashboard Layout** - Main layout with header, content area, footer
2. **Bus Card** - Today's bus with status and ETA
3. **Pickup Card** - Pickup point and time
4. **Notifications** - Recent alerts and updates
5. **Action Buttons** - Track, report, history
6. **Error States** - Graceful error handling
7. **Loading States** - Skeleton screens and spinners

## Design Principles

- **API-First**: All data from APIs, no hardcoded values
- **Pure Frontend**: No backend logic, calculations, or business rules
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: WCAG compliant with semantic HTML
- **Type-Safe**: Full TypeScript coverage
- **Error Handling**: Comprehensive error states
- **Performance**: Optimized rendering, lazy loading

## Documentation

- See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design
- See [COMPONENTS.md](./COMPONENTS.md) for component documentation
- See [API.md](./API.md) for API integration details
