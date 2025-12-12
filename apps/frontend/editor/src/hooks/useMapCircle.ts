import { useEffect, useRef } from 'react';

const CIRCLE_STYLE = {
  strokeColor: '#B6591B',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#B6591B',
  fillOpacity: 0.15,
} as const;

export interface UseMapCircleOptions {
  center: { lat: number; lng: number } | null;
  radius: number | null;
}

export function useMapCircle(map: google.maps.Map | null, { center, radius }: UseMapCircleOptions): void {
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!center || !radius) {
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({ map, ...CIRCLE_STYLE });
    }

    circleRef.current.setCenter(center);
    circleRef.current.setRadius(radius);

    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map, center?.lat, center?.lng, radius]);
}
