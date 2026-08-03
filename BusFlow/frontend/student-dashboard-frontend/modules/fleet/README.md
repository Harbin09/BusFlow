# Fleet Domain Module (`modules/fleet`)

## Bounded Context
Manages Vehicle Inventory, Bus Capacity Configuration, Vehicle Health/Maintenance States.

```text
modules/fleet/
├── domain/                   # Pure Business Rules
│   ├── entities/             # Bus, MaintenanceRecord
│   ├── value-objects/        # LicensePlate, SeatCapacity, VehicleStatus (ACTIVE, MAINTENANCE)
│   ├── events/               # BusCapacityExceededEvent, BusMaintenanceTriggeredEvent
│   └── exceptions/           # BusUnavailableException
├── application/              # Use Cases & Interfaces
│   ├── use-cases/            # RegisterBus, UpdateCapacity, SetMaintenanceStatus
│   ├── ports/                # BusRepositoryPort
│   └── dtos/                 # BusDetailsDTO
├── infrastructure/           # Framework Adapters
│   └── persistence/          # PostgresBusRepositoryImpl
└── presentation/             # API Adapters
    └── controllers/          # FleetManagementController
```
