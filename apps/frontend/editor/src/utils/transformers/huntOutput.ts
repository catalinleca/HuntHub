import { Hunt, Step, Quiz, Location, Media } from '@hunthub/shared';
import { HuntFormData, StepFormData, LocationFormData } from '@/types/editor';
import { MediaHelper } from '@/components/media/data/helper';

/**
 * Convert form LocationFormData (nullable fields) to API Location (required fields)
 * Returns undefined if location doesn't have valid coordinates
 */
const transformLocationForApi = (location: LocationFormData | null): Location | undefined => {
  if (!location || location.lat === null || location.lng === null || location.radius === null) {
    return undefined;
  }

  return {
    lat: location.lat,
    lng: location.lng,
    radius: location.radius,
    ...(location.address && { address: location.address }),
  };
};

/**
 * Strip invalid/empty media, pass through valid media as-is
 */
const cleanMediaForApi = (media?: Media | null): Media | undefined => {
  if (!media || !MediaHelper.isMediaValid(media)) {
    return undefined;
  }
  return media;
};

/**
 * Transform Quiz for API - pass through as-is.
 * All fields are optional in the schema, backend uses what it needs.
 */
const transformQuizForApi = (quiz?: Quiz): Quiz | undefined => {
  return quiz;
};

const transformChallengeForApi = (challenge: StepFormData['challenge']): Step['challenge'] => {
  return {
    ...challenge,
    quiz: transformQuizForApi(challenge.quiz),
  };
};

/**
 * Transform form step to API step:
 * - Strip formKey (client-side form key)
 * - Strip createdAt/updatedAt (server-managed)
 * - Convert null settings to undefined
 * - Clean location and media
 */
const transformStepForApi = (formStep: StepFormData): Step => {
  const {
    formKey: _formKey,
    challenge,
    requiredLocation,
    hint,
    timeLimit,
    maxAttempts,
    media,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = formStep;

  return {
    ...rest,
    challenge: transformChallengeForApi(challenge),
    ...(hint && { hint }),
    ...(timeLimit !== null && { timeLimit }),
    ...(maxAttempts !== null && { maxAttempts }),
    requiredLocation: transformLocationForApi(requiredLocation),
    media: cleanMediaForApi(media),
  } as Step;
};

/**
 * Transform hunt form data to API hunt:
 * - Strip computed/server-managed fields
 * - Clean coverImage
 * - Transform all steps
 */
export const prepareHuntForSave = (huntFormData: HuntFormData): Hunt => {
  const {
    steps: formSteps,
    coverImage,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    isLive: _isLive,
    releasedAt: _releasedAt,
    releasedBy: _releasedBy,
    publishedAt: _publishedAt,
    publishedBy: _publishedBy,
    ...huntData
  } = huntFormData;

  const steps = formSteps.map(transformStepForApi);

  return {
    ...huntData,
    steps,
    coverImage: cleanMediaForApi(coverImage),
  } as Hunt;
};
