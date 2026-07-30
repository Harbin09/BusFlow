# BUS FLOW - Architectural Blueprint & Design Principles

## 1. Architectural Strategy: Modular Monolith

BUS FLOW is designed as a **Modular Monolith** using **Domain-Driven Design (DDD)** and **Clean Architecture**.

### Why Modular Monolith?
- **Domain Boundaries**: Keeps code structured into self-contained domains without network latency between internal service calls.
- **Microservices Ready**: Clear interfaces (Ports & Adapters) ensure any domain module (e.g. `gps-engine` or `trips`) can be extracted into an independent microservice when required.
- **Zero Single Point of Failure**: Stateless API nodes can be horizontally scaled, with database connections pooled cleanly across domain boundaries.

---

## 2. Clean Architecture Layering

Each module under `modules/` follows strict Clean Architecture layering:

```text
modules/<domain_name>/
├── domain/                  # Pure Business Logic (No external framework dependencies)
│   ├── entities/            # Domain Entities with internal invariants
│   ├── value-objects/       # Immutable Value Objects (Coordinates, Monies, Credits)
│   ├── events/              # Domain Events triggered by state changes
│   └── exceptions/          # Domain-specific validation exceptions
├── application/             # Application Logic / Orchestration
│   ├── use-cases/           # Input Boundary Use Cases (Commands & Queries)
│   ├── ports/               # Output Interfaces (Repositories, External Clients)
│   └── dtos/                # Data Transfer Objects across boundary
├── infrastructure/          # Data Access & External Adapters
│   ├── persistence/         # Database Repositories implementation
│   ├── messaging/           # Event Publishers & Subscribers
│   └── external/            # Third-party integrations
└── presentation/            # Entry points for Apps
    ├── controllers/         # REST / GraphQL Controllers
    └── dtos/                # API Request / Response definitions
```

---

## 3. Core Constraints & Guarantees

1. **Rule-Based Engine**: Decisions are strictly deterministic and rule-driven. No opaque ML models.
2. **Bus GPS as Primary Source of Truth**: Vehicle location drives state transitions (Stop Arrivals, Geofence triggers, ETA calculation).
3. **Student GPS Validation**: Used exclusively for trip-based proximity validation during boarding or stop change requests.
4. **Temporary Route Overrides**: Dynamic route modifications are represented as temporary `RouteOverride` entities with automatic TTL expiration, protecting base routes from permanent corruption.
