const SESSION_KEY = (huntId: number) => `hunthub_session_${huntId}`;

export const sessionStorage = {
  get: (huntId: number): string | null => {
    try {
      return localStorage.getItem(SESSION_KEY(huntId));
    } catch {
      return null;
    }
  },

  set: (huntId: number, sessionId: string): void => {
    try {
      localStorage.setItem(SESSION_KEY(huntId), sessionId);
    } catch {
      console.warn('Failed to save session to localStorage');
    }
  },

  clear: (huntId: number): void => {
    try {
      localStorage.removeItem(SESSION_KEY(huntId));
    } catch {
      console.warn('Failed to clear session from localStorage');
    }
  },
};
