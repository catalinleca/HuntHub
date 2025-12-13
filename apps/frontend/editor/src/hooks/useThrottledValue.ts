import { useState, useEffect, useMemo } from 'react';
import { throttle } from 'lodash-es';

export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttled, setThrottled] = useState(value);

  const throttledSet = useMemo(() => {
    return throttle(setThrottled, delay, { leading: true, trailing: true });
  }, [delay]);

  useEffect(() => {
    throttledSet(value);
  }, [value, throttledSet]);

  useEffect(() => {
    return () => throttledSet.cancel();
  }, [throttledSet]);

  return throttled;
}
