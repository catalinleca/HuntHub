import { useRef, ReactNode } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { TransitionWrapper } from './WithTransition.styles';

export type TransitionVariant = 'fade' | 'fade-slide-down' | 'fade-slide-up' | 'fade-scale' | 'slide-left';

interface WithTransitionProps {
  transitionKey: string | number;
  variant?: TransitionVariant;
  duration?: number;
  mode?: 'out-in' | 'in-out';
  children: ReactNode;
}

export const WithTransition = ({
  transitionKey,
  variant = 'fade-slide-down',
  duration = 200,
  mode = 'out-in',
  children,
}: WithTransitionProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <SwitchTransition mode={mode}>
      <CSSTransition key={transitionKey} timeout={duration} nodeRef={nodeRef}>
        <TransitionWrapper ref={nodeRef} $variant={variant} $duration={duration}>
          {children}
        </TransitionWrapper>
      </CSSTransition>
    </SwitchTransition>
  );
};
