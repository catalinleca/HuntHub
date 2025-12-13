import { useEffect, useRef } from 'react';
import { getColor } from '@/utils';

const CIRCLE_STYLE = {
  strokeColor: getColor('primary.main'),
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: getColor('primary.main'),
  fillOpacity: 0.15,
} as const;

export function useMapCircle(
  map: google.maps.Map | null,
  lat?: number | null,
  lng?: number | null,
  radius?: number | null,
): void {
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    circleRef.current = new google.maps.Circle({ map, ...CIRCLE_STYLE });

    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!circleRef.current) {
      return;
    }

    if (lat == null || lng == null || radius == null) {
      circleRef.current.setVisible(false);
      return;
    }

    circleRef.current.setCenter({ lat, lng });
    circleRef.current.setRadius(radius);
    circleRef.current.setVisible(true);
  }, [lat, lng, radius]);
}
