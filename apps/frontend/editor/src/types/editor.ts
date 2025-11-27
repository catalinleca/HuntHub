import { Step, Hunt, Location } from '@hunthub/shared';

/**
 * Generic type that adds RHF internal tracking ID to any type.
 * The _id field is ONLY for React Hook Form's useFieldArray to track items.
 * It has nothing to do with the API or database.
 */
export type WithRHFInternalId<T> = T & {
  _id: string; // RHF useFieldArray tracking ID (UI-only, never sent to API)
};

/**
 * Step data for form - keeps ALL Step fields + adds _id for RHF tracking
 * huntId is required (we know it from the parent Hunt)
 * stepId is optional (assigned by backend on save)
 */
export type StepFormData = Omit<Step, 'stepId'> & {
  stepId?: number; // Optional - assigned by backend when step is saved
} & WithRHFInternalId<{}>;

/**
 * Hunt data for form - keeps ALL Hunt fields, but steps have _id added for RHF
 * Matches API data exactly, plus _id on each step for RHF useFieldArray
 */
export type HuntFormData = Omit<Hunt, 'steps'> & {
  steps: StepFormData[];
};

export type { Hunt, Step, Location };