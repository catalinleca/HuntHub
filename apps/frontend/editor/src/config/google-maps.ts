const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!apiKey && import.meta.env.DEV) {
  console.warn('VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps features will not work.');
}

export const GOOGLE_MAPS_API_KEY = apiKey as string | undefined;

export const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined;

export const GOOGLE_MAPS_LIBRARIES = ['places'] as const;

export const DEFAULT_MAP_CENTER = { lat: 44.4268, lng: 26.1025 };

export const DEFAULT_MAP_ZOOM = 15;

export const DEFAULT_RADIUS = 50;
