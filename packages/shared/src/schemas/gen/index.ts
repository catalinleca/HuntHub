import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const HuntStatus = z.enum(['draft', 'published', 'archived']);
const Location = z.object({ lat: z.number(), lng: z.number(), radius: z.number() }).passthrough();
const HuntAccessType = z.enum(['creator', 'viewer', 'editor']);
const ChallengeType = z.enum(['clue', 'quiz', 'mission', 'task']);
const OptionType = z.enum(['choice', 'input']);
const MissionType = z.enum(['upload-media', 'match-location']);
const MimeTypes = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
]);
const Clue = z.object({ title: z.string(), description: z.string() }).partial().passthrough();
const Option = z.object({ id: z.string(), text: z.string() }).passthrough();
const QuizValidation = z
  .object({
    mode: z.enum(['exact', 'fuzzy', 'contains', 'numeric-range']),
    caseSensitive: z.boolean(),
    range: z.object({ min: z.number(), max: z.number() }).partial().passthrough(),
    acceptableAnswers: z.array(z.string()),
  })
  .partial()
  .passthrough();
const Quiz = z
  .object({
    title: z.string(),
    description: z.string(),
    target: Option,
    type: OptionType,
    distractors: z.array(Option),
    validation: QuizValidation,
  })
  .partial()
  .passthrough();
const Mission = z
  .object({
    title: z.string(),
    description: z.string(),
    referenceAssetIds: z.array(z.string()),
    targetLocation: Location,
    type: MissionType,
    aiInstructions: z.string(),
    aiModel: z.enum(['gpt-4-vision', 'claude-vision', 'gemini-vision']),
  })
  .partial()
  .passthrough();
const Task = z
  .object({
    title: z.string(),
    instructions: z.string(),
    aiInstructions: z.string(),
    aiModel: z.enum(['gpt-4', 'claude', 'gemini']),
  })
  .partial()
  .passthrough();
const Challenge = z.object({ clue: Clue, quiz: Quiz, mission: Mission, task: Task }).partial().passthrough();
const Step = z
  .object({
    stepId: z.number().int(),
    huntId: z.number().int(),
    type: ChallengeType,
    challenge: Challenge,
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
    metadata: z.object({}).partial().passthrough().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const Hunt = z
  .object({
    huntId: z.number().int(),
    creatorId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    currentVersion: z.number().int(),
    status: HuntStatus,
    startLocation: Location.optional(),
    stepOrder: z.array(z.number().int()).optional(),
    steps: z.array(Step).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const StepCreate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
  })
  .passthrough();
const HuntCreate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    startLocation: Location.optional(),
    steps: z.array(StepCreate).optional(),
  })
  .passthrough();
const HuntUpdate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    startLocation: Location.optional(),
  })
  .passthrough();
const StepUpdate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
  })
  .passthrough();
const User = z
  .object({
    id: z.string(),
    firebaseUid: z.string(),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    profilePicture: z.string().optional(),
    bio: z.string().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const HuntAccess = z
  .object({
    huntId: z.string(),
    userId: z.string(),
    accessType: HuntAccessType,
    sharedAt: z.string().datetime({ offset: true }),
  })
  .passthrough();
const AssetUsage = z.object({ model: z.string(), field: z.string(), documentId: z.string() }).passthrough();
const StorageLocation = z.object({ bucket: z.string(), path: z.string() }).partial().passthrough();
const Asset = z
  .object({
    id: z.string(),
    assetId: z.number().int(),
    ownerId: z.string(),
    url: z.string(),
    mimeType: MimeTypes,
    originalFilename: z.string().optional(),
    size: z.number().optional(),
    thumbnailUrl: z.string().optional(),
    storageLocation: StorageLocation.optional(),
    usage: z.array(AssetUsage).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const AssetCreate = z
  .object({
    name: z.string().min(1),
    mime: z.string().min(1),
    sizeBytes: z.number().gte(1),
    url: z.string().min(1),
    s3Key: z.string().min(1),
  })
  .passthrough();

export const schemas: Record<string, any> = {
  HuntStatus,
  Location,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,
  MimeTypes,
  Clue,
  Option,
  QuizValidation,
  Quiz,
  Mission,
  Task,
  Challenge,
  Step,
  Hunt,
  StepCreate,
  HuntCreate,
  HuntUpdate,
  StepUpdate,
  User,
  HuntAccess,
  AssetUsage,
  StorageLocation,
  Asset,
  AssetCreate,
};

const endpoints = makeApi([]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
