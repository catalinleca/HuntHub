import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useMapCircle, useMapPan } from '@/hooks';
import { getColor } from '@hunthub/compass';

interface MapControllerProps {
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
}

export const MapController = ({ lat, lng, radius, onMarkerDragEnd }: MapControllerProps) => {
  const map = useMap();

  useMapPan(map, lat, lng);
  useMapCircle(map, lat, lng, radius);

  const hasLocation = lat != null && lng != null;

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMarkerDragEnd) {
      onMarkerDragEnd(e.latLng.lat(), e.latLng.lng());
    }
  };

  if (!hasLocation) {
    return null;
  }

  return (
    <AdvancedMarker position={{ lat, lng }} draggable onDragEnd={handleDragEnd}>
      <Pin
        background={getColor('primary.main')}
        borderColor={getColor('secondary.main')}
        glyphColor={getColor('common.white')}
      />
    </AdvancedMarker>
  );
};
