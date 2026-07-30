# 🚌 BusFlow SaaS - Campus Transit Management

BusFlow is an AI-powered B2B SaaS platform that enables universities to optimize their campus transportation system through live bus tracking, timetable synchronization, predictive ETAs, weather-aware alerts, and intelligent fleet management.

## 📖 Project Documentation

### Core Specifications
- **[SPEC.md](./SPEC.md)** - Overall project requirements, problem statement, and success criteria
- **[ADMIN_SPEC.md](./ADMIN_SPEC.md)** - Detailed admin dashboard specification with architecture and API endpoints
- **[CLAUDE.md](./CLAUDE.md)** - Development conventions, tech stack, and project boundaries

### Frontend Development
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Next.js frontend setup, development workflow, and API usage
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Summary of created files and features

## 🏗️ Project Architecture

```
BusFlow SaaS
├── Frontend (Next.js App Router)
│   ├── Admin Dashboard (Transport Manager UI)
│   ├── Student Client (Travel Planning & Tracking)
│   └── Driver App (Trip Management & GPS)
│
├── Backend (FastAPI)
│   ├── Fleet Management APIs
│   ├── Route & Stop Management
│   ├── Student Directory & Timetable Sync
│   ├── Driver Management & Tracking
│   ├── Weather Intelligence Engine
│   ├── Notifications & Broadcast System
│   └── Analytics Dashboard
│
├── Database (PostgreSQL / Supabase)
│   ├── Users & Roles (RBAC)
│   ├── Buses, Drivers, Routes, Stops
│   ├── Students & Timetables
│   ├── GPS Logs & Tracking Data
│   ├── Notifications & Alerts
│   └── Analytics & Reports
│
└── External Services
    ├── Google Maps API (Tracking & Routes)
    ├── Weather API (Forecasting)
    ├── OpenAI API (ETA Prediction)
    ├── Clerk (Authentication)
    └── Supabase (Database & Auth)
```

## 🛠️ Tech Stack

### Frontend
- **Next.js** 15 - React framework with App Router
- **React** 19 - UI library
- **TypeScript** 5.2 - Type safety
- **Tailwind CSS** 3.3.6 - Utility-first styling

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations

### Database
- **PostgreSQL** - Relational database
- **Supabase** - Hosted PostgreSQL with authentication

### Authentication
- **Clerk** - Modern authentication platform

### Deployment
- **Vercel** - Next.js frontend hosting
- **Railway** - FastAPI backend hosting
- **Supabase** - Managed PostgreSQL

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL 12+ (or Supabase account)

### Frontend Setup

```bash
cd BusFlow
npm install
cp .env.example .env.local
# Edit .env.local with your backend API URL
npm run dev
```

Access the admin dashboard at `http://localhost:3000/admin`

### Backend Setup (Documentation coming)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## 📱 Core Modules

### 1. Admin Dashboard (Implemented ✅)
- Real-time fleet monitoring
- KPI metrics and analytics
- Route and bus management
- Student and driver management
- Weather alerts and delays
- CSV import for bulk operations

**Location:** `/admin`

### 2. Fleet Management
- View and manage buses
- Assign drivers and routes
- Enable/disable vehicles
- Track bus capacity and status

**Status:** 🔲 Ready for implementation

### 3. Route Management
- Create and edit routes
- Define bus stops
- Map route geography
- Assign buses and schedules

**Status:** 🔲 Ready for implementation

### 4. Live Tracking
- Real-time GPS map visualization
- Current speed and heading
- Dynamic ETA calculation
- Delay status indicators

**Status:** 🔲 Ready for implementation

### 5. Student Management
- Bulk CSV import
- Student directory
- Bus stop assignment
- Route preferences
- Attendance tracking

**Status:** 🔲 Ready for implementation

### 6. Driver Management
- Driver registration
- License upload and validation
- Bus assignments
- Contact information
- Performance metrics

**Status:** 🔲 Ready for implementation

### 7. Timetable Sync
- Academic schedule import
- Department-wise schedules
- Semester management
- Class timing integration

**Status:** 🔲 Ready for implementation

### 8. Weather Intelligence
- Real-time weather polling
- Precipitation probability tracking
- ETA adjustments for weather
- Automated delay alerts

**Status:** 🔲 Ready for implementation

### 9. Notifications System
- Broadcast messaging
- Route-specific alerts
- Bus-specific notifications
- Driver communications

**Status:** 🔲 Ready for implementation

### 10. Analytics Dashboard
- Daily trip metrics
- Bus capacity utilization
- Delay analysis
- Student attendance reports
- Route performance metrics

**Status:** 🔲 Ready for implementation

## 📊 API Endpoints

All endpoints are documented in [ADMIN_SPEC.md](./ADMIN_SPEC.md#-required-backend-apis-fastapi)

### Core Endpoint Categories
- `/api/v1/dashboard/*` - Dashboard KPIs and summaries
- `/api/v1/buses/*` - Fleet management
- `/api/v1/routes/*` - Route operations
- `/api/v1/students/*` - Student management
- `/api/v1/drivers/*` - Driver management
- `/api/v1/tracking/*` - Live GPS tracking
- `/api/v1/weather/*` - Weather data and alerts
- `/api/v1/notifications/*` - Broadcast system
- `/api/v1/timetable/*` - Academic schedule management

## 🎯 Demo Workflow (Hackathon Focus)

To demonstrate BusFlow's core value:

1. **Admin CSV Upload** - Import students and timetables
2. **Resource Allocation** - Create route and assign bus + driver
3. **Trip Activation** - Driver starts trip via browser
4. **Real-Time Tracking** - GPS coordinates stream to map
5. **Weather Alert** - Simulate rain to trigger alerts
6. **Student Notification** - Updated ETA sent to student
7. **Dashboard Monitoring** - Admin sees all operations

See [ADMIN_SPEC.md](./ADMIN_SPEC.md#-hackathon-focus-end-to-end-demo-workflow) for full workflow details.

## 🔐 Security & Compliance

- Role-Based Access Control (RBAC)
- Clerk authentication integration
- Environment variable protection
- No hardcoded secrets
- HTTPS-ready deployment
- SQL injection prevention (SQLAlchemy ORM)
- CORS properly configured

See [CLAUDE.md](./CLAUDE.md#-boundaries) for security boundaries.

## 📋 Development Workflow

### Branching Strategy
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/bug-name`
- Refactoring: `refactor/area-name`
- Documentation: `docs/topic`

### Commit Conventions
```
feat: Add feature description
fix: Fix bug description
refactor: Refactor code area
docs: Update documentation
test: Add or update tests
```

### Testing Requirements
- Unit tests for all services
- Integration tests for APIs
- Component tests for UI
- E2E tests for critical flows

### Code Quality
- TypeScript strict mode
- Linting with ESLint
- Type checking before commits
- Code reviews required before merge

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway)
- Connect GitHub repository
- Auto-deploy on push to main
- Environment variables configured in Railway dashboard

### Database (Supabase)
- Managed PostgreSQL hosting
- Automatic backups
- Connection pooling enabled
- Row-level security (RLS) for multi-tenant data

## 📞 Contact & Support

For issues, questions, or contributions:
1. Check existing documentation in this repository
2. Review the [ADMIN_SPEC.md](./ADMIN_SPEC.md) for feature details
3. Check [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) for development help
4. Refer to [CLAUDE.md](./CLAUDE.md) for conventions and boundaries

## 📄 License

BusFlow SaaS - All Rights Reserved

---

**Current Status:** Frontend foundation complete, ready for module-by-module feature development.

**Next Phase:** Implement fleet management, routes, and live tracking modules.
