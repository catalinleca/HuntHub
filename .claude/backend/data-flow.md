# Backend Data Flow & Mapper Pattern

**Last updated:** 2025-10-28

**Purpose:** Production-grade data transformation patterns with defense in depth

---

## 🎯 Core Principles

### Three-Layer Validation
1. **API Layer** - Zod validation (don't trust client)
2. **DB Layer** - Mongoose constraints (don't trust code)
3. **Output Layer** - Type guards (don't trust database)

### Explicit Transformation
- ❌ No spreading: `{ ...hunt, creatorId }`
- ✅ Explicit mapping via Mapper class
- ✅ Clear transformation boundaries (API ↔ DB)

### Type Safety
- Runtime validation with type guards
- Catch corrupt data before it reaches API response
- TypeScript knows types after validation

---

## 📊 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA IN (WRITE)                        │
└─────────────────────────────────────────────────────────────┘

Client POST /api/hunts { name, description, startLocation }
   ↓
[1] API Layer - Zod Middleware ✅
   validateRequest(createHuntSchema)
   • name: min(1), max(100)
   • description: max(500)
   • startLocation: { lat, lng, radius }
   ↓ PASS → req.body is HuntCreate
   ↓ FAIL → 400 ValidationError
   ↓
[2] Controller Layer ✅
   huntController.createHunt(req, res)
   • Extracts: req.body, req.user.id
   • Calls service
   ↓
[3] Service Layer ✅
   huntService.createHunt(hunt, creatorId)
   • Calls: HuntMapper.toDocument(hunt, creatorId)
   • Explicit transformation: API types → DB types
   ↓
[4] Mapper - toDocument() ✅
   • Converts: string creatorId → ObjectId
   • Explicit field mapping (no spread)
   • Returns: Partial<IHunt>
   ↓
[5] DB Layer - Mongoose Schema ✅
   HuntModel.create(docData)
   • Validates: minLength, maxLength, enum
   • Sets defaults: status='draft', currentVersion=1
   • Catches bad data from scripts/migrations
   ↓ MongoDB Write
   ↓
[6] Mapper - fromDocument() ✅
   • Validates: enums with type guard
   • Converts: ObjectId → string, Date → ISO string
   • Returns: Hunt (API type)
   ↓
[7] Controller Returns ✅
   res.status(201).json(hunt)

┌─────────────────────────────────────────────────────────────┐
│                      DATA OUT (READ)                        │
└─────────────────────────────────────────────────────────────┘

Client GET /api/hunts/:id
   ↓
[1] Controller Layer ✅
   huntController.getHuntById(req, res)
   ↓
[2] Service Layer ✅
   huntService.getHuntById(id)
   • Queries: HuntModel.findById(id)
   ↓
[3] Database → Mongoose Document
   HydratedDocument<IHunt>
   • _id: ObjectId
   • creatorId: ObjectId
   • status: string (should be enum)
   ↓
[4] Mapper - fromDocument() with Type Guard ✅
   • Validates: status enum at runtime
   • Throws if corrupt data
   • Converts: ObjectId → string
   • Returns: Hunt (API type)
   ↓
[5] Controller Returns ✅
   res.status(200).json(hunt)
   • Type: Hunt (from @hunthub/shared)
```

---

## 🔄 Mapper Pattern

### File Structure

```typescript
// apps/backend/api/src/shared/mappers/hunt.mapper.ts
import { HydratedDocument, Types } from 'mongoose';
import { Hunt, HuntCreate, HuntStatus } from '@hunthub/shared';
import { IHunt } from '@/database/types/Hunt';

export class HuntMapper {
  // Type guard (private)
  // toDocument (API → DB)
  // fromDocument (DB → API)
  // fromDocuments (array)
}
```

---

### 1. Type Guard Pattern

**Purpose:** Runtime validation of enums to catch corrupt database data

```typescript
/**
 * Type guard: Validates HuntStatus enum at runtime
 * Catches corrupt data before it reaches API response
 */
private static isHuntStatus(status: string): status is HuntStatus {
  return Object.values(HuntStatus).includes(status as HuntStatus);
}
```

**Why:**
- Database might have corrupt data (manual edits, migrations)
- TypeScript can't validate data from MongoDB at runtime
- Type guard narrows type so TypeScript knows it's valid

**Usage in fromDocument:**
```typescript
if (!this.isHuntStatus(doc.status)) {
  throw new Error(
    `Data integrity error: Invalid hunt status "${doc.status}" in hunt ${doc._id}. ` +
    `Expected one of: ${Object.values(HuntStatus).join(', ')}`
  );
}

// After this check, TypeScript knows doc.status is HuntStatus
return { status: doc.status }; // ✅ Type-safe
```

---

### 2. toDocument (Data IN: API → DB)

**Purpose:** Transform API input to MongoDB document format

```typescript
/**
 * Converts API input (DTO) to MongoDB document format
 * @param dto - Hunt creation data from API (validated by Zod)
 * @param creatorId - User ID from auth context
 * @returns Partial document ready for Mongoose.create() or update
 */
static toDocument(dto: HuntCreate, creatorId: string): Partial<IHunt> {
  return {
    creatorId: new Types.ObjectId(creatorId),
    name: dto.name,
    description: dto.description,
    startLocation: dto.startLocation,
    // Mongoose provides defaults: status='draft', currentVersion=1, stepOrder=[]
  };
}
```

**Key Points:**
- ✅ Explicit field mapping (no spread operators)
- ✅ Type conversion: `string` → `ObjectId`
- ✅ Clear documentation of what Mongoose handles
- ✅ Used for both CREATE and UPDATE

**Why explicit mapping:**
```typescript
// ❌ BAD: Spreading can leak fields
const doc = { creatorId, ...dto };
// What if dto has { _id, status, currentVersion }?
// Those shouldn't come from client!

// ✅ GOOD: Only map expected fields
const doc = {
  creatorId: new Types.ObjectId(creatorId),
  name: dto.name,
  description: dto.description,
  startLocation: dto.startLocation,
};
// Can't accidentally include wrong fields
```

---

### 3. fromDocument (Data OUT: DB → API)

**Purpose:** Transform MongoDB document to API response with validation

```typescript
/**
 * Converts MongoDB document to API response (DTO)
 * @param doc - Mongoose hydrated document
 * @returns Clean API response object
 * @throws Error if document contains invalid enum values
 */
static fromDocument(doc: HydratedDocument<IHunt>): Hunt {
  // Runtime validation: Check enum
  if (!this.isHuntStatus(doc.status)) {
    throw new Error(
      `Data integrity error: Invalid hunt status "${doc.status}" in hunt ${doc._id}. ` +
        `Expected one of: ${Object.values(HuntStatus).join(', ')}`
    );
  }

  return {
    id: doc._id.toString(),
    creatorId: doc.creatorId.toString(),
    name: doc.name,
    description: doc.description,
    currentVersion: doc.currentVersion,
    status: doc.status, // ✅ TypeScript knows this is HuntStatus
    startLocation: doc.startLocation
      ? {
          lat: doc.startLocation.lat,
          lng: doc.startLocation.lng,
          radius: doc.startLocation.radius,
        }
      : undefined,
    createdAt: doc.createdAt?.toString(),
    updatedAt: doc.updatedAt?.toString(),
  };
}
```

**Key Points:**
- ✅ Type guard validates enums first
- ✅ Type conversion: `ObjectId` → `string`, `Date` → `string`
- ✅ Explicit field mapping
- ✅ Optional field handling (startLocation)
- ✅ Clear error messages for debugging

---

### 4. fromDocuments (Array Transformation)

**Purpose:** Transform array of documents efficiently

```typescript
/**
 * Converts array of MongoDB documents to API responses
 * @param docs - Array of Mongoose hydrated documents
 * @returns Array of clean API response objects
 */
static fromDocuments(docs: HydratedDocument<IHunt>[]): Hunt[] {
  return docs.map((doc) => this.fromDocument(doc));
}
```

**Usage:**
```typescript
// Service layer
const hunts = await HuntModel.find().exec();
return HuntMapper.fromDocuments(hunts); // ✅
```

---

## 🔒 Three-Layer Validation

### Layer 1: API Validation (Zod)

**Location:** Middleware
**Purpose:** Don't trust client input

```typescript
// apps/backend/api/src/modules/hunts/hunt.validation.ts
export const createHuntSchema = HuntCreate; // From @hunthub/shared/schemas

// apps/backend/api/src/modules/hunts/hunt.routes.ts
huntRouter.post('/',
  validateRequest(createHuntSchema), // ✅ Validates before controller
  controller.createHunt
);
```

**Validates:**
- Required fields
- String lengths (min/max)
- Format (email, URL, etc.)
- Type correctness

---

### Layer 2: Database Validation (Mongoose)

**Location:** Model schema
**Purpose:** Don't trust code (scripts, migrations, console edits)

```typescript
// apps/backend/api/src/database/models/Hunt.ts
const huntSchema = new Schema<IHunt>({
  name: {
    type: String,
    required: true,
    minLength: [1, 'Hunt name cannot be empty'],
    maxLength: [100, 'Hunt name cannot exceed 100 characters'],
    trim: true,
  },
  description: {
    type: String,
    maxLength: [500, 'Hunt description cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: Object.values(HuntStatus),
    default: HuntStatus.Draft,
  },
});
```

**Validates:**
- Same constraints as API layer
- Catches bad data from:
  - Direct MongoDB edits
  - Database migrations
  - Scripts/seed data
  - Bugs in code

---

### Layer 3: Output Validation (Type Guards)

**Location:** Mapper
**Purpose:** Don't trust database (corrupt data, manual edits)

```typescript
// Inside fromDocument()
if (!this.isHuntStatus(doc.status)) {
  throw new Error(`Data integrity error: Invalid hunt status...`);
}
```

**Validates:**
- Enum values before returning to API
- Catches:
  - Manual database edits
  - Migration errors
  - Historical data with old enum values

---

## 📝 Service Layer Usage

### CREATE

```typescript
async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
  const docData = HuntMapper.toDocument(hunt, creatorId);
  const createdHunt = await HuntModel.create(docData);
  return HuntMapper.fromDocument(createdHunt);
}
```

**Flow:**
1. `toDocument` - Transform API input to DB format
2. `create` - Save to MongoDB (runs Mongoose validation)
3. `fromDocument` - Transform DB document to API response (runs type guard)

---

### READ (Single)

```typescript
async getHuntById(id: string): Promise<Hunt> {
  const hunt = await HuntModel.findById(id).exec();
  if (!hunt) {
    throw new NotFoundError();
  }
  return HuntMapper.fromDocument(hunt);
}
```

**Flow:**
1. Query MongoDB
2. Check existence
3. `fromDocument` - Validate and transform

---

### READ (Array)

```typescript
async getUserHunts(userId: string): Promise<Hunt[]> {
  const hunts = await HuntModel.findUserHunts(userId);
  return HuntMapper.fromDocuments(hunts);
}
```

**Flow:**
1. Query MongoDB (multiple documents)
2. `fromDocuments` - Validate and transform each

---

### UPDATE (Full Update)

```typescript
async updateHunt(id: string, huntData: HuntCreate, userId: string): Promise<Hunt> {
  // Find and verify ownership
  const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).exec();
  if (!hunt) {
    throw new NotFoundError('Hunt not found or you do not have permission');
  }

  // Full update - replace all writable fields
  hunt.name = huntData.name;
  hunt.description = huntData.description;
  hunt.startLocation = huntData.startLocation;

  await hunt.save(); // Runs Mongoose validators

  return HuntMapper.fromDocument(hunt);
}
```

**Alternative using toDocument:**
```typescript
async updateHunt(id: string, huntData: HuntCreate, userId: string): Promise<Hunt> {
  const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).exec();
  if (!hunt) {
    throw new NotFoundError();
  }

  // Use mapper for consistency
  const updateData = HuntMapper.toDocument(huntData, userId);
  Object.assign(hunt, updateData);

  await hunt.save();
  return HuntMapper.fromDocument(hunt);
}
```

---

## 🎨 Template for New Models

When creating Step, Asset, Progress mappers, follow this template:

```typescript
import { HydratedDocument, Types } from 'mongoose';
import { ModelName, ModelCreate, EnumType } from '@hunthub/shared';
import { IModelName } from '@/database/types/ModelName';

export class ModelNameMapper {
  /**
   * Type guard for enum validation
   */
  private static isEnumType(value: string): value is EnumType {
    return Object.values(EnumType).includes(value as EnumType);
  }

  /**
   * API → DB transformation
   */
  static toDocument(dto: ModelCreate, additionalContext?: string): Partial<IModelName> {
    return {
      // Explicit field mapping
      // Type conversions (string → ObjectId, etc.)
    };
  }

  /**
   * DB → API transformation with validation
   */
  static fromDocument(doc: HydratedDocument<IModelName>): ModelName {
    // Type guard validation
    if (!this.isEnumType(doc.someEnum)) {
      throw new Error(`Data integrity error: Invalid enum...`);
    }

    return {
      // Explicit field mapping
      // Type conversions (ObjectId → string, Date → string)
    };
  }

  /**
   * Array transformation
   */
  static fromDocuments(docs: HydratedDocument<IModelName>[]): ModelName[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
```

---

## ✅ Checklist for New Models

When implementing a new model (Step, Asset, Progress, etc.):

**Database:**
- [ ] Add Mongoose validation constraints (minLength, maxLength, enum)
- [ ] Set sensible defaults
- [ ] Add indexes for frequently queried fields

**Mapper:**
- [ ] Create type guards for all enum fields
- [ ] Implement `toDocument()` with explicit field mapping
- [ ] Implement `fromDocument()` with type guard validation
- [ ] Implement `fromDocuments()` for arrays
- [ ] Add JSDoc comments explaining purpose

**Service:**
- [ ] CREATE: Use `toDocument()` for input transformation
- [ ] READ: Use `fromDocument()` or `fromDocuments()` for output
- [ ] UPDATE: Use `toDocument()` or manual field assignment + `save()`
- [ ] DELETE: No mapper needed (no data transformation)

**Validation:**
- [ ] Zod schema in validation file (import from @hunthub/shared)
- [ ] Mongoose constraints in model
- [ ] Type guards in mapper

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Direct Spreading
```typescript
// BAD: Can leak unwanted fields
const doc = { creatorId, ...hunt };
await HuntModel.create(doc);
```

### ❌ Skipping Type Guards
```typescript
// BAD: No runtime validation
static fromDocument(doc: HydratedDocument<IHunt>): Hunt {
  return {
    status: doc.status, // What if status is corrupt?
  };
}
```

### ❌ Using toJSON() Instead of Mapper
```typescript
// BAD: No transformation control, no validation
return hunt.toJSON() as Hunt;

// GOOD: Explicit transformation with validation
return HuntMapper.fromDocument(hunt);
```

### ❌ Mixing DB and API Types
```typescript
// BAD: Returning DB type from service
async getHunt(): Promise<IHunt> { // ❌ DB type
  return await HuntModel.findById(id);
}

// GOOD: Always return API type
async getHunt(): Promise<Hunt> { // ✅ API type
  const doc = await HuntModel.findById(id);
  return HuntMapper.fromDocument(doc);
}
```

---

## 🎯 Why This Pattern?

### Defense in Depth
- Multiple validation layers catch different types of errors
- API → Malicious/buggy clients
- DB → Scripts, migrations, manual edits
- Output → Corrupt data, historical issues

### Type Safety
- TypeScript checks at compile time
- Type guards check at runtime
- Explicit transformations prevent leaks

### Maintainability
- Clear boundaries between API and DB types
- Easy to understand data flow
- Self-documenting with JSDoc
- Easy to extend (add fields in one place)

### Debugging
- Clear error messages with context
- Know exactly where data was validated
- Easy to trace data transformations

---

## 📚 Related Files

**Patterns:**
- `.claude/backend/patterns.md` - General code patterns
- `.claude/backend/architecture.md` - System architecture
- `.claude/backend/current-state.md` - Implementation status

**Implementation:**
- `apps/backend/api/src/shared/mappers/` - All mappers
- `apps/backend/api/src/database/models/` - Mongoose models
- `apps/backend/api/src/modules/*/validation.ts` - Zod schemas

---

**Last updated:** 2025-10-28
**Next review:** When implementing Step mapper (use as template)