// Location defaults: enabled uses 0,0 as placeholder requiring user to set via map picker
export const LOCATION_DEFAULTS = {
  enabled: { lat: 0, lng: 0, radius: 100 },
  disabled: { lat: null, lng: null, radius: null },
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
