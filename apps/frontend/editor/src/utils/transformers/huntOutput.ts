import { Hunt, Step, Quiz, OptionType, Location, Media } from '@hunthub/shared';
import { HuntFormData, StepFormData, QuizFormData, LocationFormData } from '@/types/editor';
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
 * For 'input' type: strips options and targetId, keeps target object as-is
 * For 'choice' type: strips options and targetId, derives target from option matching targetId
 */
const transformQuizForApi = (quizForm?: QuizFormData): Quiz | undefined => {
  if (!quizForm) {
    return undefined;
  }

  const { options, targetId, ...rest } = quizForm;

  if (quizForm.type === OptionType.Input) {
    return rest;
  }

  if (!options?.length) {
    return rest;
  }

  const targetOption = options.find((o) => o.id === targetId);

  if (!targetOption && quizForm.type === OptionType.Choice) {
    throw new Error('Target option must be selected for choice-type quiz');
  }

  const distractorOptions = options.filter((o) => o.id !== targetId);

  return {
    ...rest,
    target: targetOption ? { id: targetOption.id, text: targetOption.text } : undefined,
    distractors: distractorOptions.map((d) => ({ id: d.id, text: d.text })),
    displayOrder: options.map((o) => o.id),
  };
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
