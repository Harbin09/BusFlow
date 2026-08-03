# Driver API (`apps/driver-api`)

## Responsibilities

High-throughput, resilient API serving the Driver Mobile Application:

- **Start/End Trip**: Managing active trip state transitions.
- **GPS Tracking Ingestion**: Ingesting high-frequency vehicle coordinate pings (1-5s intervals).
- **Emergency Alerts**: One-tap driver panic button dispatches urgent notification to admin portal.
- **Trip Information**: Accessing current route sequence, stop list, and dynamic overrides.
- **Issue Reporting**: Reporting vehicle faults, road hazards, or student issues.
