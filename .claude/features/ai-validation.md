# AI Validation Feature

**Status:** Ready to Implement
**Created:** 2025-01-16
**Last Updated:** 2025-01-16

---

## Quick Context (For New Sessions)

**What:** AI-powered validation for player submissions in treasure hunts
**Scale:** ~100 validations/month (premium feature)
**Cost:** ~$1-2/month with OpenAI
**Provider:** OpenAI only (GPT-4o for vision/text, Whisper for audio)

**Key Files:**
- This doc: `.claude/features/ai-validation.md`
- Existing validators: `apps/backend/api/src/features/play/helpers/validators/`
- Types already support AI: `aiInstructions` and `aiModel` fields in Mission/Task

**Decisions Made:**
- OpenAI as sole provider (simpler, cost difference negligible at this scale)
- Synchronous validation (player waits max 15s)
- Auto-pass fallback when AI unavailable
- Accept with feedback for medium confidence (0.40-0.79)
- Backend only (no editor UI changes needed)

---

## Overview

Implement production-grade AI validation for player submissions in treasure hunts.

### Use Cases

| Use Case | Current Behavior | Target Behavior |
|----------|------------------|-----------------|
| Mission Photo Upload | Auto-pass if file uploaded | AI analyzes photo against creator's criteria |
| Mission Audio Upload | Auto-pass if file uploaded | Transcribe audio → AI validates content |
| Task (free text) | Auto-pass if response provided | AI evaluates response quality |

### Example Flow

**Hunt Creator sets up a Mission step:**
```
Title: "Find the Red Door"
Description: "Take a photo of the famous red door on Elm Street"
AI Instructions: "Validate that the photo shows a red-colored door.
                  The door should be clearly visible and predominantly red."
```

**Player Experience:**
1. Player takes photo of a red door
2. Uploads photo → Backend receives assetId
3. Backend fetches photo from S3
4. AI analyzes: "Is this a red door?"
5. AI returns: `{ isValid: true, confidence: 0.92, feedback: "Great photo of a red door!" }`
6. Player sees: "Correct! Great photo of a red door!"

---

## Scope (MVP)

### In Scope
- Backend AI validation service
- OpenAI integration (GPT-4o for vision/text, Whisper for audio)
- Circuit breaker for fault tolerance
- Retry with exponential backoff
- Graceful fallback when AI unavailable
- Confidence scoring with thresholds

### Out of Scope (Future)
- Editor UI changes (model selector)
- Alternative providers (Claude, Gemini)
- Async validation queue (BullMQ)
- Human-in-the-loop review queue
- Cost tracking dashboard

---

## Key Decisions

### 1. AI Provider: OpenAI Only

**Decision:** Use OpenAI as the sole AI provider for MVP.

**Models:**
- `gpt-4o` - Vision (image analysis) and text validation
- `whisper-1` or `gpt-4o-transcribe` - Audio transcription

**Rationale:**
- Best-documented APIs
- Excellent vision capabilities
- Single API key to manage
- Can add Claude/Gemini later (provider interface designed for extensibility)

### 2. Synchronous Validation

**Decision:** Player waits for AI validation (max 15 seconds).

**Rationale:**
- Simpler implementation (no polling, webhooks, or WebSockets)
- Treasure hunts are event-based, not real-time
- 10-15 second wait is acceptable for photo validation
- Async can be added later if needed

**Timeouts:**
| Content Type | Timeout |
|-------------|---------|
| Text (Task) | 10 seconds |
| Image (Photo) | 15 seconds |
| Audio | 30 seconds |

### 3. Confidence Thresholds

**Decision:** Three-tier confidence model.

| Confidence | Action | Player Sees |
|------------|--------|-------------|
| >= 0.80 | **Accept** | "Correct! [positive feedback]" |
| 0.40 - 0.79 | **Accept with note** | "Accepted! Note: [AI suggestion]" |
| < 0.40 | **Reject** | "Try again. Hint: [AI feedback]" |

**Example Responses:**

