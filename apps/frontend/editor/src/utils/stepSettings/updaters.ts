import { FieldValues, UseFormResetField } from 'react-hook-form';
import { LOCATION_DEFAULTS, HINT_DEFAULTS, TIME_LIMIT_DEFAULTS, MAX_ATTEMPTS_DEFAULTS } from '@/utils';

type ResetField = UseFormResetField<FieldValues>;

export const enableLocation = (resetField: ResetField, basePath: string) => {
  resetField(`${basePath}.lat`, { defaultValue: LOCATION_DEFAULTS.enabled.lat });
  resetField(`${basePath}.lng`, { defaultValue: LOCATION_DEFAULTS.enabled.lng });
  resetField(`${basePath}.radius`, { defaultValue: LOCATION_DEFAULTS.enabled.radius });
};

export const disableLocation = (resetField: ResetField, basePath: string) => {
  resetField(`${basePath}.lat`, { defaultValue: LOCATION_DEFAULTS.disabled.lat });
  resetField(`${basePath}.lng`, { defaultValue: LOCATION_DEFAULTS.disabled.lng });
  resetField(`${basePath}.radius`, { defaultValue: LOCATION_DEFAULTS.disabled.radius });
};

export const enableHint = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: HINT_DEFAULTS.enabled });
};

export const disableHint = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: HINT_DEFAULTS.disabled });
};

export const enableTimeLimit = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: TIME_LIMIT_DEFAULTS.enabled });
};

export const disableTimeLimit = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: TIME_LIMIT_DEFAULTS.disabled });
};

export const enableMaxAttempts = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: MAX_ATTEMPTS_DEFAULTS.enabled });
};

export const disableMaxAttempts = (resetField: ResetField, path: string) => {
  resetField(path, { defaultValue: MAX_ATTEMPTS_DEFAULTS.disabled });
};
