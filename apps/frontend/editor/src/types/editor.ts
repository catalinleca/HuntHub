import { Step, Hunt, Location, Quiz, Challenge } from '@hunthub/shared';

/**
 * Generic type that adds RHF internal tracking ID to any type.
 * The _id field is ONLY for React Hook Form's useFieldArray to track items.
 * It has nothing to do with the API or database.
 */
export type WithRHFInternalId<T> = T & {
  _id: string; // RHF useFieldArray tracking ID (UI-only, never sent to API)
};

/**
 * Location for form - object always exists, leaves can be null (disabled state)
 * When all leaves are null = setting disabled
 * When all leaves are numbers = setting enabled
 * Invariant: updaters always set ALL fields together
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
};

export type QuizOptionFormData = WithRHFInternalId<{
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
 * Step data for form - keeps ALL Step fields + adds _id for RHF tracking
 * huntId is required (we know it from the parent Hunt)
 * stepId is optional (assigned by backend on save)
 *
 * Settings are explicitly nullable for RHF:
 * - null = setting disabled (not sent to API)
 * - non-null = setting enabled (required to fill)
 */
export type StepFormData = WithRHFInternalId<
  Omit<Step, 'stepId' | 'requiredLocation' | 'hint' | 'timeLimit' | 'maxAttempts' | 'challenge'> & {
    stepId?: number; // Optional - assigned by backend when step is saved
    challenge: ChallengeFormData; // Use form version with QuizFormData
    // Settings - null means disabled
    requiredLocation: LocationFormData;
    hint: string | null;
    timeLimit: number | null;
    maxAttempts: number | null;
  }
>;

/**
 * Hunt data for form - keeps ALL Hunt fields, but steps have _id added for RHF
 * Matches API data exactly, plus _id on each step for RHF useFieldArray
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