```typescript
// High confidence (0.85)
{
  isCorrect: true,
  confidence: 0.85,
  feedback: "Great photo! The red door is clearly visible."
}

// Medium confidence (0.65)
{
  isCorrect: true,
  confidence: 0.65,
  feedback: "Accepted! The door appears reddish, though lighting makes it look slightly orange."
}

// Low confidence (0.30)
{
  isCorrect: false,
  confidence: 0.30,
  feedback: "This doesn't appear to be a red door. Make sure the door is clearly visible and red-colored."
}
```

### 4. Fallback Behavior

**Decision:** Auto-pass with flag when AI is unavailable.

**When AI fails (timeout, rate limit, API error):**
```typescript
{
  isCorrect: true,
  feedback: "Submission received!",
  fallbackUsed: true,  // Flag for potential review
  confidence: undefined
}
```

**Rationale:**
- Player experience prioritized over strict validation
- Hunt creator can review flagged submissions later
- Better than blocking players indefinitely

### 5. Backward Compatibility

**Decision:** Steps WITHOUT `aiInstructions` continue to auto-pass.

```typescript
// Step has aiInstructions → Use AI validation
if (mission.aiInstructions) {
  return await aiValidationService.validateImage(assetId, mission);
}

// No aiInstructions → Auto-pass (existing behavior)
return { isCorrect: true, feedback: 'Media received!' };
```

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PlayService                              │
│                    validateAnswer()                              │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AnswerValidator                             │
│                 (Strategy Pattern Registry)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │ ClueValidator│ │QuizValidator│ │ MissionMediaValidator   │   │
│  └─────────────┘ └─────────────┘ │        ▼                │   │
│                                   │ AIValidationService     │   │
│  ┌─────────────┐                 └─────────────────────────┘   │
│  │TaskValidator │◄──────────────────────┘                       │
│  │      ▼       │                                               │
│  │AIValidation  │                                               │
│  │  Service     │                                               │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AIValidationService                           │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ CircuitBreaker │  │  RetryHandler   │  │  CostTracker    │  │
│  └───────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│          │                    │                     │           │
│          └────────────────────┼─────────────────────┘           │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   OpenAIProvider                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ GPT-4o      │ │ GPT-4o      │ │ Whisper         │   │   │
│  │  │ (Vision)    │ │ (Text)      │ │ (Transcription) │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
apps/backend/api/src/
├── services/
│   └── ai-validation/                     # NEW MODULE
│       ├── index.ts                       # Barrel exports
│       ├── ai-validation.service.ts       # Main orchestrator
│       ├── ai-validation.types.ts         # All interfaces/types
│       │
│       ├── providers/
│       │   ├── index.ts
│       │   ├── ai-provider.interface.ts   # Provider contract
│       │   └── openai.provider.ts         # GPT-4o + Whisper impl
│       │
│       ├── strategies/
│       │   ├── index.ts
│       │   ├── validation-strategy.interface.ts
│       │   ├── image-validation.strategy.ts   # Photo missions
│       │   ├── audio-validation.strategy.ts   # Audio missions
│       │   └── text-validation.strategy.ts    # Task responses
│       │
│       └── utils/
│           ├── circuit-breaker.ts         # Opossum wrapper
│           ├── retry.ts                   # Exponential backoff
│           └── prompt-builder.ts          # Structured prompts
│
├── features/play/helpers/
│   ├── answer-validator.helper.ts         # MODIFY: make async
│   └── validators/
│       ├── mission-media.validator.ts     # MODIFY: integrate AI
│       └── task.validator.ts              # MODIFY: integrate AI
│
└── config/
    ├── env.config.ts                      # MODIFY: add AI config
    └── inversify.ts                       # MODIFY: register AI services
```

---

## Interfaces & Types

### Core Types

```typescript
// ai-validation.types.ts

/**
 * Extended validation result with AI metadata
 */
export interface AIValidationResult {
  isCorrect: boolean;
  feedback: string;
  confidence?: number;        // 0.0 - 1.0
  aiModel?: string;           // 'gpt-4o', 'whisper-1'
  processingTimeMs?: number;  // Latency tracking
  fallbackUsed?: boolean;     // True if AI was unavailable
}

