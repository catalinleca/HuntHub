# Features Layer

**Purpose:** Complex workflows and orchestration across multiple domain modules.

**Characteristics:**

- Orchestrates multiple domain entities (modules)
- Contains business workflows
- Complex state management
- Application-level use cases

**Examples:**

- `player/` - Gameplay workflow (orchestrates Hunt + Step + Progress + Session)
- `publishing/` - Publishing workflow (orchestrates Hunt + Step + PublishedHunt + LiveHunt)

**Dependencies:**

- Can use `modules/` (domain entities)
- Can use `services/` (external integrations)
- Can use `database/` models

**Rules:**

- Features are higher-level than modules
- Features should NOT be used by modules (circular dependency)
- Each feature should be self-contained orchestration logic
