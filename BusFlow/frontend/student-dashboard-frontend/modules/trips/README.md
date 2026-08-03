# Trips Domain Module (`modules/trips`)

## Bounded Context
Manages Active Trip Lifecycles, Student Boarding Records, Missed Bus Events, and Historical Trip Logs.

```text
modules/trips/
├── domain/                   # Pure Business Rules
│   ├── entities/             # Trip, BoardingRecord, StudentSwitchRequest
│   ├── value-objects/        # TripStatus (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
│   ├── events/               # TripStartedEvent, StudentBoardedEvent, MissedBusDetectedEvent
│   └── exceptions/           # InvalidTripStateException, StudentAlreadyBoardedException
├── application/              # Use Cases & Interfaces
│   ├── use-cases/            # StartTrip, EndTrip, RecordBoarding, ProcessSwitchRequest
│   ├── ports/                # TripRepositoryPort, BoardingRecordRepositoryPort
│   └── dtos/                 # ActiveTripDTO, StudentBoardingDTO
├── infrastructure/           # Framework Adapters
│   └── persistence/          # PostgresTripRepositoryImpl
└── presentation/             # API Adapters
    └── controllers/          # TripController, BoardingController
```