/**
 * Parameters for image validation
 */
export interface ImageValidationParams {
  imageUrl: string;           // S3/CloudFront URL
  instructions: string;       // Creator's aiInstructions
  referenceImageUrls?: string[]; // Optional reference images
}

/**
 * Parameters for text validation
 */
export interface TextValidationParams {
  userResponse: string;       // Player's text response
  instructions: string;       // Creator's aiInstructions
  context?: string;           // Optional: step title/description
}

/**
 * Parameters for audio validation
 */
export interface AudioValidationParams {
  audioUrl: string;           // S3/CloudFront URL
  instructions: string;       // Creator's aiInstructions
}

/**
 * Raw response from AI provider
 */
export interface AIProviderResponse {
  isValid: boolean;
  confidence: number;
  feedback: string;
  reasoning?: string;         // Internal explanation (not shown to player)
}

/**
 * Configuration for AI validation
 */
export interface AIValidationConfig {
  provider: 'openai';
  timeoutMs: number;
  confidenceThresholds: {
    high: number;             // >= this → auto-accept (default: 0.80)
    low: number;              // < this → reject (default: 0.40)
  };
  retryConfig: {
    maxRetries: number;       // default: 2
    baseDelayMs: number;      // default: 1000
  };
}
```

### Provider Interface

```typescript
// ai-provider.interface.ts

export interface IAIProvider {
  readonly name: string;
  readonly supportsVision: boolean;
  readonly supportsAudio: boolean;

  /**
   * Validate an image against instructions
   */
  validateImage(params: ImageValidationParams): Promise<AIProviderResponse>;

  /**
   * Validate text response against instructions
   */
  validateText(params: TextValidationParams): Promise<AIProviderResponse>;

  /**
   * Transcribe audio to text
   */
  transcribeAudio(audioUrl: string): Promise<string>;
}
```

### Service Interface

```typescript
// ai-validation.service.ts

export interface IAIValidationService {
  /**
   * Validate a mission media submission (photo or audio)
   */
  validateMissionMedia(
    assetId: number,
    mission: Mission,
    missionType: 'upload-media' | 'upload-audio'
  ): Promise<AIValidationResult>;

  /**
   * Validate a task text response
   */
  validateTask(
    response: string,
    task: Task
  ): Promise<AIValidationResult>;

  /**
   * Check if AI validation is available (circuit not open)
   */
  isAvailable(): boolean;
}
```

---

## Implementation Examples

### 1. OpenAI Provider Implementation

```typescript
// providers/openai.provider.ts

import OpenAI from 'openai';
import { injectable } from 'inversify';
import { IAIProvider, AIProviderResponse, ImageValidationParams, TextValidationParams } from '../ai-validation.types';

@injectable()
export class OpenAIProvider implements IAIProvider {
  readonly name = 'openai';
  readonly supportsVision = true;
  readonly supportsAudio = true;

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async validateImage(params: ImageValidationParams): Promise<AIProviderResponse> {
    const { imageUrl, instructions, referenceImageUrls } = params;

    const systemPrompt = `You are a treasure hunt validation assistant.
Your job is to determine if a player's photo submission meets the specified criteria.
Respond with a JSON object: { "isValid": boolean, "confidence": number (0-1), "feedback": string }
Be encouraging but accurate. The feedback should be 1-2 sentences.`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `Validation criteria: ${instructions}\n\nDoes this photo meet the criteria?`,
      },
      {
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'auto' },
      },
    ];

    // Add reference images if provided
    if (referenceImageUrls?.length) {
      userContent.push({
        type: 'text',
        text: 'Reference images (what we\'re looking for):',
      });
      for (const refUrl of referenceImageUrls) {
        userContent.push({
          type: 'image_url',
          image_url: { url: refUrl, detail: 'low' },
        });
      }
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      isValid: result.isValid,
      confidence: result.confidence,
      feedback: result.feedback,
      reasoning: result.reasoning,
    };
  }

  async validateText(params: TextValidationParams): Promise<AIProviderResponse> {
    const { userResponse, instructions, context } = params;

    const systemPrompt = `You are a treasure hunt validation assistant.
Your job is to determine if a player's text response meets the specified criteria.
Respond with a JSON object: { "isValid": boolean, "confidence": number (0-1), "feedback": string }
Be encouraging but accurate. The feedback should be 1-2 sentences.`;

    const userPrompt = context
      ? `Task: ${context}\n\nValidation criteria: ${instructions}\n\nPlayer's response: "${userResponse}"\n\nDoes this response meet the criteria?`
      : `Validation criteria: ${instructions}\n\nPlayer's response: "${userResponse}"\n\nDoes this response meet the criteria?`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      isValid: result.isValid,
      confidence: result.confidence,
      feedback: result.feedback,
    };
  }

  async transcribeAudio(audioUrl: string): Promise<string> {
    // Fetch audio file from URL
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Create a File-like object for the API
    const audioFile = new File([audioBuffer], 'audio.webm', {
      type: 'audio/webm'
    });

    const transcription = await this.client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return transcription;
  }
}
```

### 2. Circuit Breaker Wrapper

```typescript
// utils/circuit-breaker.ts

