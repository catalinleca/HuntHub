import { Step, Hunt, Location, Quiz, Challenge, Media } from '@hunthub/shared';

/**
 * Generic type that adds a form key to any type.
 * The formKey field is for React Hook Form's useFieldArray and UI selection.
 * It is stable for the edit session and never sent to the API.
 */
export type WithFormKey<T> = T & {
  formKey: string;
};

/**
 * Location for form
 * - lat/lng can be null when location is enabled but not yet selected
 * - radius/address populated when location is picked
 */
export type LocationFormData = {
  lat: number | null;
  lng: number | null;
  radius: number | null;
  address: string | null;
};

/**
 * Form data for HuntDialog (create/edit basic hunt metadata)
 * Simpler than HuntFormData - no steps, just basic fields
 */
export type HuntDialogFormData = {
  name: string;
  description: string;
  startLocation: LocationFormData;
  coverImage: Media | null;
};

export type QuizOptionFormData = WithFormKey<{
  id: string;
  text: string;
}>;

/**
 * Quiz form model = API model + options[] + targetId
 * options[] exists ONLY for editing convenience when type='choice'
 * targetId points to the correct option (single source of truth)
 * On save, transforms split options back to target + distractors
 */
export type QuizFormData = Quiz & {
  options?: QuizOptionFormData[];
  targetId?: string;
};

/**
 * Challenge for form - uses QuizFormData instead of Quiz
 */
export type ChallengeFormData = Omit<Challenge, 'quiz'> & {
  quiz?: QuizFormData;
};

/**
 * Step data for form - keeps ALL Step fields + adds formKey for RHF tracking
 * huntId is required (we know it from the parent Hunt)
 * stepId is optional (assigned by backend on save)
 *
 * Settings are explicitly nullable for RHF:
 * - null = setting disabled (not sent to API)
 * - non-null = setting enabled (required to fill)
 */
export type StepFormData = WithFormKey<
  Omit<Step, 'stepId' | 'requiredLocation' | 'hint' | 'timeLimit' | 'maxAttempts' | 'challenge'> & {
    stepId?: number; // Optional - assigned by backend when step is saved
    challenge: ChallengeFormData; // Use form version with QuizFormData
    // Settings - null means disabled
    requiredLocation: LocationFormData | null;
    hint: string | null;
    timeLimit: number | null;
    maxAttempts: number | null;
  }
>;

/**
 * Hunt data for form - keeps ALL Hunt fields, but steps have formKey added
 * Matches API data exactly, plus formKey on each step for RHF useFieldArray
 */
export type HuntFormData = Omit<Hunt, 'steps'> & {
  steps: StepFormData[];
};

/**
 * Root form data structure for the editor
 * This is what useForm<EditorFormData>() expects
 */
export type EditorFormData = {
  hunt: HuntFormData;
};

export type { Hunt, Step, Location, Quiz };
