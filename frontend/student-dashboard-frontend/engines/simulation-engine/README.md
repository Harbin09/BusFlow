# Simulation Engine (`engines/simulation-engine`)

```text
engines/simulation-engine/
├── generators/               # Synthetic event streams
│   ├── BusGpsGenerator.ts
│   ├── StudentBoardingGenerator.ts
│   └── TrafficConditionGenerator.ts
├── scenarios/                # Prescribed simulation scenarios
│   ├── NormalCommuteScenario.ts
│   ├── RouteOverrideScenario.ts
│   └── CapacityOverflowScenario.ts
└── orchestrator/             # Clock controller (1x, 5x, 10x speed playback)
    └── SimulationOrchestrator.ts
```
