# Mapper Audit & Integration Analysis

**Date:** 2025-10-28
**Status:** Inconsistencies found - Action required

---

## 📊 Current State

### Mapper Status Matrix

| Mapper | Returns | Source | Integrated | Status |
|--------|---------|--------|------------|--------|
| **HuntMapper** | `Hunt` | `@hunthub/shared` ✅ | ✅ HuntService | ✅ CORRECT |
| **UserMapper** | `User` | `@hunthub/shared` ✅ | ✅ UserService | ✅ CORRECT |
| **StepMapper** | `StepDTO` | Custom ❌ | ❌ Not used | ❌ WRONG (Step exists in shared!) |
| **AssetMapper** | `AssetDTO` | Custom ❌ | ❌ Not used | ⚠️ Missing from OpenAPI |
| **ProgressMapper** | `ProgressDTO` | Custom ❌ | ❌ Not used | ⚠️ Missing from OpenAPI |
| **PublishedHuntMapper** | `PublishedHuntDTO` | Custom ❌ | ❌ Not used | ⚠️ Missing from OpenAPI |
| **LiveHuntMapper** | `LiveHuntDTO` | Custom ❌ | ❌ Not used | ⚠️ Missing from OpenAPI |

---

## 🔍 Detailed Analysis

### ✅ CORRECT: Hunt & User Mappers

These follow the correct pattern:

```typescript
// hunt.mapper.ts
import { Hunt } from '@hunthub/shared';  // ✅ Import from shared
import { IHunt } from '@/database/types/Hunt';

export class HuntMapper {
  static toDTO(doc: HydratedDocument<IHunt>): Hunt {  // ✅ Return shared type
    return {
      id: doc._id.toString(),
      creatorId: doc.creatorId.toString(),
      // ... explicit mapping
    };
  }
}
```

**Why this is correct:**
- ✅ Uses shared `Hunt` type from OpenAPI
- ✅ Single source of truth
- ✅ Frontend and backend use same type
- ✅ Type-safe across the stack

**Service integration:**
```typescript
// hunt.service.ts
import { Hunt, HuntCreate } from '@hunthub/shared';  // ✅ Shared types
import { HuntMapper } from '@/shared/mappers';

async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
  const createdHunt = await HuntModel.create({ creatorId, ...hunt });
  return HuntMapper.toDTO(createdHunt);  // ✅ Mapper used
}
```

---

### ❌ WRONG: Step Mapper

**Problem:** Uses custom `StepDTO` when `Step` already exists in `@hunthub/shared`

```typescript
// step.mapper.ts (CURRENT - WRONG)
export interface StepDTO {  // ❌ Custom DTO
  id: string;
  huntId: string;
  type: string;  // ❌ Generic string (should be ChallengeType enum)
  challenge: unknown;  // ❌ Generic unknown (should be Challenge type)
  // ...
}

export class StepMapper {
  static toDTO(doc: HydratedDocument<IStep>): StepDTO {  // ❌ Returns custom DTO
```

**Available in shared types:**
```typescript
// @hunthub/shared (FROM OPENAPI)
export interface Step {
  id: string;
  huntId?: string;
  type?: ChallengeType;  // ✅ Proper enum
  challenge: Challenge;  // ✅ Proper type
  requiredLocation?: Location;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

**FIX:** Update StepMapper to use shared type:

```typescript
// step.mapper.ts (CORRECT)
import { Step } from '@hunthub/shared';  // ✅ Import from shared
import { IStep } from '@/database/types/Step';

