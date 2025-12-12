import { useEffect, useRef } from 'react';

export function useMapPan(map: google.maps.Map | null, lat?: number | null, lng?: number | null): void {
  const prevRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map || lat == null || lng == null) {
      return;
    }

    const prev = prevRef.current;
    const changed = !prev || prev.lat !== lat || prev.lng !== lng;

    if (changed) {
      map.panTo({ lat, lng });
      prevRef.current = { lat, lng };
    }
  }, [map, lat, lng]);
}
