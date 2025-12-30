import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const HuntStatus = z.enum(['draft', 'published']);
const Location = z
  .object({ lat: z.number(), lng: z.number(), radius: z.number(), address: z.string().optional() })
  .strict();
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
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
]);
const MediaType = z.enum(['image', 'audio', 'video', 'image-audio']);
const AssetSnapshot = z
  .object({ id: z.number().int(), url: z.string(), name: z.string(), sizeBytes: z.number().int() })
  .strict();
const ImageMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), alt: z.string().optional() })
  .strict();
const AudioMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), transcript: z.string().optional() })
  .strict();
const VideoMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), alt: z.string().optional() })
  .strict();
const ImageAudioMedia = z.object({ image: ImageMedia, audio: AudioMedia, title: z.string().optional() }).strict();
const MediaContent = z
  .object({ image: ImageMedia, audio: AudioMedia, video: VideoMedia, imageAudio: ImageAudioMedia })
  .partial()
  .strict();
const Media = z.object({ type: MediaType, content: MediaContent }).strict();
const Clue = z.object({ title: z.string(), description: z.string() }).partial().strict();
const Option = z.object({ id: z.string(), text: z.string() }).strict();
const QuizValidation = z
  .object({
    mode: z.enum(['exact', 'fuzzy', 'contains', 'numeric-range']),
    caseSensitive: z.boolean(),
    range: z.object({ min: z.number(), max: z.number() }).partial().strict().passthrough(),
    acceptableAnswers: z.array(z.string()),
  })
  .partial()
  .strict();
const Quiz = z
  .object({
    title: z.string(),
    description: z.string(),
    target: Option,
    type: OptionType,
    distractors: z.array(Option),
    displayOrder: z.array(z.string()),
    randomizeOrder: z.boolean(),
    validation: QuizValidation,
  })
  .partial()
  .strict();
const Mission = z
  .object({
    title: z.string(),
    description: z.string(),
    referenceAssetIds: z.array(z.number().int()),
    targetLocation: Location,
    type: MissionType,
    aiInstructions: z.string(),
    aiModel: z.enum(['gpt-4-vision', 'claude-vision', 'gemini-vision']),
  })
  .partial()
  .strict();
const Task = z
  .object({
    title: z.string(),
    instructions: z.string(),
    aiInstructions: z.string(),
    aiModel: z.enum(['gpt-4', 'claude', 'gemini']),
  })
  .partial()
  .strict();
const Challenge = z.object({ clue: Clue, quiz: Quiz, mission: Mission, task: Task }).partial().strict();
const Step = z
  .object({
    stepId: z.number().int(),
    huntId: z.number().int(),
    type: ChallengeType,
    challenge: Challenge,
    media: Media.optional(),
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
const Hunt = z
  .object({
    huntId: z.number().int(),
    creatorId: z.string(),
    version: z.number().int(),
    latestVersion: z.number().int(),
    liveVersion: z.number().int().nullish(),
    name: z.string(),
    description: z.string().optional(),
    status: HuntStatus,
    startLocation: Location.optional(),
    stepOrder: z.array(z.number().int()),
    steps: z.array(Step).optional(),
    isPublished: z.boolean(),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    publishedBy: z.string().optional(),
    isLive: z.boolean().optional(),
    releasedAt: z.string().datetime({ offset: true }).optional(),
    releasedBy: z.string().optional(),
    permission: z.enum(['owner', 'admin', 'view']).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    coverImage: Media.nullish(),
  })
  .strict();
const StepCreate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    media: Media.optional(),
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
  })
  .strict();
const HuntCreate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    startLocation: Location.optional(),
    steps: z.array(StepCreate).optional(),
    coverImage: Media.nullish(),
  })
  .strict();
const HuntUpdate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    startLocation: Location,
    updatedAt: z.string().datetime({ offset: true }),
    coverImage: Media.nullable(),
  })
  .partial()
  .strict();
const StepUpdate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    media: Media.optional(),
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
  })
  .strict();
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
  .strict();
const HuntAccess = z
  .object({
    huntId: z.string(),
    userId: z.string(),
    accessType: HuntAccessType,
    sharedAt: z.string().datetime({ offset: true }),
  })
  .strict();
const AssetUsage = z.object({ model: z.string(), field: z.string(), documentId: z.string() }).strict();
const StorageLocation = z.object({ bucket: z.string(), path: z.string() }).partial().strict();
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
  .strict();
const AssetCreate = z
  .object({
    name: z.string().min(1),
    mime: z.string().min(1),
    sizeBytes: z.number().gte(1),
    url: z.string().min(1),
    s3Key: z.string().min(1),
  })
  .strict();
const PublishResult = z
  .object({
    publishedVersion: z.number().int(),
    newDraftVersion: z.number().int(),
    publishedAt: z.string().datetime({ offset: true }),
  })
  .strict();
