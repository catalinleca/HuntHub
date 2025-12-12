import { useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface UseReverseGeocodeReturn {
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  isReady: boolean;
}

export function useReverseGeocode(): UseReverseGeocodeReturn {
  const geocoding = useMapsLibrary('geocoding');

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      if (!geocoding) return null;

      return new Promise((resolve) => {
        const geocoder = new geocoding.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        });
      });
    },
    [geocoding],
  );

  return { reverseGeocode, isReady: !!geocoding };
}
