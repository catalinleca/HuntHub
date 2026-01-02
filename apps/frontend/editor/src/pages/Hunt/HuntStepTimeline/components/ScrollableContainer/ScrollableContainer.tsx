import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useHorizontalScroll, useScrollToElement } from '@/hooks';
import * as S from './ScrollableContainer.styles';

interface ScrollableContainerProps {
  children: React.ReactNode;
  scrollToSelector?: string;
}

export const ScrollableContainer = ({ children, scrollToSelector }: ScrollableContainerProps) => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll, onScroll } = useHorizontalScroll();

  useScrollToElement(scrollRef, scrollToSelector);

  return (
    <>
      <S.ScrollButton $visible={canScrollLeft} onClick={() => scroll('left')}>
        <CaretLeftIcon size={20} weight="bold" />
      </S.ScrollButton>

      <S.Container
        ref={scrollRef}
        onScroll={onScroll}
        $canScrollLeft={canScrollLeft}
        $canScrollRight={canScrollRight}
      >
        {children}
      </S.Container>

      <S.ScrollButton $visible={canScrollRight} onClick={() => scroll('right')}>
        <CaretRightIcon size={20} weight="bold" />
      </S.ScrollButton>
    </>
  );
};
