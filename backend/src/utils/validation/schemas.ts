// Generated by ts-to-zod
import { z } from 'zod';
import { HuntStatus, HuntVisibility, HuntAccessType } from './../../openapi/HuntHubTypes';

export const huntStatusSchema = z.nativeEnum(HuntStatus);

export const huntVisibilitySchema = z.nativeEnum(HuntVisibility);

export const huntLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number(),
});

export const huntAccessTypeSchema = z.nativeEnum(HuntAccessType);

export const huntSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isPublished: z.boolean(),
  currentVersion: z.number(),
  status: huntStatusSchema,
  visibility: huntVisibilitySchema.optional(),
  startLocation: huntLocationSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userSchema = z.object({
  firebaseUid: z.string(),
  email: z.string(),
  fistName: z.string().optional(),
  lastName: z.string(),
  displayName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const huntAccessSchema = z.object({
  huntId: z.string(),
  userId: z.string(),
  accessType: huntAccessTypeSchema,
  sharedAt: z.string().datetime(),
});
