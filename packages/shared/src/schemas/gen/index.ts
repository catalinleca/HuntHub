import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const HuntStatus = z.enum(['draft', 'published', 'archived']);
const Location = z.object({ lat: z.number(), lng: z.number(), radius: z.number() }).passthrough();
const HuntAccessType = z.enum(['creator', 'viewer', 'editor']);
const ChallengeType = z.enum(['clue', 'quiz', 'mission', 'task']);
const OptionType = z.enum(['choice', 'input']);
const MissionType = z.enum(['upload-media', 'match-location']);
const Clue = z.object({ title: z.string(), description: z.string() }).partial().passthrough();
const Option = z.object({ id: z.string(), text: z.string() }).passthrough();
const Quiz = z
  .object({
    title: z.string(),
    description: z.string(),
    target: Option,
    type: OptionType,
    distractors: z.array(Option),
  })
  .partial()
  .passthrough();
const Mission = z
  .object({
    title: z.string(),
    description: z.string(),
    targetAsset: z.string(),
    targetLocation: Location,
    type: MissionType,
  })
  .partial()
  .passthrough();
const Task = z.object({ title: z.string(), description: z.string(), target: z.string() }).partial().passthrough();
const Challenge = z.object({ clue: Clue, quiz: Quiz, mission: Mission, task: Task }).partial().passthrough();
const Step = z
  .object({
    id: z.string(),
    huntId: z.string().optional(),
    type: ChallengeType.optional(),
    challenge: Challenge,
    requiredLocation: Location.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const Hunt = z
  .object({
    id: z.string(),
    creatorId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    currentVersion: z.number().int(),
    status: HuntStatus,
    startLocation: Location.optional(),
    steps: z.array(Step).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const StepCreate = z
  .object({
    huntId: z.string().optional(),
    type: ChallengeType.optional(),
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

export const schemas = {
  HuntStatus,
  Location,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,
  Clue,
  Option,
  Quiz,
  Mission,
  Task,
  Challenge,
  Step,
  Hunt,
  StepCreate,
  HuntCreate,
  User,
  HuntAccess,
};

const endpoints = makeApi([]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
