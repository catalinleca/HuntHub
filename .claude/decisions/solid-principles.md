# SOLID Principles in HuntHub

**You emphasized: "We must follow production standards, SOLID mainly, because they actually help."**

**You're absolutely right.** SOLID isn't academic - it enables the "Open for Extension, Closed for Modification" architecture you want.

## SOLID Overview

**S** - Single Responsibility Principle
**O** - Open/Closed Principle ← Your focus
**L** - Liskov Substitution Principle
**I** - Interface Segregation Principle
**D** - Dependency Inversion Principle

Let's see how each applies to HuntHub.

---

## S - Single Responsibility Principle

**"A class should have one, and only one, reason to change."**

### ✅ Good (Current Architecture)

**HuntController:**
```typescript
export class HuntController {
  // ONLY handles HTTP request/response
  async createHunt(req: Request, res: Response) {
    const hunt = req.body;
    const createdHunt = await this.huntService.createHunt(hunt, req.user.id);
    return res.status(201).json(createdHunt);
  }
}
```
**Responsibility:** HTTP layer only

**HuntService:**
```typescript
export class HuntService {
  // ONLY handles business logic
  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const createdHunt = await HuntModel.create({ creatorId, ...hunt });
    return createdHunt.toJSON() as Hunt;
  }
}
```
**Responsibility:** Business logic only

**HuntModel:**
```typescript
const huntSchema = new Schema<IHunt>({...});
```
**Responsibility:** Data persistence only

### ❌ Bad (Anti-pattern)

```typescript
export class HuntController {
  async createHunt(req: Request, res: Response) {
    // ❌ Mixing concerns
    const hunt = req.body;

    // ❌ Business logic in controller
    if (hunt.name.length < 3) {
      return res.status(400).json({ error: 'Name too short' });
    }

    // ❌ Direct DB access in controller
    const created = await HuntModel.create(hunt);

    // ❌ Serialization logic in controller
    const response = {
      ...created.toObject(),
      id: created._id.toString()
    };

    return res.json(response);
  }
}
```

### Application to HuntHub

**Your layers already follow SRP:**
- Controllers → HTTP
- Services → Business logic
- Models → Data
- Middlewares → Cross-cutting concerns
- Utils → Helpers

**Keep this clean as you add features.**

---

## O - Open/Closed Principle

**"Software entities should be open for extension, closed for modification."**

**THIS IS YOUR FOCUS:** "Architecture we choose today to help us extend (SOLID - O)"

### How This Applies to HuntHub

#### Challenge Types (Perfect Example)

You have 4 challenge types: Clue, Quiz, Mission, Task

**❌ Bad (Closed for Extension):**
```typescript
// In HuntService
async validateChallenge(step: Step): Promise<boolean> {
  if (step.type === 'clue') {
    // Validate clue
    return step.challenge.title.length > 0;
  } else if (step.type === 'quiz') {
    // Validate quiz
    return step.challenge.target && step.challenge.distractors.length > 0;
  } else if (step.type === 'mission') {
    // Validate mission
    return step.challenge.targetLocation != null;
  } else if (step.type === 'task') {
    // Validate task
    return step.challenge.target.length > 0;
  }
  // ❌ Adding new type requires modifying this function
}
```

**✅ Good (Open for Extension):**
```typescript
// Define interface
interface IChallengeValidator {
  validate(challenge: Challenge): boolean;
}

// Each type implements interface
class ClueValidator implements IChallengeValidator {
  validate(challenge: Clue): boolean {
    return challenge.title.length > 0;
  }
}

class QuizValidator implements IChallengeValidator {
  validate(challenge: Quiz): boolean {
    return challenge.target != null && challenge.distractors.length > 0;
  }
}

class MissionValidator implements IChallengeValidator {
  validate(challenge: Mission): boolean {
    return challenge.targetLocation != null;
  }
}

class TaskValidator implements IChallengeValidator {
  validate(challenge: Task): boolean {
    return challenge.target.length > 0;
  }
}

// Factory to get validator
class ChallengeValidatorFactory {
  private validators = new Map<ChallengeType, IChallengeValidator>([
    [ChallengeType.Clue, new ClueValidator()],
    [ChallengeType.Quiz, new QuizValidator()],
    [ChallengeType.Mission, new MissionValidator()],
    [ChallengeType.Task, new TaskValidator()],
  ]);

  getValidator(type: ChallengeType): IChallengeValidator {
    const validator = this.validators.get(type);
    if (!validator) throw new Error(`Unknown challenge type: ${type}`);
    return validator;
  }
}

// In service
async validateChallenge(step: Step): Promise<boolean> {
  const validator = this.validatorFactory.getValidator(step.type);
  return validator.validate(step.challenge);
}

// ✅ Adding new type: Just create new validator class, register in factory
// ✅ NO modification to validateChallenge function!
```

