import { useState, useCallback } from 'react';

interface UseCurrentLocationReturn {
  getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentLocation(): UseCurrentLocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setIsLoading(false);
          setError(
            err.code === 1 ? 'Permission denied' : err.code === 3 ? 'Request timed out' : 'Could not get location',
          );
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, []);

  return { getCurrentLocation, isLoading, error };
}
