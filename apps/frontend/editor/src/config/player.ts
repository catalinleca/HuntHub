const PLAYER_BASE_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

export const getPlayUrl = (playSlug: string) => `${PLAYER_BASE_URL}/play/${playSlug}`;
