# Simulation Runner (`apps/simulation-runner`)

## Responsibilities

Standalone executable host for running system simulations:

- Executes scenario scripts from `engines/simulation-engine`.
- Generates live synthetic GPS pings directly to `gps-engine`.
- Simulates student boarding scans against `rule-engine`.
- Triggers dynamic route overrides and tests automatic TTL expiration.
