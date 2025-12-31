import { z } from 'zod';
import { Task } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

export const TaskFormSchema = Task.extend({
  title: z.string().min(1, errorMessage('Title').required),
});
