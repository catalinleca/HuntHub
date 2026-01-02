import { RefObject, useEffect } from 'react';

export const useScrollToElement = (containerRef: RefObject<HTMLElement | null>, selector: string | undefined): void => {
  useEffect(() => {
    if (!selector || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const el = container.querySelector(selector) as HTMLElement;

    if (!el) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const isVisible = elRect.left >= containerRect.left && elRect.right <= containerRect.right;

    if (!isVisible) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [containerRef, selector]);
};
