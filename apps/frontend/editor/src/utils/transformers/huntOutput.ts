import { Hunt, Step } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';

/**
 * FORM → API
 * Prepare HuntFormData for submission to backend
 *
 * Removes:
 * - _id from each step (RHF tracking ID, not for API)
 * - Readonly/computed fields that backend doesn't accept
 */
export const prepareHuntForSave = (huntFormData: HuntFormData): Hunt => {
  const steps: Step[] = huntFormData.steps.map(({ _id, ...step }) => step as Step);

  const {
    createdAt,
    isLive,
    releasedAt,
    ...huntData
  } = huntFormData as any;

  return {
    ...huntData,
    steps,
  } as Hunt;
};
