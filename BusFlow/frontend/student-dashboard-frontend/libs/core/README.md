# Shared Core Building Blocks (`libs/core`)

Contains DDD tactical building blocks implemented as framework-agnostic base abstractions:

- `Entity<T>`: Base class for domain entities with UUID identification and equality logic.
- `AggregateRoot<T>`: Entity subclass capable of capturing and dispatching `DomainEvent` instances.
- `ValueObject<T>`: Immutable value object base with structural equality evaluation.
- `Result<T, E>`: Standard Monadic type for explicit domain success/failure returns without throwing exceptions across layer boundaries.
