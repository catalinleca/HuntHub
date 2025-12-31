import { z } from 'zod';
import { Mission, MissionType } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

export const MissionFormSchema = Mission.extend({
  title: z.string().min(1, errorMessage('Title').required),
  type: MissionType,
});