import CircuitBreaker from 'opossum';

export interface CircuitBreakerConfig {
  timeout: number;                    // Request timeout (ms)
  errorThresholdPercentage: number;   // % failures to open circuit
  resetTimeout: number;               // Time before half-open (ms)
  volumeThreshold: number;            // Min requests before checking
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  timeout: 15000,                     // 15 seconds
  errorThresholdPercentage: 50,       // Open at 50% failure
  resetTimeout: 30000,                // 30 seconds cooldown
  volumeThreshold: 5,                 // At least 5 requests
};

export function createCircuitBreaker<T>(
  fn: (...args: any[]) => Promise<T>,
  config: Partial<CircuitBreakerConfig> = {}
): CircuitBreaker<any[], T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const breaker = new CircuitBreaker(fn, {
    timeout: finalConfig.timeout,
    errorThresholdPercentage: finalConfig.errorThresholdPercentage,
    resetTimeout: finalConfig.resetTimeout,
    volumeThreshold: finalConfig.volumeThreshold,
  });

  // Logging hooks
  breaker.on('open', () => {
    console.warn('[CircuitBreaker] Circuit OPENED - AI validation unavailable');
  });

  breaker.on('halfOpen', () => {
    console.info('[CircuitBreaker] Circuit HALF-OPEN - Testing AI availability');
  });

  breaker.on('close', () => {
    console.info('[CircuitBreaker] Circuit CLOSED - AI validation restored');
  });

  return breaker;
}
```

### 3. AI Validation Service

```typescript
// ai-validation.service.ts

import { inject, injectable } from 'inversify';
import CircuitBreaker from 'opossum';
import { TYPES } from '@/shared/types';
import { IAssetService } from '@/modules/assets/asset.service';
import { Mission, Task, MissionType } from '@hunthub/shared';
import {
  IAIValidationService,
  IAIProvider,
  AIValidationResult,
  AIValidationConfig,
} from './ai-validation.types';
import { createCircuitBreaker } from './utils/circuit-breaker';
import { withRetry } from './utils/retry';

@injectable()
export class AIValidationService implements IAIValidationService {
  private circuitBreaker: CircuitBreaker<any[], AIValidationResult>;
  private config: AIValidationConfig;

