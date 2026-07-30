# Shared Technical Utilities (`libs/utils`)

```text
libs/utils/
├── Haversine.ts              # High-performance distance calculation between lat/lng points
├── DateUtils.ts              # Timezone-aware date helpers & monthly billing cycle calculators
└── IdGenerator.ts            # UUID v4 and deterministic ID generators
```

## Haversine Formula Specification
Calculates the great-circle distance between two points on a sphere given their longitudes and latitudes. Used extensively in `engines/gps-engine` for 50m stop arrival geofence detection.
