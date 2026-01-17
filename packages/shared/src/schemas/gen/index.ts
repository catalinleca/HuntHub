import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

export const HuntStatus = z.enum(['draft', 'published']);
export const Location = z
  .object({ lat: z.number(), lng: z.number(), radius: z.number(), address: z.string().optional() })
  .strict();
export const HuntAccessType = z.enum(['creator', 'viewer', 'editor']);
export const ChallengeType = z.enum(['clue', 'quiz', 'mission', 'task']);
export const OptionType = z.enum(['choice', 'input']);
export const MissionType = z.enum(['upload-media', 'match-location', 'upload-audio']);
export const ValidationMode = z.enum(['exact', 'fuzzy', 'contains', 'numeric-range']);
export const MimeTypes = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
]);
export const MediaType = z.enum(['image', 'audio', 'video', 'image-audio']);
export const AssetSnapshot = z
  .object({ id: z.number().int(), url: z.string(), name: z.string(), sizeBytes: z.number().int() })
  .strict();
export const ImageMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), alt: z.string().optional() })
  .strict();
export const AudioMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), transcript: z.string().optional() })
  .strict();
export const VideoMedia = z
  .object({ asset: AssetSnapshot, title: z.string().optional(), alt: z.string().optional() })
  .strict();
export const ImageAudioMedia = z
  .object({ image: ImageMedia, audio: AudioMedia, title: z.string().optional() })
  .strict();
export const MediaContent = z
  .object({ image: ImageMedia, audio: AudioMedia, video: VideoMedia, imageAudio: ImageAudioMedia })
  .partial()
  .strict();
export const Media = z.object({ type: MediaType, content: MediaContent }).strict();
export const Clue = z.object({ title: z.string(), description: z.string() }).partial().strict();
export const Option = z.object({ id: z.string(), text: z.string() }).strict();
export const QuizValidation = z
  .object({
    mode: ValidationMode,
    caseSensitive: z.boolean().default(false),
    fuzzyThreshold: z.number().gte(1).lte(100).default(80),
    numericTolerance: z.number().gte(0),
    acceptableAnswers: z.array(z.string()),
  })
  .partial()
  .strict();
export const Quiz = z
  .object({
    title: z.string(),
    description: z.string(),
    type: OptionType,
    options: z.array(Option),
    targetId: z.string(),
    expectedAnswer: z.string(),
    randomizeOrder: z.boolean(),
    validation: QuizValidation,
  })
  .partial()
  .strict();
export const Mission = z
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
export const Task = z
  .object({
    title: z.string().optional(),
    instructions: z.string(),
    aiInstructions: z.string().optional(),
    aiModel: z.enum(['gpt-4', 'claude', 'gemini']).optional(),
  })
  .strict();
export const Challenge = z.object({ clue: Clue, quiz: Quiz, mission: Mission, task: Task }).partial().strict();
export const Step = z
  .object({
    stepId: z.number().int(),
    huntId: z.number().int(),
    type: ChallengeType,
    challenge: Challenge,
    media: Media.nullish(),
    requiredLocation: Location.nullish(),
    hint: z.string().nullish(),
    timeLimit: z.number().nullish(),
    maxAttempts: z.number().nullish(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export const Hunt = z
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
    publishedAt: z.string().datetime({ offset: true }).nullish(),
    publishedBy: z.string().nullish(),
    isLive: z.boolean().optional(),
    releasedAt: z.string().datetime({ offset: true }).nullish(),
    releasedBy: z.string().nullish(),
    permission: z.enum(['owner', 'admin', 'view']).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
    coverImage: Media.nullish(),
  })
  .strict();
export const StepCreate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    media: Media.nullish(),
    requiredLocation: Location.nullish(),
    hint: z.string().nullish(),
    timeLimit: z.number().nullish(),
    maxAttempts: z.number().nullish(),
  })
  .strict();
export const HuntCreate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    startLocation: Location.optional(),
    steps: z.array(StepCreate).optional(),
    coverImage: Media.nullish(),
  })
  .strict();
export const HuntUpdate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    startLocation: Location,
    updatedAt: z.string().datetime({ offset: true }),
    coverImage: Media.nullable(),
  })
  .partial()
  .strict();
export const StepUpdate = z
  .object({
    type: ChallengeType,
    challenge: Challenge,
    media: Media.nullish(),
    requiredLocation: Location.nullish(),
    hint: z.string().nullish(),
    timeLimit: z.number().nullish(),
    maxAttempts: z.number().nullish(),
  })
  .strict();
