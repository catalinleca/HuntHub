import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: GeolocationState = {
  position: null,
  error: null,
  isLoading: false,
};

const ERROR_MESSAGES: Record<number, string> = {
  1: 'Location permission denied. Please enable location access.',
  2: 'Location unavailable. Please try again.',
  3: 'Location request timed out. Please try again.',
};

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(initialState);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      error: null,
      isLoading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: ERROR_MESSAGES[error.code] || 'Could not get location',
      isLoading: false,
    }));
  }, []);

  const requestPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, GEOLOCATION_OPTIONS);
  }, [handleSuccess, handleError]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, GEOLOCATION_OPTIONS);
  }, [handleSuccess, handleError]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearWatch();
    setState(initialState);
  }, [clearWatch]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return useMemo(
    () => ({
      ...state,
      requestPosition,
      watchPosition,
      clearWatch,
      reset,
    }),
    [state, requestPosition, watchPosition, clearWatch, reset],
  );
};

export type UseGeolocationReturn = ReturnType<typeof useGeolocation>;