**This is Open/Closed:**
- **Open:** Add new challenge types by creating new validators
- **Closed:** `validateChallenge` function never changes

#### Publishing Strategy (Another Example)

**❌ Bad:**
```typescript
async publishHunt(huntId: string, version: number): Promise<void> {
  if (version === 1) {
    // Clone hunt
    // Clone steps
    // Create published record
  } else if (version === 2) {
    // Same but with new version logic
  }
  // ❌ Every version strategy requires modifying this
}
```

**✅ Good:**
```typescript
interface IPublishingStrategy {
  publish(hunt: Hunt): Promise<PublishedHunt>;
}

class SimplePublishStrategy implements IPublishingStrategy {
  async publish(hunt: Hunt): Promise<PublishedHunt> {
    // Simple copy
  }
}

class VersionedPublishStrategy implements IPublishingStrategy {
  async publish(hunt: Hunt): Promise<PublishedHunt> {
    // With versioning
  }
}

class PublishingService {
  constructor(private strategy: IPublishingStrategy) {}

  async publishHunt(hunt: Hunt): Promise<PublishedHunt> {
    return this.strategy.publish(hunt);
  }

  // ✅ Can swap strategies without changing PublishingService
  setStrategy(strategy: IPublishingStrategy) {
    this.strategy = strategy;
  }
}
```

### Your Concern: Database Switch

You might want to switch from Mongo to Postgres later.

**❌ Bad (Tightly Coupled):**
```typescript
// In service
async getHunt(id: string): Promise<Hunt> {
  const hunt = await HuntModel.findById(id); // ❌ Mongoose-specific
  return hunt.toJSON() as Hunt;
}
```

**✅ Good (Repository Pattern):**
```typescript
// Define interface (abstraction)
interface IHuntRepository {
  findById(id: string): Promise<Hunt | null>;
  create(data: HuntCreate): Promise<Hunt>;
  update(id: string, data: Partial<Hunt>): Promise<Hunt>;
  delete(id: string): Promise<void>;
}

// Mongoose implementation
class MongoHuntRepository implements IHuntRepository {
  async findById(id: string): Promise<Hunt | null> {
    const hunt = await HuntModel.findById(id);
    return hunt ? hunt.toJSON() as Hunt : null;
  }
  // ... other methods
}

// Prisma implementation (future)
class PrismaHuntRepository implements IHuntRepository {
  async findById(id: string): Promise<Hunt | null> {
    return await prisma.hunt.findUnique({ where: { id } });
  }
  // ... other methods
}

// Service depends on interface, not implementation
class HuntService {
  constructor(private huntRepo: IHuntRepository) {}

  async getHunt(id: string): Promise<Hunt> {
    const hunt = await this.huntRepo.findById(id);
    if (!hunt) throw new NotFoundError();
    return hunt;
  }
}

// ✅ Switch database by swapping repository, service code UNCHANGED
```

**This is Open/Closed:**
- **Open:** Add new database by creating new repository
- **Closed:** HuntService never changes

---

## L - Liskov Substitution Principle

**"Objects of a superclass should be replaceable with objects of a subclass without breaking the application."**

### Application: Error Handling

**Current hierarchy:**
```
AppError (base)
  ├── NotFoundError (404)
  ├── ValidationError (400)
  ├── UnauthorizedError (401)
  └── ForbiddenError (403)
```

**LSP compliance:**
```typescript
function handleError(error: AppError): Response {
  // Works for ANY AppError subclass
  return res.status(error.statusCode).json({
    error: error.message
  });
}

// ✅ Can substitute any subclass
throw new NotFoundError(); // Works
throw new ValidationError('Bad data'); // Works
throw new UnauthorizedError(); // Works
```

**All subclasses behave like AppError → LSP satisfied.**

### Anti-pattern (LSP Violation)

```typescript
class SpecialError extends AppError {
  constructor() {
    super('Special', 500);
  }

  // ❌ Adds behavior that breaks expectations
  sendEmail() {
    // Send email to admin
  }
}

// ❌ Error handler doesn't know about sendEmail
// ❌ Can't substitute freely
```

**Don't add behavior that breaks the contract.**

---

## I - Interface Segregation Principle

**"A client should not be forced to depend on methods it does not use."**

### ❌ Bad (Fat Interface)

```typescript
interface IHuntOperations {
  create(data: HuntCreate): Promise<Hunt>;
  update(id: string, data: Partial<Hunt>): Promise<Hunt>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Hunt | null>;
  findAll(): Promise<Hunt[]>;
  publish(id: string): Promise<PublishedHunt>;
  setLive(id: string): Promise<void>;
  generateQRCode(id: string): Promise<string>;
  trackAnalytics(id: string): Promise<Analytics>;
}

// ❌ Player only needs findById, but gets all methods
class PlayerService {
  constructor(private huntOps: IHuntOperations) {}
  // Only uses findById, forced to depend on everything
}
```

