import React, { useRef, useState, useCallback, useEffect } from 'react';

interface UseHorizontalScrollResult {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scroll: (direction: 'left' | 'right') => void;
  onScroll: () => void;
}

export const useHorizontalScroll = (): UseHorizontalScrollResult => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    el.scrollBy({ left: direction === 'left' ? -120 : 120, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateScrollState]);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scroll,
    onScroll: updateScrollState,
  };
};
