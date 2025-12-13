import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { HINT_DEFAULTS, TIME_LIMIT_DEFAULTS, MAX_ATTEMPTS_DEFAULTS } from '@/utils';
import { DEFAULT_RADIUS, DEFAULT_MAP_CENTER } from '@/config/google-maps';

type SetValue = UseFormSetValue<FieldValues>;

export const enableLocation = async (setValue: SetValue, basePath: string) => {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    });

    setValue(`${basePath}.lat`, position.coords.latitude, { shouldDirty: true });
    setValue(`${basePath}.lng`, position.coords.longitude, { shouldDirty: true });
    setValue(`${basePath}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
    setValue(`${basePath}.address`, null, { shouldDirty: true });
  } catch {
    setValue(`${basePath}.lat`, DEFAULT_MAP_CENTER.lat, { shouldDirty: true });
    setValue(`${basePath}.lng`, DEFAULT_MAP_CENTER.lng, { shouldDirty: true });
    setValue(`${basePath}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
    setValue(`${basePath}.address`, null, { shouldDirty: true });
  }
};

export const disableLocation = (setValue: SetValue, basePath: string) => {
  setValue(basePath, null, { shouldDirty: true });
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
