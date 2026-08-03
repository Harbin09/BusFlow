# Rule Engine (`engines/rule-engine`)

```text
engines/rule-engine/
├── evaluator/                # Rule execution workflow engine
│   └── RuleEvaluator.ts      # Main evaluator class
├── interfaces/               # Clean rule contracts
│   └── IRule.ts              # Standard rule interface
└── rules/                    # Isolated Rule Implementations
    ├── BoardingValidationRule.ts
    ├── BusSwitchingRule.ts
    ├── MissedBusRule.ts
    ├── CapacityManagementRule.ts
    ├── DynamicRouteOverrideRule.ts
    ├── TripValidationRule.ts
    ├── NotificationRule.ts
    └── GeofencingRule.ts
```

## Guarantees
- 100% Deterministic execution.
- Rules are composable and return explicit Pass/Fail responses with standard reason codes.
