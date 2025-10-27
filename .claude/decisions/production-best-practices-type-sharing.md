# Production Best Practices: Type Sharing Between Frontend & Backend

**Research findings on how real companies handle this problem.**

## TL;DR - Industry Standards

**For coupled FE/BE (like HuntHub):**
- ✅ **Monorepo with shared package** is the standard
- ✅ OpenAPI/Zod schemas as single source of truth
- ✅ Both sides import from shared package

**For decoupled services (microservices):**
- API Gateway + Service Registry
- Contract testing
- Published npm packages or Schema Registry

**Copying YAML between repos:** ❌ Not best practice, leads to drift

---

## What Production Teams Actually Do

### Approach 1: Monorepo (Most Common for FE/BE)

**Used by:** Companies with tightly coupled frontend and backend

**Structure:**
```
monorepo/
├── packages/
│   ├── shared/      ← Types, validation, contracts
│   ├── backend/
│   └── frontend/
```

**Tools:**
- **Nx**, **Turborepo**, **Lerna** - Monorepo management
- **tRPC** - Automatic type sync (requires monorepo)
- **ts-rest** - OpenAPI + type safety in monorepo
- **Zod** - Shared runtime validation

**Why this is standard:**
- ✅ Single source of truth
- ✅ Atomic changes (update contract + both sides in one PR)
- ✅ No version sync issues
- ✅ TypeScript compiler enforces consistency
- ✅ Automatic type inference

**Example from research:**
> "Using a monorepo allows us to see and manage all our code in one spot, making it easier to communicate between projects and keep everything up to date."

**Real-world quote:**
> "Without shared schemas and automatically inferred types, you would have to keep copies of both the schema and interface in backend and frontend, resulting in four different schemas defining the same thing."

---

### Approach 2: Separate Repos with Published Packages

**Used by:** Larger companies, decoupled services, multiple teams

**Structure:**
```
backend-repo/
├── src/
└── types/ (published as @company/api-types)

frontend-repo/
├── package.json (depends on @company/api-types)
└── src/
```

**How it works:**
1. Backend defines OpenAPI schema
2. Generate TypeScript types
3. Publish types as npm package (`@hunthub/api-types`)
4. Frontend installs package
5. Both sides use same types

**Pros:**
- ✅ Truly decoupled repos
- ✅ Versioned contracts (semver)
- ✅ Can work on FE/BE independently

**Cons:**
- ❌ Publishing overhead
- ❌ Version management complexity
- ❌ Delay between backend change and frontend update
- ❌ Need CI/CD to publish packages

**When to use:**
- Multiple teams
- Backend used by multiple frontends
- Truly independent deployment cycles

---

### Approach 3: Microservices at Scale (Netflix, Uber, Airbnb)

**Used by:** Massive scale, hundreds of services

**Structure:**
- **API Gateway** - Central entry point
- **Service Registry** (Eureka, Consul) - Service discovery
- **Schema Registry** - Central schema storage
- **Contract Testing** - Verify compatibility

**Type Sharing:**
- Services define their own schemas
- Schema registry stores all contracts
- Consumer services fetch schemas
- Contract tests prevent breaking changes

**Tools:**
- **Kafka Schema Registry** (Confluent)
- **Protobuf** (Google)
- **gRPC** - Type-safe RPC
- **GraphQL Federation** - Type stitching

**Why this is different:**
- Not FE/BE sharing
- Service-to-service contracts
- Polyglot (different languages)
- Distributed systems

**Quote from research:**
> "Uber has grown to around 2,200 critical microservices... domains represent a collection of one or more microservices tied to a logical grouping of functionality."

**NOT relevant for HuntHub** - this is enterprise scale with hundreds of engineers.

---

## Modern Patterns (2024)

### Pattern A: tRPC (Very Popular)

**What:** End-to-end typesafe APIs without code generation

**How it works:**
```typescript
// Backend defines procedures
const appRouter = router({
  getHunt: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.hunt.findById(input.id);
    })
});

// Frontend gets automatic types
const hunt = await trpc.getHunt.query({ id: '123' });
// hunt is typed automatically!
```

**Requirements:**
- ✅ **Requires monorepo** or published package
- ✅ TypeScript everywhere
- ✅ No REST needed (uses tRPC protocol)

**Pros:**
- Perfect type safety
- No code generation
- Automatic inference

