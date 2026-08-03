# Support Domain Module (`modules/support`)

## Bounded Context
Manages Student & Driver Issue Tickets, Category Triage, and Admin Resolution Workflow.

```text
modules/support/
├── domain/                   # Pure Business Rules
│   ├── entities/             # Ticket, TicketComment
│   ├── value-objects/        # TicketPriority, TicketCategory, TicketStatus
│   ├── events/               # TicketCreatedEvent, TicketResolvedEvent
│   └── exceptions/           # TicketAlreadyClosedException
├── application/              # Use Cases & Interfaces
│   ├── use-cases/            # SubmitTicket, ResolveTicket, AddComment
│   ├── ports/                # TicketRepositoryPort
│   └── dtos/                 # TicketDTO
├── infrastructure/           # Framework Adapters
│   └── persistence/          # PostgresTicketRepositoryImpl
└── presentation/             # API Adapters
    └── controllers/          # SupportTicketController
```
