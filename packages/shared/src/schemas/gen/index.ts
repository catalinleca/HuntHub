import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

export const HuntStatus = z.enum(['draft', 'published']);
export const HuntPermission = z.enum(['view', 'admin', 'owner']);
export const HuntAccessMode = z.enum(['open', 'invite_only']);
export const Location = z
  .object({ lat: z.number(), lng: z.number(), radius: z.number(), address: z.string().nullish() })
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
  .object({ asset: AssetSnapshot, title: z.string().nullish(), alt: z.string().nullish() })
  .strict();
export const AudioMedia = z
  .object({ asset: AssetSnapshot, title: z.string().nullish(), transcript: z.string().nullish() })
  .strict();
export const VideoMedia = z
  .object({ asset: AssetSnapshot, title: z.string().nullish(), alt: z.string().nullish() })
  .strict();
export const ImageAudioMedia = z.object({ image: ImageMedia, audio: AudioMedia, title: z.string().nullish() }).strict();
export const MediaContent = z
  .object({
    image: ImageMedia.nullable(),
    audio: AudioMedia.nullable(),
    video: VideoMedia.nullable(),
    imageAudio: ImageAudioMedia.nullable(),
  })
  .partial()
  .strict();
export const Media = z.object({ type: MediaType, content: MediaContent }).strict();
export const Clue = z.object({ title: z.string().nullable(), description: z.string().nullable() }).partial().strict();
export const Option = z.object({ id: z.string(), text: z.string() }).strict();
export const QuizValidation = z
  .object({
    mode: ValidationMode.nullable(),
    caseSensitive: z.boolean().nullable().default(false),
    fuzzyThreshold: z.number().gte(1).lte(100).nullable().default(80),
    numericTolerance: z.number().gte(0).nullable(),
    acceptableAnswers: z.array(z.string()).nullable(),
  })
  .partial()
  .strict();
export const Quiz = z
  .object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    type: OptionType.nullable(),
    options: z.array(Option).nullable(),
    targetId: z.string().nullable(),
    expectedAnswer: z.string().nullable(),
    randomizeOrder: z.boolean().nullable(),
    validation: QuizValidation.nullable(),
  })
  .partial()
  .strict();
export const Mission = z
  .object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    referenceAssetIds: z.array(z.number().int()).nullable(),
    targetLocation: Location.nullable(),
    type: MissionType.nullable(),
    aiInstructions: z.string().nullable(),
    aiModel: z.enum(['gpt-4-vision', 'claude-vision', 'gemini-vision']).nullable(),
  })
  .partial()
  .strict();
export const Task = z
  .object({
    title: z.string().nullish(),
    instructions: z.string(),
    aiInstructions: z.string().nullish(),
    aiModel: z.enum(['gpt-4', 'claude', 'gemini']).nullish(),
  })
  .strict();
export const Challenge = z
  .object({ clue: Clue.nullable(), quiz: Quiz.nullable(), mission: Mission.nullable(), task: Task.nullable() })
  .partial()
  .strict();
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
    metadata: z.object({}).partial().strict().passthrough().nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
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
    description: z.string().nullish(),
    status: HuntStatus,
    startLocation: Location.nullish(),
    stepOrder: z.array(z.number().int()),
    steps: z.array(Step).nullish(),
    isPublished: z.boolean(),
    publishedAt: z.string().datetime({ offset: true }).nullish(),
    publishedBy: z.string().nullish(),
    isLive: z.boolean(),
    releasedAt: z.string().datetime({ offset: true }).nullish(),
    releasedBy: z.string().nullish(),
    playSlug: z.string(),
    accessMode: HuntAccessMode,
    permission: z.enum(['owner', 'admin', 'view']).nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
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
    description: z.string().max(500).nullish(),
    startLocation: Location.nullish(),
    steps: z.array(StepCreate).nullish(),
    coverImage: Media.nullish(),
  })
  .strict();
export const HuntUpdate = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    startLocation: Location.nullable(),
    updatedAt: z.string().datetime({ offset: true }).nullable(),
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
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    displayName: z.string().nullish(),
    profilePicture: z.string().nullish(),
    bio: z.string().nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
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
export const StorageLocation = z.object({ bucket: z.string(), path: z.string() }).strict();
export const Asset = z
  .object({
    id: z.string(),
    assetId: z.number().int(),
    ownerId: z.string(),
    url: z.string(),
    mimeType: MimeTypes,
    originalFilename: z.string().nullish(),
    size: z.number().nullish(),
    thumbnailUrl: z.string().nullish(),
    storageLocation: StorageLocation.nullish(),
    usage: z.array(AssetUsage).nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
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
    score: z.number().nullish(),
    feedback: z.string().nullish(),
    metadata: z.object({}).partial().strict().passthrough().nullish(),
  })
  .strict();