**Cons:**
- Locked into tRPC
- Not REST (can't use with non-TS clients)
- Requires monorepo

---

### Pattern B: OpenAPI + Codegen (Standard)

**What:** Generate types from OpenAPI schema

**How it works:**
```
openapi.yaml
    ↓
swagger-typescript-api / openapi-typescript
    ↓
types.ts (generated)
    ↓
Import in both FE and BE
```

**This is what YOU'RE doing** ✅

**Pros:**
- Language agnostic (OpenAPI is standard)
- Works with any REST client
- Docs generation (Swagger UI)
- Industry standard

**Cons:**
- Code generation step
- Need to regenerate on changes

**Best practice:** Generate once in shared package, both sides import.

---

### Pattern C: Zod Shared Schemas (Modern)

**What:** Runtime validation + TypeScript types from same schema

**How it works:**
```typescript
// Shared package
export const huntSchema = z.object({
  id: z.string(),
  name: z.string().min(3)
});

export type Hunt = z.infer<typeof huntSchema>;

// Backend
const hunt = huntSchema.parse(req.body); // Validates + types

// Frontend
const { register } = useForm({
  resolver: zodResolver(huntSchema) // Same validation!
});
```

**This is YOUR plan** ✅

**Pros:**
- Single source of truth
- Runtime validation
- Type inference
- DRY (don't repeat yourself)

**Cons:**
- Requires JavaScript/TypeScript everywhere

**Best practice:** OpenAPI → TypeScript → Zod (what you're doing!)

---

## The Answer to Your Question

### "What's the production standard approach?"

**For tightly coupled FE/BE (like yours):**

**Standard approach = Monorepo with shared package**

**Evidence:**
- StackOverflow discussions consistently recommend this
- Modern tools (tRPC, ts-rest) require/encourage this
- Avoids "four copies of the same schema" anti-pattern
- TypeScript ecosystem expects this

**Your concern: "I hope I won't bottleneck with this"**

**You won't bottleneck because:**
1. ✅ Standard pattern for FE/BE projects
2. ✅ Thousands of companies do this
3. ✅ Tooling is mature (npm workspaces, Turborepo, Nx)
4. ✅ Scales to large projects

**Bottleneck would be:**
- ❌ Copying YAML manually (you drift)
- ❌ Manually duplicating types (four sources of truth)
- ❌ Not using monorepo when FE/BE are coupled

---

### "Copying YAML doesn't seem like best practice"

**You're 100% correct.**

**Copying is an anti-pattern:**
- ❌ Manual sync (human error)
- ❌ Can drift
- ❌ Four places to update (BE schema, BE types, FE schema, FE types)

**Research quote:**
> "Without shared schemas, you would have to keep copies of both the schema and interface in backend and frontend, resulting in four different schemas defining the same thing."

**Industry says: Don't copy. Share.**

---

### "Maintenance of having a shared types, I'm not so sure"

**Maintenance is EASIER with shared package, not harder.**

**Without shared package:**
```
1. Update OpenAPI in backend
2. Regenerate backend types
3. Copy OpenAPI to frontend (MANUAL)
4. Regenerate frontend types
5. Hope you didn't forget anything
```

**With shared package:**
```
1. Update OpenAPI in shared/
2. Run npm run generate (generates types + zod)
3. Both FE and BE automatically get new types
4. TypeScript compiler catches any incompatibilities
```

**Evidence from research:**
> "This setup makes it simple to automate with watchers that detect API changes, automatically regenerate the OpenAPI spec and client, and minimize the need for manual intervention."

**Maintenance is LESS work, not more.**

---

## What About Decoupled Services Later?

**Your concern:** "Be open for swapping later if deciding to"

**You can migrate from monorepo to separate repos:**

### Migration Path: Monorepo → Separate Repos

**Option 1: Publish as npm package**
```bash
# In shared package
npm publish @hunthub/types

# Frontend installs
npm install @hunthub/types

# Backend installs (or keeps in monorepo)
npm install @hunthub/types
```

**Option 2: Generation approach**
```bash
# Backend has OpenAPI
# Script generates types, publishes to registry or S3
# Frontend fetches generated types

npm run generate:types
npm run publish:types  # To registry
```

**Option 3: Git submodule**
```bash
# Frontend repo includes backend types as submodule
git submodule add backend-repo types/
```

**All three are possible migrations from monorepo.**

**Going monorepo → separate is easier than separate → monorepo.**

---

## Real-World Examples

### Example 1: Airbnb (Microservices)
- Hundreds of services
- Schema registry for contracts
- Contract testing

**Not your scale, not relevant.**

### Example 2: Mid-size SaaS (Your scale)
- Monorepo with FE/BE/Mobile
- Shared package for types
- OpenAPI + Zod
- Nx for tooling

**This is YOUR approach.** ✅

### Example 3: Agency with multiple clients
- Separate repos per client
- Published npm packages for shared code
- More overhead, necessary for isolation

**Not your use case.**

---

## Recommendations by Project Size

### Small Project (Solo dev, MVP)
**Monorepo with shared package** ✅
- Simplest for solo dev
- No publishing overhead
- Fast iteration

### Medium Project (Small team, 1-2 products)
**Monorepo with shared package** ✅
- Team can work in one repo
- Atomic changes
- Good tooling (Nx, Turborepo)

### Large Project (Multiple teams, multiple products)
**Separate repos with published packages**
- Teams work independently
- Versioned contracts
- More process needed

### Enterprise (Hundreds of services)
**Schema registry + contract testing**
- Polyglot
- Service mesh
- Not your concern

**Your project = Small to Medium = Monorepo is correct choice.**

---

## Common Misconceptions

### Misconception 1: "Monorepo = all code in one massive repo"
**Reality:** Organized workspaces, can still deploy independently

### Misconception 2: "Shared package creates tight coupling"
**Reality:** Sharing contracts is GOOD coupling. Implementation is still decoupled.

### Misconception 3: "Monorepo doesn't scale"
**Reality:** Google, Meta, Microsoft use monorepos with millions of lines of code

### Misconception 4: "Copying YAML is simpler"
**Reality:** Simpler at first, maintenance nightmare later

---

## Decision Framework

**Choose Monorepo if:**
- ✅ FE and BE are developed together
- ✅ Same team works on both
- ✅ Want type safety across stack
- ✅ Deploy together or in sync

**Choose Separate Repos if:**
- ✅ Different teams own FE and BE
- ✅ Backend serves multiple clients
- ✅ Very different deployment cycles
- ✅ Need strict versioning

**For HuntHub:**
- Same developer (you)
- Tightly coupled FE/BE
- Deploy together
- Want fast iteration

**Verdict: Monorepo is the right choice.** ✅

---

## Your Specific Concern Addressed

**You said:** "I hope I won't bottleneck with this"

**Analysis:**

**Potential bottlenecks with monorepo:**
- ❌ Build times (not a concern for small project)
- ❌ Git clone size (not a concern early on)
- ❌ Deployment coupling (you want this anyway)

**Bottlenecks you AVOID with monorepo:**
- ✅ No manual sync
- ✅ No version drift
- ✅ No "which version of types do I use?"
- ✅ No copying files

**Research says:**
> "Using monorepo allows us to manage all our code in one spot... easier to communicate between projects and keep everything up to date."

**You won't bottleneck. You'll have LESS friction.**

---

## Final Recommendation

**For HuntHub:**

**1. Use monorepo with shared package** ✅
- This IS the production standard for your use case
- Matches industry best practices
- Avoids maintenance nightmares

**2. Structure:**
```
packages/
├── shared/     # OpenAPI → TS → Zod
├── backend/    # Imports @hunthub/shared
├── frontend/   # Imports @hunthub/shared
```

**3. Migration path exists:**
- Can publish shared as npm package later
- Can split repos if needed
- Monorepo → separate is easier than reverse

**4. You're following modern standards:**
- OpenAPI as source of truth ✅
- Generated TypeScript types ✅
- Shared Zod schemas ✅
- Monorepo for coupled apps ✅

**This is what production teams do in 2024.** You're on the right track.

---

## Learning Takeaway

**What you learned:**
1. Monorepo is standard for coupled FE/BE (not overkill)
2. Copying schemas is an anti-pattern (leads to drift)
3. Shared package REDUCES maintenance (not increases)
4. tRPC/ts-rest/Zod are modern approaches (all use shared types)
5. Migration path exists if you need to decouple later

**For your template:**
- Document this pattern
- Show it's production-grade
- Demonstrate best practices
- Makes your portfolio stronger

**You can confidently use monorepo knowing it's the industry standard approach.**
