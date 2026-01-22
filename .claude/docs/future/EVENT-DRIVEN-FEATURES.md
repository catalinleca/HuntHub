# Event-Driven Architecture - Future Features

**Last updated:** 2025-11-08

---

## Overview

This document identifies HuntHub features that could benefit from event-driven architecture. Current MVP uses synchronous request/response patterns, which is appropriate. Event-driven should be considered for **V1.1+** when async operations, notifications, and analytics become priorities.

**Key Principle:** Start simple, add complexity only when needed.

---

## Implementation Phases

### Phase 1: MVP (Current)
**Pattern:** Synchronous request/response
**Status:** ✅ Perfect for current needs
**Keep:** All CRUD operations, hunt publishing, release, sharing

### Phase 2: V1.1 (Node EventEmitter)
**Pattern:** In-process event bus
**When:** Adding notifications, basic analytics
**Complexity:** Low
**Infrastructure:** None (built into Node.js)

### Phase 3: V1.2+ (Message Queue)
**Pattern:** BullMQ + Redis
**When:** Background jobs, retries, job persistence needed
**Complexity:** Medium
**Infrastructure:** Redis server

### Phase 4: V2.0+ (Event Streaming)
**Pattern:** Kafka/RabbitMQ
**When:** Multiple services, high throughput, audit trails
**Complexity:** High
**Infrastructure:** Kafka cluster or RabbitMQ

---

## Player API Features (Primary Candidate)

### Real-Time Player Tracking

**Event:** `hunt.step.completed`
```typescript
{
  huntId: 1332,
  sessionId: "uuid",
  stepId: 101,
  playerId: "user-123",
  completedAt: "2025-11-08T14:30:00Z",
  timeSpent: 180 // seconds
}
```

**Use Cases:**
- Update LiveHunt.activePlayerCount
- Track real-time progress on creator dashboard
- Calculate live leaderboards
- Send notifications to hunt creator

**Implementation:** V1.1 (EventEmitter) or V1.2+ (BullMQ for persistence)

---

### Player Notifications

**Events:**
- `hunt.started` - Player begins hunt
- `step.completed` - Player completes step
- `hunt.completed` - Player finishes hunt
- `hint.requested` - Player requests hint

**Use Cases:**
- Email notifications to hunt creator ("Someone is playing your hunt!")
- Push notifications to player (encouragement, tips)
- SMS notifications for special events
- In-app notifications

**Implementation:** V1.1 (EventEmitter) for MVP, V1.2+ (BullMQ for reliable delivery)

**Why Event-Driven:**
- Sending email/SMS is slow (100-500ms) - don't block player API response
- Retry logic needed if email service fails
- Multiple notification channels (email, SMS, push)

---

### Leaderboards & Rankings

**Event:** `hunt.completed`
```typescript
{
  huntId: 1332,
  playerId: "user-123",
  completionTime: 3600, // seconds
  hintsUsed: 2,
  score: 850,
  completedAt: "2025-11-08T15:00:00Z"
}
```

**Use Cases:**
- Update global leaderboard
- Update hunt-specific leaderboard
- Update player stats
- Award badges/achievements

**Implementation:** V1.2+ (BullMQ - leaderboard updates can be delayed by seconds)

---

### Progress Analytics

**Events:**
- `step.started`
- `step.completed`
- `step.failed` (wrong answer)
- `hint.requested`

**Use Cases:**
- Track which steps are hardest (most hints requested)
- Track average completion time per step
- Identify steps where players quit
- A/B testing for hunt variations

**Implementation:** V1.2+ (BullMQ) or V2.0+ (Kafka for large-scale analytics)

---

## Other Features Beyond Player API

### 1. Hunt Lifecycle Events

**Events:**
- `hunt.published` - Version published
- `hunt.released` - Hunt goes live
- `hunt.taken_offline` - Hunt removed from discovery
- `hunt.deleted` - Hunt deleted
- `hunt.shared` - Hunt shared with collaborator

**Use Cases:**
- Audit trail for compliance
- Analytics (how many hunts published per day)
- Notifications to collaborators ("Hunt published!")
- Backup triggers (backup hunt data on publish)
- External webhooks (notify third-party systems)

**Implementation:** V1.1 (EventEmitter for audit logs) or V1.2+ (BullMQ for webhooks)

**Example - Audit Trail:**
```typescript
// In PublishingService
appEvents.emit('hunt.published', {
  huntId: 1332,
  version: 2,
  publishedBy: 'user-123',
  publishedAt: new Date()
});

// In AuditService (subscriber)
appEvents.on('hunt.published', async (data) => {
  await AuditLogModel.create({
    action: 'hunt.published',
    resourceType: 'hunt',
    resourceId: data.huntId,
    userId: data.publishedBy,
    metadata: { version: data.version },
    timestamp: data.publishedAt
  });
});
```