export const StepProgress = z
  .object({
    stepId: z.number().int(),
    attempts: z.number().int().optional().default(0),
    completed: z.boolean().optional().default(false),
    responses: z.array(Submission).nullish(),
    startedAt: z.string().datetime({ offset: true }).nullish(),
    completedAt: z.string().datetime({ offset: true }).nullish(),
    duration: z.number().nullish(),
  })
  .strict();
export const Progress = z
  .object({
    id: z.string(),
    userId: z.string().nullish(),
    sessionId: z.string(),
    isAnonymous: z.boolean(),
    huntId: z.number().int(),
    version: z.number().int(),
    status: HuntProgressStatus,
    startedAt: z.string().datetime({ offset: true }),
    completedAt: z.string().datetime({ offset: true }).nullish(),
    duration: z.number().nullish(),
    currentStepId: z.number().int(),
    steps: z.array(StepProgress).nullish(),
    playerName: z.string().min(1).max(50),
    rating: z.number().gte(0).lte(5).nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
  })
  .strict();
export const LiveHunt = z
  .object({
    huntId: z.number().int(),
    huntVersion: z.number().int(),
    activePlayerCount: z.number().int().default(0),
    lastPlayedAt: z.string().datetime({ offset: true }).nullish(),
    createdAt: z.string().datetime({ offset: true }).nullish(),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
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
export const VersionHistoryItem = z
  .object({
    version: z.number().int(),
    publishedAt: z.string().datetime({ offset: true }),
    stepCount: z.number().int(),
  })
  .strict();
export const VersionHistoryResponse = z.object({ versions: z.array(VersionHistoryItem) }).strict();
export const Collaborator = z
  .object({
    userId: z.string(),
    displayName: z.string(),
    email: z.string().email().nullish(),
    profilePicture: z.string().nullish(),
    permission: z.enum(['admin', 'view']),
    sharedAt: z.string().datetime({ offset: true }),
    sharedBy: z.string().nullish(),
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
  .object({ version: z.number().int().nullable(), currentLiveVersion: z.number().int().nullable() })
  .partial()
  .strict();
export const TakeOfflineRequest = z.object({ currentLiveVersion: z.number().int().nullable() }).strict();
export const CloneHuntRequest = z.object({ version: z.number().int().nullable() }).partial().strict();
export const ShareHuntRequest = z.object({ email: z.string().email(), permission: z.enum(['admin', 'view']) }).strict();
export const UpdatePermissionRequest = z.object({ permission: z.enum(['admin', 'view']) }).strict();
export const PlayerInvitation = z
  .object({
    huntId: z.number().int(),
    email: z.string().email(),
    invitedBy: z.string(),
    invitedAt: z.string().datetime({ offset: true }),
  })
  .strict();
export const CreatePlayerInvitationRequest = z.object({ email: z.string().email() }).strict();
export const UpdateAccessModeRequest = z.object({ accessMode: HuntAccessMode }).strict();
export const PreviewLinkResponse = z.object({ previewUrl: z.string(), expiresIn: z.number().int() }).strict();
export const HuntMetaPF = z
  .object({
    huntId: z.number().int(),
    name: z.string(),
    description: z.string().nullish(),
    totalSteps: z.number().int(),
    coverImage: Media.nullish(),
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
    completedAt: z.string().datetime({ offset: true }).nullish(),
  })
  .strict();
export const PreviewSessionResponse = SessionResponse.and(
  z
    .object({ isPreview: z.literal(true), stepOrder: z.array(z.number().int()) })
    .strict()
    .passthrough(),
);
export const NavigateRequest = z.object({ stepId: z.number().int().gte(1) }).strict();
export const NavigateResponse = z
  .object({ currentStepId: z.number().int(), currentStepIndex: z.number().int() })
  .strict();
export const ResetPlayLinkResponse = z.object({ playSlug: z.string() }).strict();
export const CluePF = z.object({ title: z.string(), description: z.string() }).strict();
export const QuizPF = z
  .object({
    title: z.string(),
    description: z.string(),
    type: OptionType,
    options: z.array(Option).nullish(),
    randomizeOrder: z.boolean().nullish(),
  })
  .strict();
export const MissionPF = z
  .object({
    title: z.string(),
    description: z.string(),
    type: MissionType,
    referenceAssetIds: z.array(z.number().int()).nullish(),
  })
  .strict();
export const TaskPF = z.object({ title: z.string(), instructions: z.string() }).strict();
export const ChallengePF = z
  .object({ clue: CluePF.nullable(), quiz: QuizPF.nullable(), mission: MissionPF.nullable(), task: TaskPF.nullable() })
  .partial()
  .strict();
export const StepPF = z
  .object({
    stepId: z.number().int(),
    type: ChallengeType,
    challenge: ChallengePF,
    media: Media.nullish(),
    timeLimit: z.number().int().nullish(),
    maxAttempts: z.number().int().nullish(),
    hasHint: z.boolean(),
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
    clue: ClueAnswerPayload.nullable(),
    quizChoice: QuizChoicePayload.nullable(),
    quizInput: QuizInputPayload.nullable(),
    missionLocation: MissionLocationPayload.nullable(),
    missionMedia: MissionMediaPayload.nullable(),
    task: TaskAnswerPayload.nullable(),
  })
  .partial()
  .strict();
export const StartSessionRequest = z
  .object({ playSlug: z.string().min(1), playerName: z.string().min(1).max(50), email: z.string().email().nullish() })
  .strict();
export const ValidateAnswerRequest = z.object({ answerType: AnswerType, payload: AnswerPayload }).strict();
export const ValidateAnswerResponse = z
  .object({
    correct: z.boolean(),
    feedback: z.string().nullish(),
    isComplete: z.boolean().nullish(),
    attempts: z.number().int(),
    maxAttempts: z.number().int().nullish(),
    expired: z.boolean().nullish(),
    exhausted: z.boolean().nullish(),
  })
  .strict();
export const HintResponse = z
  .object({ hint: z.string(), hintsUsed: z.number().int(), maxHints: z.number().int() })
  .strict();
export const HateoasLink = z.object({ href: z.string() }).strict();
export const StepLinks = z.object({ self: HateoasLink, next: HateoasLink.nullish(), validate: HateoasLink }).strict();
export const ValidateAnswerLinks = z.object({ currentStep: HateoasLink, nextStep: HateoasLink.nullish() }).strict();
export const StepResponse = z
  .object({
    step: StepPF,
    stepIndex: z.number().int(),
    totalSteps: z.number().int(),
    attempts: z.number().int(),
    maxAttempts: z.number().int().nullable(),
    hintsUsed: z.number().int(),
    maxHints: z.number().int(),
    startedAt: z.string().datetime({ offset: true }).nullable(),
    _links: StepLinks,
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
export const GenerateHuntStyle = z.enum(['educational', 'adventure', 'team-building', 'family-friendly']);
export const GenerateHuntRequest = z
  .object({ prompt: z.string().min(10).max(500), style: GenerateHuntStyle.nullish() })
  .strict();
export const GenerationMetadata = z
  .object({ model: z.string(), processingTimeMs: z.number().int(), prompt: z.string() })
  .strict();
export const GenerateHuntResponse = z.object({ hunt: Hunt, generationMetadata: GenerationMetadata }).strict();

export const schemas: Record<string, z.ZodTypeAny> = {
  HuntStatus,
  HuntPermission,
  HuntAccessMode,
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
  VersionHistoryItem,
  VersionHistoryResponse,
  Collaborator,
  ShareResult,
  ReleaseHuntRequest,
  TakeOfflineRequest,
  CloneHuntRequest,
  ShareHuntRequest,
  UpdatePermissionRequest,
  PlayerInvitation,
  CreatePlayerInvitationRequest,
  UpdateAccessModeRequest,
  PreviewLinkResponse,
  HuntMetaPF,
  SessionResponse,
  PreviewSessionResponse,
  NavigateRequest,
  NavigateResponse,
  ResetPlayLinkResponse,
  CluePF,
  QuizPF,
  MissionPF,
  TaskPF,
  ChallengePF,
  StepPF,
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
  SortOrder,
  HuntSortField,
  AssetSortField,
  PaginationQueryParams,
  HuntQueryParams,
  AssetQueryParams,
  PaginationMeta,
  PaginatedHuntsResponse,
  PaginatedAssetsResponse,
  GenerateHuntStyle,
  GenerateHuntRequest,
  GenerationMetadata,
  GenerateHuntResponse,
};

const endpoints = makeApi([]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
