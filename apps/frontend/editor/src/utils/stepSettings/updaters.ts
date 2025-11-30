import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { LOCATION_DEFAULTS, HINT_DEFAULTS, TIME_LIMIT_DEFAULTS, MAX_ATTEMPTS_DEFAULTS } from '@/utils';

type SetValue = UseFormSetValue<FieldValues>;

export const enableLocation = (setValue: SetValue, basePath: string) => {
  setValue(`${basePath}.lat`, LOCATION_DEFAULTS.enabled.lat, { shouldDirty: true });
  setValue(`${basePath}.lng`, LOCATION_DEFAULTS.enabled.lng, { shouldDirty: true });
  setValue(`${basePath}.radius`, LOCATION_DEFAULTS.enabled.radius, { shouldDirty: true });
};

export const disableLocation = (setValue: SetValue, basePath: string) => {
  setValue(`${basePath}.lat`, LOCATION_DEFAULTS.disabled.lat, { shouldDirty: true });
  setValue(`${basePath}.lng`, LOCATION_DEFAULTS.disabled.lng, { shouldDirty: true });
  setValue(`${basePath}.radius`, LOCATION_DEFAULTS.disabled.radius, { shouldDirty: true });
};

export const enableHint = (setValue: SetValue, path: string) => {
  setValue(path, HINT_DEFAULTS.enabled, { shouldDirty: true });
};

export const disableHint = (setValue: SetValue, path: string) => {
  setValue(path, HINT_DEFAULTS.disabled, { shouldDirty: true });
};

export const enableTimeLimit = (setValue: SetValue, path: string) => {
  setValue(path, TIME_LIMIT_DEFAULTS.enabled, { shouldDirty: true });
};

export const disableTimeLimit = (setValue: SetValue, path: string) => {
  setValue(path, TIME_LIMIT_DEFAULTS.disabled, { shouldDirty: true });
};

export const enableMaxAttempts = (setValue: SetValue, path: string) => {
  setValue(path, MAX_ATTEMPTS_DEFAULTS.enabled, { shouldDirty: true });
};

export const disableMaxAttempts = (setValue: SetValue, path: string) => {
  setValue(path, MAX_ATTEMPTS_DEFAULTS.disabled, { shouldDirty: true });
};
