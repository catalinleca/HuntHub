import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hunt } from '@hunthub/shared/schemas';
import { StepFormSchema } from './StepFormSchema';
import { errorMessage } from '../messages';

export const HuntFormDataSchema = Hunt.extend({
  name: z.string().min(1, errorMessage('Hunt name').required),
  steps: z.array(StepFormSchema),
});

export const HuntFormSchema = z.object({
  hunt: HuntFormDataSchema,
});

export const HuntFormResolver = zodResolver(HuntFormSchema);
