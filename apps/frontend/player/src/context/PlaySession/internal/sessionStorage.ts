const SESSION_KEY = (playSlug: string) => `hunthub_session_${playSlug}`;

export const sessionStorage = {
  get: (playSlug: string): string | null => {
    try {
      return localStorage.getItem(SESSION_KEY(playSlug));
    } catch {
      return null;
    }
  },

  set: (playSlug: string, sessionId: string): void => {
    try {
      localStorage.setItem(SESSION_KEY(playSlug), sessionId);
    } catch {
      console.warn('Failed to save session to localStorage');
    }
  },

  clear: (playSlug: string): void => {
    try {
      localStorage.removeItem(SESSION_KEY(playSlug));
    } catch {
      console.warn('Failed to clear session from localStorage');
    }
  },
};
