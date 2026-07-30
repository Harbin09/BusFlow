# BUS FLOW - GPS Engine Specification

## Overview

The **GPS Engine** (`engines/gps-engine`) processes high-frequency telemetry from active buses and validates student proximity pings during boarding.

---

## Technical Responsibilities

```text
  [ Bus Telemetry Ping ] ──► [ GPS Ingestion Pipeline ]
                                       │
                                       ├─► [ Movement Validator (Speed/Bearing Checks) ]
                                       │
                                       ├─► [ Geofence Evaluator (Arrival/Departure) ]
                                       │
                                       ├─► [ ETA Calculator (Distance + Avg Speed) ]
                                       │
                                       └─► [ Fast In-Memory Cache (Redis spatial index) ]
```

### 1. Primary Source of Truth
- Bus GPS is the sole driver of live trip progress, stop arrival notifications, and live tracking map updates.

### 2. Student GPS Validation
- Student GPS location is sampled strictly during boarding or stop change requests.
- Validates that student location falls within the geofence of the bus/stop at time of boarding.

### 3. Geofencing Algorithm
- Uses Haversine/WGS84 distance calculations.
- Implements hysteresis buffers (50m entry, 100m exit) to prevent ping jitter from generating duplicate arrival/departure events.

### 4. ETA Engine
- Calculates remaining distance along active route line-strings.
- Incorporates historical stop dwell times and dynamic speed averages.