---

### 2. Notification System (General)

**Events:**
- `notification.user.mention` - User mentioned in comment
- `notification.hunt.played` - Someone played your hunt
- `notification.hunt.completed` - Someone completed your hunt
- `notification.hunt.shared` - Hunt shared with you
- `notification.badge.earned` - Player earned badge

**Use Cases:**
- In-app notification center
- Email digests (daily summary)
- Push notifications (mobile)
- SMS for urgent notifications

**Implementation:** V1.1 (EventEmitter) → V1.2+ (BullMQ for email delivery)

**Why Event-Driven:**
- Multiple notification channels (email, SMS, push, in-app)
- Retry logic for failed deliveries
- Batching (send digest emails, not 50 individual emails)
- Rate limiting (don't spam users)

---

### 3. Analytics & Metrics

**Events:**
- `analytics.hunt.view` - Hunt page viewed
- `analytics.hunt.played` - Hunt played
- `analytics.hunt.completed` - Hunt completed
- `analytics.qr.scanned` - QR code scanned
- `analytics.share.clicked` - Share button clicked

**Use Cases:**
- Creator dashboard (view counts, play counts, completion rate)
- Platform analytics (total hunts, total plays, retention)
- A/B testing (which hunt format performs best)
- Funnel analysis (QR scan → Start → Complete)

**Implementation:** V1.2+ (BullMQ) or V2.0+ (Kafka for high-volume analytics)

**Why Event-Driven:**
- High volume (thousands of events per day)
- Don't slow down user-facing endpoints
- Can batch writes to analytics database
- Can send to multiple analytics systems (Mixpanel, Amplitude, internal DB)

---

### 4. External Integrations & Webhooks

**Events:**
- `webhook.hunt.published` - Notify external system
- `webhook.hunt.completed` - Notify external system
- `integration.slack.notify` - Send Slack message
- `integration.discord.notify` - Send Discord message

**Use Cases:**
- Creator gets Slack notification when hunt is played
- NGO gets webhook when participant completes training hunt
- Discord bot announces new hunts in community server
- Zapier integration (trigger workflows)

**Implementation:** V1.2+ (BullMQ for reliable webhook delivery)

**Why Event-Driven:**
- External API calls are slow (500ms - 5s)
- Retry logic needed (external service might be down)
- Rate limiting (don't exceed API quotas)
- Don't block user-facing responses

**Example - Webhook Delivery:**
```typescript
// In HuntService
appEvents.emit('hunt.published', { huntId: 1332, ... });

// In WebhookService (subscriber)
await webhookQueue.add('deliver', {
  url: 'https://creator.com/webhooks/hunt-published',
  payload: { huntId: 1332, ... },
  retries: 3,
  timeout: 5000
});
```

---

### 5. Scheduled Jobs & Cron

**Events:**
- `job.cleanup.expired_sessions` - Daily cleanup
- `job.digest.weekly_summary` - Weekly email
- `job.analytics.daily_report` - Daily analytics
- `job.backup.hunts` - Weekly backup

**Use Cases:**
- Clean up expired play sessions (every 24 hours)
- Send weekly digest emails to creators
- Generate daily analytics reports
- Backup published hunts to S3

**Implementation:** V1.2+ (BullMQ with repeat option)

**Why Event-Driven:**
- Scheduled jobs shouldn't block app startup
- Need job persistence (if server restarts, job shouldn't be lost)
- Retry logic (if backup fails, retry in 1 hour)
- Job monitoring (did daily cleanup run?)

---

### 6. Collaboration Events

**Events:**
- `collaboration.user.invited` - User invited to collaborate
- `collaboration.permission.changed` - Permission level updated
- `collaboration.user.removed` - Collaborator removed
- `collaboration.comment.added` - Comment on hunt

**Use Cases:**
- Email notification to invited user
- Audit trail for permission changes
- Real-time updates in editor (someone else editing)
- Comment notifications

**Implementation:** V1.1 (EventEmitter) for basic notifications, V1.2+ (BullMQ) for email delivery

---

### 7. Content Moderation

**Events:**
- `moderation.hunt.reported` - Hunt reported as inappropriate
- `moderation.content.flagged` - AI flagged content
- `moderation.user.banned` - User banned

**Use Cases:**
- Queue hunts for manual review
- Send to content moderation API (AWS Rekognition, OpenAI Moderation)
- Notify admin team
- Auto-hide flagged content

**Implementation:** V1.2+ (BullMQ for review queue)

**Why Event-Driven:**
- Moderation API calls are slow (1-5 seconds)
- Manual review happens asynchronously
- Don't block hunt creation on moderation check

---

### 8. Search Indexing

**Events:**
- `search.hunt.published` - Index hunt in search
- `search.hunt.updated` - Update search index
- `search.hunt.deleted` - Remove from search

**Use Cases:**
- Update Elasticsearch/Algolia index
- Full-text search for hunt discovery
- Geo-spatial search (hunts near me)

**Implementation:** V1.2+ (BullMQ) or V2.0+ (Kafka for real-time search)

**Why Event-Driven:**
- Search indexing is slow (100-500ms)
- Eventual consistency is acceptable (index updated within seconds)
- Batch updates more efficient

---

## Feature Matrix

| Feature | Phase | Pattern | Why Event-Driven | Priority |
|---------|-------|---------|------------------|----------|
| **Player Tracking** | V1.1 | EventEmitter | Real-time updates, multiple subscribers | High |
| **Player Notifications** | V1.1 → V1.2 | EventEmitter → BullMQ | Async delivery, retries | High |
| **Leaderboards** | V1.2 | BullMQ | Can delay updates, complex calculations | Medium |
| **Progress Analytics** | V1.2 | BullMQ | High volume, batch processing | Medium |
| **Audit Trail** | V1.1 | EventEmitter | Multiple subscribers, non-blocking | High |
| **Webhooks** | V1.2 | BullMQ | External API calls, retries | Medium |
| **Email Digests** | V1.2 | BullMQ | Scheduled jobs, batching | Low |
| **Search Indexing** | V1.2 | BullMQ | Slow operation, eventual consistency | Low |
| **Content Moderation** | V1.2 | BullMQ | Async review, external APIs | Low |
| **Collaboration** | V1.1 | EventEmitter | Real-time notifications | Medium |

---

## When NOT to Use Event-Driven

**Keep Synchronous for:**
- ✅ CRUD operations (create, read, update, delete)
- ✅ Hunt publishing (user expects immediate confirmation)
- ✅ Hunt release (instant operation)
- ✅ Authorization checks (must be synchronous)
- ✅ Data validation (must block invalid requests)
- ✅ User authentication (must be immediate)

**Why:** These operations require immediate response, simple flow, or strong consistency.

---

## Trade-offs Summary

### Synchronous (Current)
**Pros:**
- Simple to understand
- Easy to debug
- Immediate response
- Strong consistency

**Cons:**
- Slow operations block response
- Tightly coupled
- Hard to scale horizontally

### Event-Driven (Future)
**Pros:**
- Decoupled components
- Async operations don't block
- Easy to add subscribers
- Scales horizontally
- Retry logic built-in

**Cons:**
- More complex to understand
- Harder to debug (distributed tracing needed)
- Eventual consistency
- Infrastructure overhead (Redis, Kafka)

---

## Recommended Timeline

**MVP (Now - Week 6):**
- ✅ Keep synchronous architecture
- ✅ Focus on core features
- ✅ No event-driven yet

**V1.1 (Week 7-10):**
- Add Node EventEmitter for:
  - Player notifications (email when someone plays your hunt)
  - Audit trail (log important events)
  - Basic analytics (track hunt plays)

**V1.2 (Week 11-14):**
- Add BullMQ + Redis for:
  - Reliable email delivery
  - Webhook delivery
  - Leaderboard updates
  - Background jobs (cleanup, backups)

**V2.0+ (Post-MVP):**
- Consider Kafka/RabbitMQ for:
  - High-volume analytics
  - Multiple microservices
  - Real-time data streaming
  - Complex event processing

---

## Implementation Strategy

### Start Small (V1.1)

**Step 1:** Add EventEmitter to one feature
```typescript
// src/events/appEvents.ts
export const appEvents = new EventEmitter();

// src/services/publishing/publishing.service.ts
appEvents.emit('hunt.published', { huntId, version, publishedBy });

// src/subscribers/audit.subscriber.ts
appEvents.on('hunt.published', async (data) => {
  await AuditLogModel.create({ action: 'hunt.published', ...data });
});
```

**Step 2:** Validate pattern works, add more events

**Step 3:** Document event contracts (event name, payload schema)

### Scale Up (V1.2+)

**Step 1:** Add Redis + BullMQ
```bash
npm install bullmq ioredis
```

**Step 2:** Convert slow operations to queues
```typescript
await notificationQueue.add('email', {
  to: 'user@example.com',
  template: 'hunt-published',
  data: { huntId: 1332 }
});
```

**Step 3:** Add monitoring (BullMQ Board UI)

---

## Key Takeaway

**Player API is indeed the primary candidate** for event-driven architecture, but **many other features** (notifications, analytics, webhooks, audit trails) will also benefit.

**Start simple with EventEmitter (V1.1), scale to BullMQ when needed (V1.2+), consider Kafka only if truly necessary (V2.0+).**

**Current synchronous architecture is perfect for MVP - don't add complexity until you need it.**

---

**Last updated:** 2025-11-08
