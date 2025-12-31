import { z } from 'zod';
import { Clue } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

export const ClueFormSchema = Clue.extend({
  title: z.string().min(1, errorMessage('Title').required),
});