const HuntProgressStatus = z.enum(['in_progress', 'completed', 'abandoned']);
const Submission = z
  .object({
    timestamp: z.string().datetime({ offset: true }),
    content: z.unknown(),
    isCorrect: z.boolean(),
    score: z.number().optional(),
    feedback: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const StepProgress = z
  .object({
    stepId: z.number().int(),
    attempts: z.number().int().optional().default(0),
    completed: z.boolean().optional().default(false),
    responses: z.array(Submission).optional(),
    startedAt: z.string().datetime({ offset: true }).optional(),
    completedAt: z.string().datetime({ offset: true }).optional(),
    duration: z.number().optional(),
  })
  .strict();
const Progress = z
  .object({
    id: z.string(),
    userId: z.string().optional(),
    sessionId: z.string(),
    isAnonymous: z.boolean(),
    huntId: z.number().int(),
    version: z.number().int(),
    status: HuntProgressStatus,
    startedAt: z.string().datetime({ offset: true }),
    completedAt: z.string().datetime({ offset: true }).optional(),
    duration: z.number().optional(),
    currentStepId: z.number().int(),
    steps: z.array(StepProgress).optional(),
    playerName: z.string().min(1).max(50),
    rating: z.number().gte(0).lte(5).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
const LiveHunt = z
  .object({
    huntId: z.number().int(),
    huntVersion: z.number().int(),
    activePlayerCount: z.number().int().default(0),
    lastPlayedAt: z.string().datetime({ offset: true }).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
const ReleaseResult = z
  .object({
    huntId: z.number().int(),
    liveVersion: z.number().int(),
    previousLiveVersion: z.number().int().nullable(),
    releasedAt: z.string().datetime({ offset: true }),
    releasedBy: z.string(),
  })
  .strict();
const TakeOfflineResult = z
  .object({
    huntId: z.number().int(),
    previousLiveVersion: z.number().int(),
    takenOfflineAt: z.string().datetime({ offset: true }),
  })
  .strict();
const Collaborator = z
  .object({
    userId: z.string(),
    displayName: z.string(),
    email: z.string().email().optional(),
    profilePicture: z.string().optional(),
    permission: z.enum(['admin', 'view']),
    sharedAt: z.string().datetime({ offset: true }),
    sharedBy: z.string().optional(),
  })
  .strict();
const ShareResult = z
  .object({
    huntId: z.number().int(),
    sharedWithId: z.string(),
    permission: z.enum(['admin', 'view']),
    sharedAt: z.string().datetime({ offset: true }),
    sharedBy: z.string(),
  })
  .strict();
const ReleaseHuntRequest = z
  .object({ version: z.number().int(), currentLiveVersion: z.number().int().nullable() })
  .partial()
  .strict();
const TakeOfflineRequest = z.object({ currentLiveVersion: z.number().int().nullable() }).strict();
const ShareHuntRequest = z.object({ email: z.string().email(), permission: z.enum(['admin', 'view']) }).strict();
const UpdatePermissionRequest = z.object({ permission: z.enum(['admin', 'view']) }).strict();
const SortOrder = z.enum(['asc', 'desc']);
const HuntSortField = z.enum(['createdAt', 'updatedAt']);
const AssetSortField = z.enum(['createdAt', 'originalFilename', 'size']);
const PaginationQueryParams = z
  .object({
    page: z.number().int().gte(1).default(1),
    limit: z.number().int().gte(1).lte(100).default(10),
    sortOrder: SortOrder,
  })
  .partial()
  .strict();
const HuntQueryParams = PaginationQueryParams.and(z.object({ sortBy: HuntSortField }).partial().strict());
const AssetQueryParams = PaginationQueryParams.and(
  z.object({ sortBy: AssetSortField, mimeType: MimeTypes }).partial().strict(),
);
const PaginationMeta = z
  .object({
    total: z.number().int(),
    page: z.number().int().gte(1),
    limit: z.number().int().gte(1),
    totalPages: z.number().int().gte(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  })
  .strict();
const PaginatedHuntsResponse = z.object({ data: z.array(Hunt), pagination: PaginationMeta }).strict();
const PaginatedAssetsResponse = z.object({ data: z.array(Asset), pagination: PaginationMeta }).strict();

export const schemas: Record<string, z.ZodTypeAny> = {
  HuntStatus,
  Location,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,
  MimeTypes,
  MediaType,
  AssetSnapshot,
  ImageMedia,
  AudioMedia,
  VideoMedia,
  ImageAudioMedia,
  MediaContent,
  Media,
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
  PublishResult,
  HuntProgressStatus,
  Submission,
  StepProgress,
  Progress,
  LiveHunt,
  ReleaseResult,
  TakeOfflineResult,
  Collaborator,
  ShareResult,
  ReleaseHuntRequest,
  TakeOfflineRequest,
  ShareHuntRequest,
  UpdatePermissionRequest,
  SortOrder,
  HuntSortField,
  AssetSortField,
  PaginationQueryParams,
  HuntQueryParams,
  AssetQueryParams,
  PaginationMeta,
  PaginatedHuntsResponse,
  PaginatedAssetsResponse,
};

const endpoints = makeApi([]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
