# Routing Domain Module (`modules/routing`)

## Bounded Context
Manages Base Routes, Bus Stops, Geo-fence Geometries, and Dynamic Temporary Route Overrides.

```text
modules/routing/
├── domain/                   # Pure Business Rules
│   ├── entities/             # Route, Stop, RouteOverride
│   ├── value-objects/        # GeoCoordinates, GeoFenceRadius, OverrideDuration (TTL)
│   ├── events/               # RouteCreatedEvent, TemporaryOverrideAppliedEvent
│   └── exceptions/           # InvalidRouteGeometryException, OverrideExpiredException
├── application/              # Use Cases & Interfaces
│   ├── use-cases/            # CreateRoute, ApplyDynamicOverride, ExpireOverrides
│   ├── ports/                # RouteRepositoryPort, RouteOverrideRepositoryPort
│   └── dtos/                 # RouteDetailsDTO, DynamicOverrideDTO
├── infrastructure/           # Framework Adapters
│   └── persistence/          # PostgresRouteRepositoryImpl, PostGISGeoAdapter
└── presentation/             # API Adapters
    └── controllers/          # RouteManagementController, DynamicOverrideController
```

> [!IMPORTANT]
> **Dynamic Route Overrides Requirement**:
> Overrides are saved as distinct `RouteOverride` entities pointing to a `baseRouteId` with an explicit `expiresAt` timestamp. The base route remains immutable, preventing corruption.
