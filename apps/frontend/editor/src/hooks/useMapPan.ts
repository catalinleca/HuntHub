import { useEffect, useRef } from 'react';

export function useMapPan(map: google.maps.Map | null, center: { lat: number; lng: number } | null): void {
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map || !center) {
      return;
    }

    const prev = prevCenterRef.current;
    const changed = !prev || prev.lat !== center.lat || prev.lng !== center.lng;

    if (changed) {
      map.panTo(center);
      prevCenterRef.current = center;
    }
  }, [map, center?.lat, center?.lng]);
}
