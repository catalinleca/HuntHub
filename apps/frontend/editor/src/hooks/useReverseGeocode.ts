import { useCallback, useMemo } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface UseReverseGeocodeReturn {
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  isReady: boolean;
}

export function useReverseGeocode(): UseReverseGeocodeReturn {
  const geocoding = useMapsLibrary('geocoding');

  const geocoder = useMemo(() => (geocoding ? new geocoding.Geocoder() : null), [geocoding]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      if (!geocoder) {
        return null;
      }

      return new Promise((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        });
      });
    },
    [geocoder],
  );

  return { reverseGeocode, isReady: !!geocoder };
}