  constructor(
    @inject(TYPES.OpenAIProvider) private provider: IAIProvider,
    @inject(TYPES.AssetService) private assetService: IAssetService,
  ) {
    this.config = {
      provider: 'openai',
      timeoutMs: 15000,
      confidenceThresholds: {
        high: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD_HIGH || '0.80'),
        low: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD_LOW || '0.40'),
      },
      retryConfig: {
        maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2'),
        baseDelayMs: 1000,
      },
    };

    // Wrap validation in circuit breaker
    this.circuitBreaker = createCircuitBreaker(
      this.executeValidation.bind(this),
      { timeout: this.config.timeoutMs }
    );

    // Fallback when circuit is open
    this.circuitBreaker.fallback(() => this.createFallbackResult());
  }

  async validateMissionMedia(
    assetId: number,
    mission: Mission,
    missionType: MissionType
  ): Promise<AIValidationResult> {
    const startTime = Date.now();

    try {
      // Get asset URL from asset service
      const asset = await this.assetService.getAssetById(assetId, 'system');
      const assetUrl = asset.publicUrl;

      if (missionType === MissionType.UploadAudio) {
        return await this.circuitBreaker.fire('audio', {
          audioUrl: assetUrl,
          instructions: mission.aiInstructions!,
        });
      }

      // Photo/video validation
      const referenceUrls = await this.getReferenceAssetUrls(mission.referenceAssetIds);

      return await this.circuitBreaker.fire('image', {
        imageUrl: assetUrl,
        instructions: mission.aiInstructions!,
        referenceImageUrls: referenceUrls,
      });
    } catch (error) {
      console.error('[AIValidation] Mission media validation failed:', error);
      return this.createFallbackResult();
    }
  }

  async validateTask(response: string, task: Task): Promise<AIValidationResult> {
    try {
      return await this.circuitBreaker.fire('text', {
        userResponse: response,
        instructions: task.aiInstructions!,
        context: task.instructions, // What the player was asked to do
      });
    } catch (error) {
      console.error('[AIValidation] Task validation failed:', error);
      return this.createFallbackResult();
    }
  }

  isAvailable(): boolean {
    return !this.circuitBreaker.opened;
  }

  private async executeValidation(
    type: 'image' | 'audio' | 'text',
    params: any
  ): Promise<AIValidationResult> {
    const startTime = Date.now();

    // Wrap in retry logic
    const providerResponse = await withRetry(
      async () => {
        switch (type) {
          case 'image':
            return this.provider.validateImage(params);
          case 'audio':
            const transcription = await this.provider.transcribeAudio(params.audioUrl);
            return this.provider.validateText({
              userResponse: transcription,
              instructions: params.instructions,
            });
          case 'text':
            return this.provider.validateText(params);
          default:
            throw new Error(`Unknown validation type: ${type}`);
        }
      },
      this.config.retryConfig
    );

    // Apply confidence thresholds
    const { high, low } = this.config.confidenceThresholds;
    const isCorrect = providerResponse.confidence >= low;

    // Customize feedback based on confidence
    let feedback = providerResponse.feedback;
    if (providerResponse.confidence >= high) {
      // High confidence - just use the feedback
    } else if (providerResponse.confidence >= low) {
      // Medium confidence - accepted with note
      feedback = `Accepted! ${providerResponse.feedback}`;
    } else {
      // Low confidence - rejected
      feedback = `Try again. ${providerResponse.feedback}`;
    }

    return {
      isCorrect,
      feedback,
      confidence: providerResponse.confidence,
      aiModel: this.provider.name,
      processingTimeMs: Date.now() - startTime,
      fallbackUsed: false,
    };
  }

  private createFallbackResult(): AIValidationResult {
    return {
      isCorrect: true,
      feedback: 'Submission received!',
      fallbackUsed: true,
    };
  }

  private async getReferenceAssetUrls(assetIds?: number[]): Promise<string[]> {
    if (!assetIds?.length) return [];

    const urls: string[] = [];
    for (const id of assetIds) {
      try {
        const asset = await this.assetService.getAssetById(id, 'system');
        urls.push(asset.publicUrl);
      } catch {
        // Skip missing reference assets
      }
    }
    return urls;
  }
}
```

### 4. Updated Mission Media Validator

```typescript
// validators/mission-media.validator.ts

import { AnswerPayload, Mission, MissionType } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import { IAIValidationService } from '@/services/ai-validation';

/**
 * MissionMediaValidator - Validates media upload missions
 *
 * - If aiInstructions present: Uses AI validation
 * - If no aiInstructions: Auto-pass (backward compatible)
 */