export class StepMapper {
  static toDTO(doc: HydratedDocument<IStep>): Step {  // ✅ Return shared type
    return {
      id: doc._id.toString(),
      huntId: doc.huntId.toString(),
      type: doc.type,  // ✅ Properly typed as ChallengeType
      challenge: doc.challenge,  // ✅ Properly typed as Challenge
      hint: doc.hint,
      requiredLocation: doc.requiredLocation ? {
        lat: doc.requiredLocation.lat,
        lng: doc.requiredLocation.lng,
        radius: doc.requiredLocation.radius,
      } : undefined,
      timeLimit: doc.timeLimit,
      maxAttempts: doc.maxAttempts,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOs(docs: HydratedDocument<IStep>[]): Step[] {  // ✅ Return Step[]
    return docs.map((doc) => this.toDTO(doc));
  }
}

// ✅ Remove custom StepDTO interface entirely
```

---

### ⚠️ MISSING FROM OPENAPI: Asset, Progress, PublishedHunt, LiveHunt

These mappers define custom DTOs because the types don't exist in OpenAPI yet.

**Problem:** These ARE API responses but not documented in OpenAPI schema.

**Impact:**
- ❌ No type sharing with frontend
- ❌ No API documentation
- ❌ Inconsistent pattern (some use shared, some use custom)
- ❌ Will cause issues when implementing features

**Example: Asset**

Currently has custom DTO:
```typescript
// asset.mapper.ts (CURRENT)
export interface AssetDTO {  // ❌ Custom DTO
  id: string;
  ownerId: string;
  url: string;
  mimeType: string;
  size: number;
  // ...
}
```

But Asset WILL be returned by API endpoints:
```typescript
GET /api/assets/:id        → Asset
POST /api/assets           → Asset
GET /api/hunts/:id/assets  → Asset[]
```

**These types SHOULD be in OpenAPI for:**
1. ✅ Frontend can import same types
2. ✅ API documentation is complete
3. ✅ Consistent with Hunt/User/Step pattern
4. ✅ Type safety across stack

---

## 🎯 Action Plan

### Phase 1: Fix Step Mapper (Immediate)

**What:** Update StepMapper to use shared `Step` type instead of custom `StepDTO`

**Files to change:**
1. `src/shared/mappers/step.mapper.ts`
   - Remove `StepDTO` interface
   - Import `Step` from `@hunthub/shared`
   - Change return type to `Step`

**Impact:** None (StepMapper not yet used in any service)

**Estimated time:** 5 minutes

---

### Phase 2: Add Missing Schemas to OpenAPI (Before implementing features)

**What:** Add Asset, Progress, PublishedHunt, LiveHunt to OpenAPI schema

**Files to change:**
1. `packages/shared/openapi/hunthub_models.yaml`
   - Add Asset schema
   - Add Progress schema
   - Add PublishedHunt schema
   - Add LiveHunt schema

2. Regenerate types:
   ```bash
   npm run generate --workspace=@hunthub/shared
   ```

3. Update mappers to use shared types:
   - `asset.mapper.ts` → import `Asset` from `@hunthub/shared`
   - `progress.mapper.ts` → import `Progress` from `@hunthub/shared`
   - `publishedHunt.mapper.ts` → import `PublishedHunt` from `@hunthub/shared`
   - `liveHunt.mapper.ts` → import `LiveHunt` from `@hunthub/shared`

**Timeline:** Before implementing each feature (Asset Management, Player API, Publishing)

**Benefits:**
- ✅ Consistent pattern across all mappers
- ✅ Type safety for future features
- ✅ API documentation complete
- ✅ Frontend can import same types

---

## 📋 OpenAPI Schemas Needed

### Asset Schema

```yaml
Asset:
  type: object
  properties:
    id:
      type: string
    ownerId:
      type: string
      description: User who uploaded this asset
    url:
      type: string
      description: Public URL or signed URL for accessing the asset
    mimeType:
      type: string
      description: MIME type (image/jpeg, video/mp4, etc.)
    size:
      type: number
      description: File size in bytes
    originalName:
      type: string
    storageLocation:
      type: object
      properties:
        bucket:
          type: string
        path:
          type: string
    usage:
      type: array
      items:
        type: object
        properties:
          model:
            type: string
          field:
            type: string
          documentId:
            type: string
      description: Track where this asset is used
    createdAt:
      type: string
      format: date-time
    updatedAt:
      type: string
      format: date-time
  required:
    - id
    - ownerId
    - url
    - mimeType
    - size
```

### Progress Schema

```yaml
Progress:
  type: object
  properties:
    id:
      type: string
    userId:
      type: string
      description: Optional for anonymous players
    sessionId:
      type: string
      description: UUID for localStorage-based sessions
    isAnonymous:
      type: boolean
    huntId:
      type: string
    version:
      type: number
      description: Which published version they're playing
    status:
      type: string
      enum: [in_progress, completed, abandoned]
    startedAt:
      type: string
      format: date-time
    completedAt:
      type: string
      format: date-time
    duration:
      type: number
      description: Total time in seconds
    currentStepId:
      type: string
    steps:
      type: array
      items:
        type: object
        properties:
          stepId:
            type: string
          attempts:
            type: number
          completed:
            type: boolean
          responses:
            type: array
            items:
              type: object
              properties:
                timestamp:
                  type: string
                  format: date-time
                content:
                  description: Flexible - user's answer/upload/coordinates
                isCorrect:
                  type: boolean
                score:
                  type: number
                feedback:
                  type: string
                metadata:
                  type: object
                  additionalProperties: true
          startedAt:
            type: string
            format: date-time
          completedAt:
            type: string
            format: date-time
          duration:
            type: number
    playerName:
      type: string
    rating:
      type: number
      minimum: 0
      maximum: 5
    createdAt:
      type: string
      format: date-time
    updatedAt:
      type: string
      format: date-time
  required:
    - id
    - sessionId
    - isAnonymous
    - huntId
    - version
    - status
    - startedAt
    - currentStepId
    - playerName
```

### PublishedHunt Schema

```yaml
PublishedHunt:
  type: object
  properties:
    id:
      type: string
    huntId:
      type: string
      description: Original draft hunt ID
    versionId:
      type: string
      description: Published hunt clone ID
    versionName:
      type: string
      description: User-provided version name
    version:
      type: number
      description: Auto-incrementing version number
    publishedAt:
      type: string
      format: date-time
    publishedBy:
      type: string
      description: User ID who published
  required:
    - id
    - huntId
    - versionId
    - version
    - publishedAt
    - publishedBy
```

### LiveHunt Schema

```yaml
LiveHunt:
  type: object
  properties:
    id:
      type: string
    huntId:
      type: string
      description: Original draft hunt ID
    versionId:
      type: string
      description: Which published version is live
    setLiveAt:
      type: string
      format: date-time
    setLiveBy:
      type: string
      description: User ID who set it live
  required:
    - id
    - huntId
    - versionId
    - setLiveAt
```

---

## 🔧 Implementation Checklist

### Immediate (NOW)

- [ ] Fix StepMapper to use shared `Step` type
- [ ] Remove custom `StepDTO` interface
- [ ] Test that types still work correctly

### Before Asset Management Feature (Week 3)

- [ ] Add `Asset` schema to OpenAPI
- [ ] Regenerate shared types
- [ ] Update AssetMapper to use shared `Asset` type
- [ ] Remove custom `AssetDTO` interface

### Before Player API Feature (Week 5-6)

- [ ] Add `Progress` schema to OpenAPI
- [ ] Regenerate shared types
- [ ] Update ProgressMapper to use shared `Progress` type
- [ ] Remove custom `ProgressDTO` interface

### Before Publishing Feature (Week 4-5)

- [ ] Add `PublishedHunt` schema to OpenAPI
- [ ] Add `LiveHunt` schema to OpenAPI
- [ ] Regenerate shared types
- [ ] Update PublishedHuntMapper to use shared `PublishedHunt` type
- [ ] Update LiveHuntMapper to use shared `LiveHunt` type
- [ ] Remove custom DTOs

---

## 📝 Pattern to Follow

**For ALL mappers:**

```typescript
// 1. Import shared type from @hunthub/shared
import { EntityName } from '@hunthub/shared';
import { IEntityName } from '@/database/types/EntityName';

// 2. NO custom DTO interface

// 3. Return shared type
export class EntityNameMapper {
  static toDTO(doc: HydratedDocument<IEntityName>): EntityName {
    return {
      id: doc._id.toString(),
      // ... explicit property-by-property mapping
      // Convert ObjectId → string
      // Transform as needed
    };
  }

  static toDTOs(docs: HydratedDocument<IEntityName>[]): EntityName[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
```

**This ensures:**
- ✅ Single source of truth (OpenAPI)
- ✅ Type safety across FE/BE
- ✅ API documentation complete
- ✅ Consistent pattern everywhere
- ✅ No type drift

---

## ✅ Success Criteria

**When all mappers follow the pattern:**

1. ✅ All mappers import types from `@hunthub/shared`
2. ✅ No custom DTO interfaces in mapper files
3. ✅ All API response types documented in OpenAPI
4. ✅ Frontend can import same types as backend
5. ✅ `npm run generate` updates all types consistently
6. ✅ TypeScript catches any mismatches

---

**End of Mapper Audit**
