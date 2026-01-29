import { useEffect } from 'react';

export const useConfetti = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    import('canvas-confetti')
      .then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.3 },
        });
      })
      .catch((error) => {
        console.warn('Failed to load canvas-confetti', error);
      });
  }, []);
};