export const MissionMediaValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep): Promise<ValidationResult> {
    const assetId = payload.missionMedia?.assetId;

    if (!assetId) {
      return {
        isCorrect: false,
        feedback: 'Please upload your media',
      };
    }

    const mission = step.challenge?.mission as Mission | undefined;

    // No AI instructions → auto-pass (backward compatible)
    if (!mission?.aiInstructions) {
      return {
        isCorrect: true,
        feedback: 'Media received!',
      };
    }

    // Use AI validation
    const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);
    const missionType = mission.type || MissionType.UploadMedia;

    return aiService.validateMissionMedia(assetId, mission, missionType);
  },
};
```

### 5. Updated Task Validator

```typescript
// validators/task.validator.ts

import { AnswerPayload, Task } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import { IAIValidationService } from '@/services/ai-validation';

/**
 * TaskValidator - Validates free-text task responses
 *
 * - If aiInstructions present: Uses AI validation
 * - If no aiInstructions: Auto-pass (backward compatible)
 */
export const TaskValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep): Promise<ValidationResult> {
    const response = payload.task?.response?.trim();

    if (!response) {
      return {
        isCorrect: false,
        feedback: 'Please provide a response',
      };
    }

    const task = step.challenge?.task as Task | undefined;

    // No AI instructions → auto-pass (backward compatible)
    if (!task?.aiInstructions) {
      return {
        isCorrect: true,
        feedback: 'Response recorded!',
      };
    }

    // Use AI validation
    const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);

    return aiService.validateTask(response, task);
  },
};
```

### 6. Retry Utility

```typescript
// utils/retry.ts

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  jitterFactor?: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  jitterFactor: 0.2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, jitterFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) break;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
      const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
      const cappedDelay = Math.min(exponentialDelay, maxDelayMs!);
      const jitter = cappedDelay * jitterFactor! * Math.random();
      const delay = cappedDelay + jitter;

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${Math.round(delay)}ms`,
        error
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Rate limit errors
    if (error.message.includes('rate limit')) return true;
    if (error.message.includes('429')) return true;

    // Server errors
    if (error.message.includes('500')) return true;
    if (error.message.includes('502')) return true;
    if (error.message.includes('503')) return true;

    // Network errors
    if (error.message.includes('ECONNRESET')) return true;
    if (error.message.includes('ETIMEDOUT')) return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Configuration

### Environment Variables

Add to `.env`:

```env
# Required
OPENAI_API_KEY=sk-...

# Optional (with defaults shown)
AI_VALIDATION_TIMEOUT_MS=15000
AI_CONFIDENCE_THRESHOLD_HIGH=0.80
AI_CONFIDENCE_THRESHOLD_LOW=0.40
AI_MAX_RETRIES=2
AI_CIRCUIT_BREAKER_TIMEOUT_MS=30000
```

### InversifyJS Registration

Add to `config/inversify.ts`:

```typescript
import { AIValidationService, IAIValidationService } from '@/services/ai-validation';
import { OpenAIProvider, IAIProvider } from '@/services/ai-validation/providers';

// Add to TYPES
export const TYPES = {
  // ... existing types
  AIValidationService: Symbol.for('AIValidationService'),
  OpenAIProvider: Symbol.for('OpenAIProvider'),
};

// Register services
container.bind<IAIProvider>(TYPES.OpenAIProvider).to(OpenAIProvider).inSingletonScope();
container.bind<IAIValidationService>(TYPES.AIValidationService).to(AIValidationService).inSingletonScope();
```

---

## Testing Strategy

### Unit Tests

```typescript
// Mock provider for testing
export class MockAIProvider implements IAIProvider {
  readonly name = 'mock';
  readonly supportsVision = true;
  readonly supportsAudio = true;

  constructor(private response: AIProviderResponse) {}

  async validateImage(): Promise<AIProviderResponse> {
    return this.response;
  }

  async validateText(): Promise<AIProviderResponse> {
    return this.response;
  }

  async transcribeAudio(): Promise<string> {
    return 'Transcribed text';
  }
}

