# Services Layer

**Purpose:** External system integrations and infrastructure services.

**Characteristics:**
- External API integrations
- No business logic
- Reusable across modules and features
- Technical, not domain-specific

**Examples:**
- `ai.service.ts` - OpenAI integration for validations
- `storage.service.ts` - S3/Firebase Storage for file uploads
- `email.service.ts` - SendGrid/SES for email notifications
- `payment.service.ts` - Stripe integration for payments

**Dependencies:**
- Should NOT depend on modules or features
- Can use config and shared utilities
- Pure infrastructure layer

**Rules:**
- Services are infrastructure adapters
- Services can be swapped/mocked easily
- Services should have clear interfaces (@injectable)
- Register in DI container (config/inversify.ts)
