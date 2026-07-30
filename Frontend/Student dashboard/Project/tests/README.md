# BUS FLOW - Test Strategy & Test Suites (`tests/`)

## Test Pyramid & Organization

```text
tests/
├── unit/                     # Co-located inside domain modules and engines
├── integration/              # Tests interactions between Rule Engine, GPS Engine, and Domain Repositories
├── e2e/                      # Full flow simulation tests (Admin overrides, Student boarding, Driver pings)
└── load/                     # Performance stress testing (High-frequency GPS ping ingestion)
```

## Running Test Suites

- **Unit Tests**: `npm run test:unit`
- **Integration Tests**: `npm run test:integration`
- **E2E Scenarios**: `npm run test:e2e`
- **Load / Ingestion Benchmark**: `npm run test:load`