describe('AIValidationService', () => {
  it('should accept high confidence responses', async () => {
    const mockProvider = new MockAIProvider({
      isValid: true,
      confidence: 0.90,
      feedback: 'Great photo!',
    });

    const service = new AIValidationService(mockProvider, mockAssetService);
    const result = await service.validateMissionMedia(1, mockMission, 'upload-media');

    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(0.90);
  });

  it('should reject low confidence responses', async () => {
    const mockProvider = new MockAIProvider({
      isValid: false,
      confidence: 0.25,
      feedback: 'Not quite right',
    });

    const service = new AIValidationService(mockProvider, mockAssetService);
    const result = await service.validateTask('wrong answer', mockTask);

    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('Try again');
  });

  it('should fallback when circuit breaker is open', async () => {
    // Trigger circuit breaker
    const failingProvider = new MockAIProvider({} as any);
    jest.spyOn(failingProvider, 'validateImage').mockRejectedValue(new Error('API Error'));

    // ... trigger 5 failures to open circuit

    const result = await service.validateMissionMedia(1, mockMission, 'upload-media');

    expect(result.isCorrect).toBe(true);
    expect(result.fallbackUsed).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('AI Validation Integration', () => {
  it('should validate photo mission end-to-end', async () => {
    // 1. Start session
    const session = await playService.startSession(huntId);

    // 2. Upload photo asset
    const asset = await assetService.createAsset(userId, photoData);

    // 3. Submit answer
    const result = await playService.validateAnswer(session.sessionId, {
      answerType: AnswerType.MissionMedia,
      payload: { missionMedia: { assetId: asset.assetId } },
    });

    // 4. Verify
    expect(result.correct).toBeDefined();
    expect(result.feedback).toBeDefined();
  });
});
```

---

## Task Checklist

### Phase 1: Foundation (2-3 days)
- [ ] Create `services/ai-validation/` folder structure
- [ ] Create `ai-validation.types.ts` with all interfaces
- [ ] Create mock provider for testing
- [ ] Make `IAnswerValidator.validate()` return `Promise<ValidationResult>`
- [ ] Update `AnswerValidator.validate()` to be async
- [ ] Update `PlayService.validateAnswer()` to await validators
- [ ] Add AI environment variables to `env.config.ts`
- [ ] Add TYPES constants for DI
- [ ] Register services in inversify container
- [ ] Ensure all existing tests still pass

### Phase 2: OpenAI Provider + Text (2-3 days)
- [ ] Install `openai` npm package
- [ ] Implement `OpenAIProvider` class
- [ ] Implement `TextValidationStrategy`
- [ ] Create `circuit-breaker.ts` utility
- [ ] Create `retry.ts` utility
- [ ] Integrate with `TaskValidator`
- [ ] Write unit tests for provider
- [ ] Write unit tests for strategy
- [ ] Write integration test for task validation

### Phase 3: Image Validation (2-3 days)
- [ ] Implement `ImageValidationStrategy`
- [ ] Add GPT-4o vision API calls
- [ ] Handle reference images in prompts
- [ ] Integrate with `MissionMediaValidator` (photo type)
- [ ] Write unit tests
- [ ] Write integration test for photo validation

### Phase 4: Audio Validation (1-2 days)
- [ ] Implement `AudioValidationStrategy`
- [ ] Add Whisper transcription
- [ ] Chain transcription → text validation
- [ ] Integrate with `MissionMediaValidator` (audio type)
- [ ] Write unit tests
- [ ] Write integration test for audio validation

### Phase 5: Production Hardening (1-2 days)
- [ ] Add comprehensive error handling
- [ ] Add structured logging
- [ ] Add cost tracking (optional)
- [ ] Performance testing
- [ ] Update documentation
- [ ] Final integration test suite

---

## Cost Estimates

| Operation | Est. Cost | Notes |
|-----------|-----------|-------|
| Image validation | $0.01-0.03 | GPT-4o vision, depends on image size |
| Text validation | $0.001-0.005 | GPT-4o, short prompts |
| Audio transcription | $0.006/min | Whisper |

**Monthly estimate (1000 validations/day):**
- Images: ~$300-500/month
- Text: ~$30-50/month
- Audio: Variable based on usage

---

## References

- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Opossum Circuit Breaker](https://github.com/nodeshift/opossum)
- [HuntHub Backend Standards](/.claude/standards/backend.md)
