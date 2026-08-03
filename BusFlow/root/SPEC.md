# SPEC.md

# 🚀 Smart Campus Transit SaaS

## Project Name

**Smart Campus Transit SaaS**

An AI-powered B2B SaaS platform that enables universities to optimize
their existing campus transportation system through live bus tracking,
timetable synchronization, predictive ETAs, weather-aware alerts, and
intelligent fleet management---without owning or operating any buses.

------------------------------------------------------------------------

# Problem

## Who has this problem?

### Students

-   Miss buses due to inaccurate schedules.
-   Have no reliable way to know real arrival times.
-   Receive little or no notification about delays.

### Faculty & Staff

-   Face uncertainty in planning their commute.
-   Experience delays during bad weather or traffic.

### Transport Managers

-   Manage fleets manually using spreadsheets and phone calls.
-   Lack real-time visibility into buses and drivers.
-   Cannot efficiently analyze fleet utilization.

### Universities

-   Spend resources on inefficient transport operations.
-   Receive frequent complaints regarding delays and communication.
-   Have no centralized platform for transport management.

------------------------------------------------------------------------

## How is this solved today?

Current campus transportation relies on: - Static bus schedules -
WhatsApp groups - Manual phone calls - GPS systems without timetable
integration - Manual fleet monitoring

These methods are reactive rather than proactive, resulting in missed
buses, poor communication, inefficient fleet utilization, increased
operational costs, and lower commuter satisfaction.

------------------------------------------------------------------------

# Core Flow

> **Demo one complete user journey (5--6 steps only).**

### Student Journey

1.  Student logs into the platform.
2.  Today's academic timetable is automatically synchronized.
3.  AI recommends the most suitable bus based on class timing and
    location.
4.  Student tracks the selected bus in real time and views the predicted
    ETA.
5.  Traffic or weather causes a delay; AI recalculates the ETA and sends
    a notification.
6.  Student reaches campus while the Transport Manager monitors the trip
    from the dashboard.

------------------------------------------------------------------------

# Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

## Backend

-   FastAPI
-   Uvicorn (ASGI Server)
-   Pydantic (Data Validation)

## Database

-   PostgreSQL
-   SQLAlchemy (ORM)
-   Alembic (Database Migrations)

## Authentication

-   Clerk Authentication

## Maps & Tracking

-   Google Maps API

## AI Layer

-   OpenAI API
-   Weather API
-   Traffic API

## Deployment

-   Vercel (Frontend)
-   Railway (Backend)
-   Supabase (PostgreSQL)

------------------------------------------------------------------------

# Done =

The project is considered complete when:

-   ✅ Students can securely log in.
-   ✅ Academic timetable is synchronized.
-   ✅ AI recommends the appropriate bus.
-   ✅ Live bus tracking works on the map.
-   ✅ AI-generated ETA is displayed.
-   ✅ Weather and traffic alerts automatically update ETAs.
-   ✅ Transport Manager dashboard shows active buses and trip status.
-   ✅ The complete 6-step demo journey works without errors.

------------------------------------------------------------------------

# Scope

## MVP (Must Have)

-   Authentication
-   Role-Based Access Control
-   Bus & Route Management
-   Live Bus Tracking
-   Timetable Synchronization
-   AI ETA Calculation
-   Basic Notifications
-   Transport Manager Dashboard

## Enhancements (Should Have)

-   AI Delay Prediction
-   Route Optimization
-   Weather Intelligence
-   Analytics Dashboard
-   Driver Reporting
-   Student Personalization
-   Audit Logs

## Future Roadmap (Could Have)

-   Passenger Demand Forecasting
-   Voice Assistant
-   QR Boarding
-   IoT Occupancy Sensors
-   Vehicle Health Monitoring
-   SOS Module
-   Carbon Emission Dashboard
-   Gamification
-   Calendar Integrations

------------------------------------------------------------------------

# Success Criteria

A successful demo should clearly show: - Live tracking of a campus
bus. - AI-generated ETA. - Automatic delay detection. - Timetable-aware
bus recommendation. - Real-time notifications. - Fleet visibility for
transport managers.

The audience should understand the complete workflow within **5--6 user
actions**, demonstrating intelligent automation and real-time decision
support.
