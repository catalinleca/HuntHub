const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

export const getPlayUrl = (playSlug: string): string => {
  return `${PLAYER_URL}/play/${playSlug}`;
};
