// Location defaults: enabled uses null values, user picks location via map picker
export const LOCATION_DEFAULTS = {
  enabled: { lat: null, lng: null, radius: null, address: null },
  disabled: { lat: null, lng: null, radius: null, address: null },
} as const;

export const HINT_DEFAULTS = {
  enabled: '',
  disabled: null,
} as const;

export const TIME_LIMIT_DEFAULTS = {
  enabled: 60,
  disabled: null,
} as const;

export const MAX_ATTEMPTS_DEFAULTS = {
  enabled: 3,
  disabled: null,
} as const;
