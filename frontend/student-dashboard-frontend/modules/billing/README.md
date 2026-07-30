# Billing / Credit Management Domain Module (`modules/billing`)

## Bounded Context
Manages Student Bus Switching Credits (5 free credits allocated per calendar month), credit deductions, and monthly balance refreshes.

```text
modules/billing/
├── domain/                   # Pure Business Rules
│   ├── entities/             # StudentCreditAccount, CreditTransaction
│   ├── value-objects/        # CreditBalance, TransactionType (MONTHLY_GRANT, BUS_SWITCH_DEDUCTION)
│   ├── events/               # CreditsDeductedEvent, MonthlyCreditsResetEvent
│   └── exceptions/           # InsufficientCreditsException
├── application/              # Use Cases & Interfaces
│   ├── use-cases/            # DeductSwitchCredit, ResetMonthlyCredits
│   ├── ports/                # CreditAccountRepositoryPort
│   └── dtos/                 # CreditAccountDTO
├── infrastructure/           # Framework Adapters
│   └── persistence/          # PostgresCreditRepositoryImpl
└── presentation/             # API Adapters
    └── controllers/          # CreditManagementController
```
