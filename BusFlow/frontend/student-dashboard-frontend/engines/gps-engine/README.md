# GPS Engine (`engines/gps-engine`)

```text
engines/gps-engine/
├── tracking/                 # Telemetry ingestion and Redis spatial caching
│   └── GpsTracker.ts
├── geofencing/               # Hysteresis-based geofence calculation
│   └── GeofenceEvaluator.ts
├── eta/                      # Route line-string distance & ETA calculation
│   └── EtaCalculator.ts
├── validation/               # Speed/bearing anomaly detection & Student GPS check
│   └── GpsValidator.ts
└── simulation/               # GPS mock stream interfaces
    └── GpsSimulatorAdapter.ts
```
