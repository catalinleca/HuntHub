import React, { useRef, useState, useCallback, useEffect } from 'react';

interface UseHorizontalScrollResult {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scroll: (direction: 'left' | 'right') => void;
  onScroll: () => void;
}

const SCROLL_THRESHOLD = 20;
const SCROLL_OFFSET = 125;

export const useHorizontalScroll = (): UseHorizontalScrollResult => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanScrollLeft(el.scrollLeft > SCROLL_THRESHOLD);
    setCanScrollRight(el.scrollLeft < maxScroll - SCROLL_THRESHOLD);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    el.scrollBy({ left: direction === 'left' ? -SCROLL_OFFSET : SCROLL_OFFSET, behavior: 'smooth' });
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
