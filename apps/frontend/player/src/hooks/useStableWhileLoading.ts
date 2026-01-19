import { useRef } from 'react';

export const useStableWhileLoading = <T>(value: T, isLoading: boolean, isValid: (v: T) => boolean): T => {
  const stableRef = useRef<T>(value);

  if (!isLoading && isValid(value)) {
    stableRef.current = value;
  }

  return isLoading ? stableRef.current : value;
};
