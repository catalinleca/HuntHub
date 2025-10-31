# Modules Layer

**Purpose:** Atomic domain entities with single-responsibility CRUD operations.

**Characteristics:**

- Single-entity focused (Hunt, Step, User, Asset, etc.)
- Self-contained domain logic
- Direct database mapping
- No cross-module orchestration

**Examples:**

- `hunts/` - Hunt entity CRUD + basic operations
- `steps/` - Step entity CRUD + challenge validation
- `users/` - User management
- `assets/` - Asset management
- `auth/` - Authentication domain

**Structure per module:**

```
hunts/
├── hunt.controller.ts    # HTTP handlers
├── hunt.service.ts       # Domain logic (CRUD)
├── hunt.routes.ts        # Route definitions
└── hunt.validation.ts    # Request validation schemas
```

**Dependencies:**

- Can use `database/` models and types
- Can use `shared/` mappers, errors, utils
- Can use `services/` for infrastructure needs
- Should NOT depend on `features/` (circular!)

**Rules:**

- Keep modules focused on single entity
- Complex orchestration goes in features/
- External integrations go in services/
