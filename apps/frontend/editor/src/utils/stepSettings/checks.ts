import { LocationFormData } from '@/types/editor';

export const isLocationEnabled = (location: LocationFormData | null | undefined): boolean => {
  return location?.lat !== null && location?.lat !== undefined;
};

export const isHintEnabled = (hint: string | null | undefined): boolean => {
  return hint !== null && hint !== undefined;
};

export const isTimeLimitEnabled = (timeLimit: number | null | undefined): boolean => {
  return timeLimit !== null && timeLimit !== undefined;
};

export const isMaxAttemptsEnabled = (maxAttempts: number | null | undefined): boolean => {
  return maxAttempts !== null && maxAttempts !== undefined;
};