### ✅ Good (Segregated Interfaces)

```typescript
interface IHuntReader {
  findById(id: string): Promise<Hunt | null>;
  findAll(): Promise<Hunt[]>;
}

interface IHuntWriter {
  create(data: HuntCreate): Promise<Hunt>;
  update(id: string, data: Partial<Hunt>): Promise<Hunt>;
  delete(id: string): Promise<void>;
}

interface IHuntPublisher {
  publish(id: string): Promise<PublishedHunt>;
  setLive(id: string): Promise<void>;
}

// ✅ Each service depends only on what it needs
class PlayerService {
  constructor(private huntReader: IHuntReader) {}
  // Only depends on reading
}

class EditorService {
  constructor(
    private huntReader: IHuntReader,
    private huntWriter: IHuntWriter
  ) {}
  // Depends on reading and writing
}

class PublishingService {
  constructor(
    private huntReader: IHuntReader,
    private huntPublisher: IHuntPublisher
  ) {}
  // Depends on reading and publishing
}
```

**Smaller, focused interfaces.**

---

## D - Dependency Inversion Principle

**"Depend on abstractions, not concretions."**

**YOU'RE ALREADY DOING THIS with InversifyJS!**

### ✅ Good (Current Architecture)

**Defining abstraction:**
```typescript
export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getHuntById(id: string): Promise<Hunt>;
}
```

**Implementation:**
```typescript
@injectable()
export class HuntService implements IHuntService {
  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    // Implementation
  }
}
```

**Controller depends on interface:**
```typescript
@injectable()
export class HuntController {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}
  //                                                           ^^^^^^^^^^^^
  //                                                           Abstraction, not concrete class
}
```

**Container wires it up:**
```typescript
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
```

**Why this is powerful:**
```typescript
// Can swap implementations
container.bind<IHuntService>(TYPES.HuntService).to(MockHuntService); // Testing
container.bind<IHuntService>(TYPES.HuntService).to(CachedHuntService); // Production
container.bind<IHuntService>(TYPES.HuntService).to(HuntService); // Default

// Controller code NEVER changes
```

**This is Dependency Inversion:**
- High-level (Controller) doesn't depend on low-level (Service implementation)
- Both depend on abstraction (IHuntService interface)

---

## SOLID in Action: Adding a New Feature

**Scenario:** Add a new challenge type "Puzzle"

### Without SOLID

```typescript
// Modify HuntService
if (type === 'puzzle') { /* new code */ }

// Modify validation
if (type === 'puzzle') { /* new code */ }

// Modify serialization
if (type === 'puzzle') { /* new code */ }

// ❌ Modified 10+ files
```

### With SOLID

```typescript
// 1. Create PuzzleValidator (new file)
class PuzzleValidator implements IChallengeValidator {
  validate(challenge: Puzzle): boolean {
    return challenge.pieces > 0;
  }
}

// 2. Register in factory (ONE line change)
validators.set(ChallengeType.Puzzle, new PuzzleValidator());

// 3. Add to OpenAPI schema (data definition)
// 4. Regenerate types

// ✅ No modification to existing service logic
// ✅ Open for extension, closed for modification
```

---

## SOLID Checklist for HuntHub

### Already Following

- ✅ **SRP:** Layered architecture (Controller/Service/Model)
- ✅ **DIP:** Dependency injection with interfaces
- ✅ **LSP:** Error hierarchy is substitutable

### Should Improve

- ⚠️ **OCP:** Challenge handling (use strategy/factory pattern)
- ⚠️ **ISP:** Consider splitting service interfaces as they grow

### Future Enhancements

- [ ] Repository pattern (for potential DB switch)
- [ ] Strategy pattern (for publishing, validation)
- [ ] Factory pattern (for challenge types)

---

## Practical Application to Your Template Goal

**Why SOLID helps your template:**

1. **New projects start clean** - Interfaces defined first
2. **Easy to swap implementations** - Just change DI bindings
3. **Add features without fear** - Won't break existing code
4. **Testable by default** - Mock interfaces easily

**Template will include:**
- Interface definitions
- DI container setup
- Example implementations
- Clear extension points

---

## Action Items

- [ ] Refactor challenge validation to use strategy pattern
- [ ] Consider repository pattern for data layer
- [ ] Document extension points in patterns.md
- [ ] Add SOLID examples to template
- [ ] Review services for interface segregation opportunities

---

**SOLID isn't bureaucracy - it enables the "extend without modify" architecture you want.**

**You're already 80% there with InversifyJS and layered architecture. Let's complete it.**
