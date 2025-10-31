import { ValidationError } from '@/shared/errors';

export const parseNumericId = (id: string): number => {
  const parsed = parseInt(id, 10);

  if (isNaN(parsed)) {
    throw new ValidationError('Invalid ID', []);
  }

  return parsed;
};
