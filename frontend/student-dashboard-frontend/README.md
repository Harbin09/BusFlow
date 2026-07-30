# BUS FLOW - Enterprise Transportation Management System

> **Domain-Driven Design (DDD) | Clean Architecture | Modular Monolith**

BUS FLOW is a modular, production-ready Transportation Management System built to handle high-frequency GPS tracking, dynamic route overrides, rule-based boarding and capacity validations, and multi-portal operations (Admin, Student, Driver).

---

## 🏛️ System Architecture Overview

BUS FLOW follows a **Modular Monolithic Architecture**. While all domains live in a single unified codebase for operational simplicity and transaction boundaries, each module is decoupled behind clean interfaces and strict domain boundaries.

```
                               ┌────────────────────────────────────────┐
                               │           API Apps (apps/)             │
                               │  admin-api | student-api | driver-api │
                               └──────────────────┬─────────────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                │                                 │                                 │
                ▼                                 ▼                                 ▼
    ┌───────────────────────┐         ┌───────────────────────┐         ┌───────────────────────┐
    │ Dynamic Rule Engine   │         │ High-Throughput GPS   │         │ Notification Engine   │
    │ (engines/rule-engine) │         │ (engines/gps-engine)  │         │ (engines/notif-engine)│
    └───────────┬───────────┘         └───────────┬───────────┘         └───────────┬───────────┘
                │                                 │                                 │
                └─────────────────────────────────┼─────────────────────────────────┘
                                                  │
                                                  ▼
                       ┌─────────────────────────────────────────────────────┐
                       │              Domain Modules (modules/)              │
                       │  identity | fleet | routing | trips | support       │
                       └──────────────────────────┬──────────────────────────┘
                                                  │
                                                  ▼
                       ┌─────────────────────────────────────────────────────┐
                       │            Infrastructure & Storage                 │
                       │     PostgreSQL | Redis Cache | Event Broker         │
                       └─────────────────────────────────────────────────────┘
```

---

## 📦 Workspace Structure

```text
.
├── apps/                    # Entry points for Admin, Student, Driver APIs and Simulation Runner
├── engines/                 # Core processing engines (Rule, GPS, Notification, Simulation)
├── modules/                 # Clean Architecture Bounded Contexts (DDD)
│   ├── identity/            # User Auth, Roles, Profiles (Admin, Student, Driver)
│   ├── fleet/               # Vehicle details, Capacity, Maintenance state
│   ├── routing/             # Routes, Stops, Dynamic Temporary Overrides
│   ├── trips/               # Active Trip Lifecycles, History, Student Boarding
│   └── support/             # Issue tickets, Resolution workflow
├── libs/                    # Shared Technical Libraries (Core, Logger, Auth, Errors, DB, Utils)
├── infrastructure/          # Database Schemas, Migrations, Seeds, Cache & Messaging
├── tests/                   # End-to-End, Integration, Unit, and Load Testing suites
└── docs/                    # Architectural Specifications and Domain Documentation
```

---

## 🚀 Key Modules & Engines

1. **Rule Engine (`engines/rule-engine`)**: Core decision maker enforcing boarding validation, bus switching limits (5 credits/month), missed bus handling, capacity constraints, dynamic route expiration, trip validation, and geofencing rules.
2. **GPS Engine (`engines/gps-engine`)**: Primary source of truth for Bus GPS pings, geofence trigger detection, ETA calculation, movement validation, and student GPS verification.
3. **Notification Engine (`engines/notification-engine`)**: Manages alerts for route changes, ETAs, missed buses, capacity warnings, and issue resolutions.
4. **Simulation Engine (`engines/simulation-engine`)**: Provides full end-to-end demo playback of bus movement, student boarding, dynamic route overrides, and stress scenarios.

---

## 📚 Technical Documentation

- 📄 [Architectural Blueprint](docs/architecture.md)
- 📄 [Domain Models & Contracts](docs/domain-model.md)
- 📄 [Rule Engine Specification](docs/rule-engine-spec.md)
- 📄 [GPS Engine Specification](docs/gps-engine-spec.md)
- 📄 [Simulation Engine Design](docs/simulation-spec.md)