export const User = z
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
export const HuntAccess = z
  .object({
    huntId: z.string(),
    userId: z.string(),
    accessType: HuntAccessType,
    sharedAt: z.string().datetime({ offset: true }),
  })
  .strict();
export const AssetUsage = z.object({ model: z.string(), field: z.string(), documentId: z.string() }).strict();
export const StorageLocation = z.object({ bucket: z.string(), path: z.string() }).partial().strict();
export const Asset = z
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
export const AssetCreate = z
  .object({
    name: z.string().min(1),
    mime: z.string().min(1),
    sizeBytes: z.number().gte(1),
    url: z.string().min(1),
    s3Key: z.string().min(1),
  })
  .strict();
export const PublishResult = z
  .object({
    publishedVersion: z.number().int(),
    newDraftVersion: z.number().int(),
    publishedAt: z.string().datetime({ offset: true }),
  })
  .strict();
export const HuntProgressStatus = z.enum(['in_progress', 'completed', 'abandoned']);
export const Submission = z
  .object({
    timestamp: z.string().datetime({ offset: true }),
    content: z.unknown(),
    isCorrect: z.boolean(),
    score: z.number().optional(),
    feedback: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
export const StepProgress = z
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
export const Progress = z
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
export const LiveHunt = z
  .object({
    huntId: z.number().int(),
    huntVersion: z.number().int(),
    activePlayerCount: z.number().int().default(0),
    lastPlayedAt: z.string().datetime({ offset: true }).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export const ReleaseResult = z
  .object({
    huntId: z.number().int(),
    liveVersion: z.number().int(),
    previousLiveVersion: z.number().int().nullable(),
    releasedAt: z.string().datetime({ offset: true }),
    releasedBy: z.string(),
  })
  .strict();
export const TakeOfflineResult = z
  .object({
    huntId: z.number().int(),
    previousLiveVersion: z.number().int(),
    takenOfflineAt: z.string().datetime({ offset: true }),
  })
  .strict();
export const Collaborator = z
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
export const ShareResult = z
  .object({
    huntId: z.number().int(),
    sharedWithId: z.string(),
    permission: z.enum(['admin', 'view']),
    sharedAt: z.string().datetime({ offset: true }),
    sharedBy: z.string(),
  })
  .strict();
export const ReleaseHuntRequest = z
  .object({ version: z.number().int(), currentLiveVersion: z.number().int().nullable() })
  .partial()
  .strict();
export const TakeOfflineRequest = z.object({ currentLiveVersion: z.number().int().nullable() }).strict();
export const ShareHuntRequest = z.object({ email: z.string().email(), permission: z.enum(['admin', 'view']) }).strict();
export const UpdatePermissionRequest = z.object({ permission: z.enum(['admin', 'view']) }).strict();
export const CluePF = z.object({ title: z.string(), description: z.string() }).strict();
export const QuizPF = z
  .object({
    title: z.string(),
    description: z.string(),
    type: OptionType,
    options: z.array(Option).optional(),
    randomizeOrder: z.boolean().optional(),
  })
  .strict();
export const MissionPF = z
  .object({
    title: z.string(),
    description: z.string(),
    type: MissionType,
    referenceAssetIds: z.array(z.number().int()).optional(),
  })
  .strict();
export const TaskPF = z.object({ title: z.string(), instructions: z.string() }).strict();
export const ChallengePF = z
  .object({ clue: CluePF, quiz: QuizPF, mission: MissionPF, task: TaskPF })
  .partial()
  .strict();
export const StepPF = z
  .object({
    stepId: z.number().int(),
    type: ChallengeType,
    challenge: ChallengePF,
    media: Media.optional(),
    timeLimit: z.number().int().nullish(),
    maxAttempts: z.number().int().nullish(),
    hasHint: z.boolean(),
  })
  .strict();
export const HuntMetaPF = z
  .object({
    huntId: z.number().int(),
    name: z.string(),
    description: z.string().optional(),
    totalSteps: z.number().int(),
    coverImage: Media.nullish(),
  })
  .strict();
export const AnswerType = z.enum(['clue', 'quiz-choice', 'quiz-input', 'mission-location', 'mission-media', 'task']);
export const ClueAnswerPayload = z.object({}).partial().strict();
export const QuizChoicePayload = z.object({ optionId: z.string().min(1) }).strict();
export const QuizInputPayload = z.object({ answer: z.string().min(1).max(500) }).strict();
export const MissionLocationPayload = z
  .object({ lat: z.number().gte(-90).lte(90), lng: z.number().gte(-180).lte(180) })
  .strict();
export const MissionMediaPayload = z.object({ assetId: z.number().int().gte(1) }).strict();
export const TaskAnswerPayload = z.object({ response: z.string().min(1).max(500) }).strict();
export const AnswerPayload = z
  .object({
    clue: ClueAnswerPayload,
    quizChoice: QuizChoicePayload,
    quizInput: QuizInputPayload,
    missionLocation: MissionLocationPayload,
    missionMedia: MissionMediaPayload,
    task: TaskAnswerPayload,
  })
  .partial()
  .strict();
export const StartSessionRequest = z
  .object({ playerName: z.string().min(1).max(50), email: z.string().email().optional() })
  .strict();
export const ValidateAnswerRequest = z.object({ answerType: AnswerType, payload: AnswerPayload }).strict();
export const ValidateAnswerResponse = z
  .object({
    correct: z.boolean(),
    feedback: z.string().optional(),
    isComplete: z.boolean().optional(),
    attempts: z.number().int(),
    maxAttempts: z.number().int().optional(),
    expired: z.boolean().optional(),
    exhausted: z.boolean().optional(),
  })
  .strict();
export const HintResponse = z
  .object({ hint: z.string(), hintsUsed: z.number().int(), maxHints: z.number().int() })
  .strict();
export const HateoasLink = z.object({ href: z.string() }).strict();
export const StepLinks = z.object({ self: HateoasLink, next: HateoasLink.optional(), validate: HateoasLink }).strict();
export const ValidateAnswerLinks = z.object({ currentStep: HateoasLink, nextStep: HateoasLink.optional() }).strict();
export const StepResponse = z
  .object({
    step: StepPF,
    stepIndex: z.number().int(),
    totalSteps: z.number().int(),
    attempts: z.number().int(),
    maxAttempts: z.number().int().nullable(),
    hintsUsed: z.number().int(),
    maxHints: z.number().int(),
    _links: StepLinks,
  })
  .strict();
export const SessionResponse = z
  .object({
    sessionId: z.string().uuid(),
    hunt: HuntMetaPF,
    status: z.string(),
    currentStepIndex: z.number().int(),
    currentStepId: z.number().int().nullish(),
    totalSteps: z.number().int(),
    startedAt: z.string().datetime({ offset: true }),
    completedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export const SortOrder = z.enum(['asc', 'desc']);
export const HuntSortField = z.enum(['createdAt', 'updatedAt']);
export const AssetSortField = z.enum(['createdAt', 'originalFilename', 'size']);
export const PaginationQueryParams = z
  .object({
    page: z.number().int().gte(1).default(1),
    limit: z.number().int().gte(1).lte(100).default(10),
    sortOrder: SortOrder,
  })
  .partial()
  .strict();
export const HuntQueryParams = PaginationQueryParams.and(z.object({ sortBy: HuntSortField }).partial().strict());
export const AssetQueryParams = PaginationQueryParams.and(
  z.object({ sortBy: AssetSortField, mimeType: MimeTypes }).partial().strict(),
);
export const PaginationMeta = z
  .object({
    total: z.number().int(),
    page: z.number().int().gte(1),
    limit: z.number().int().gte(1),
    totalPages: z.number().int().gte(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  })
  .strict();
export const PaginatedHuntsResponse = z.object({ data: z.array(Hunt), pagination: PaginationMeta }).strict();
export const PaginatedAssetsResponse = z.object({ data: z.array(Asset), pagination: PaginationMeta }).strict();

export const schemas: Record<string, z.ZodTypeAny> = {
  HuntStatus,
  Location,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,
  ValidationMode,
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
  CluePF,
  QuizPF,
  MissionPF,
  TaskPF,
  ChallengePF,
  StepPF,
  HuntMetaPF,
  AnswerType,
  ClueAnswerPayload,
  QuizChoicePayload,
  QuizInputPayload,
  MissionLocationPayload,
  MissionMediaPayload,
  TaskAnswerPayload,
  AnswerPayload,
  StartSessionRequest,
  ValidateAnswerRequest,
  ValidateAnswerResponse,
  HintResponse,
  HateoasLink,
  StepLinks,
  ValidateAnswerLinks,
  StepResponse,
  SessionResponse,
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
