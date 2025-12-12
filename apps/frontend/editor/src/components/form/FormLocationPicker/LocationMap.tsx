import { Map, AdvancedMarker, Pin, useApiIsLoaded, useMap, MapMouseEvent } from '@vis.gl/react-google-maps';
import { CircularProgress, Typography } from '@mui/material';
import { useMapPan, useMapCircle } from '@/hooks';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, GOOGLE_MAP_ID } from '@/config/google-maps';
import { getColor } from '@/utils';
import * as S from './FormLocationPicker.styles';

interface LocationMapProps {
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export const LocationMap = ({ lat, lng, radius, onMarkerDragEnd, onMapClick }: LocationMapProps) => {
  const isLoaded = useApiIsLoaded();
  const map = useMap();

  const hasLocation = lat != null && lng != null;

  useMapPan(map, lat, lng);
  useMapCircle(map, lat, lng, radius);

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMarkerDragEnd) {
      onMarkerDragEnd(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng && onMapClick) {
      onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  if (!isLoaded) {
    return (
      <S.MapContainer>
        <S.MapPlaceholder gap={1}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading map...
          </Typography>
        </S.MapPlaceholder>
      </S.MapContainer>
    );
  }

  return (
    <S.MapContainer>
      <Map
        defaultCenter={DEFAULT_MAP_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        disableDefaultUI
        gestureHandling="cooperative"
        mapId={GOOGLE_MAP_ID}
        onClick={handleMapClick}
        style={{ cursor: onMapClick ? 'crosshair' : 'grab' }}
      >
        {hasLocation && (
          <AdvancedMarker position={{ lat, lng }} draggable onDragEnd={handleDragEnd}>
            <Pin background={getColor('primary.main')} borderColor={getColor('secondary.main')} glyphColor={getColor('common.white')} />
          </AdvancedMarker>
        )}
      </Map>
    </S.MapContainer>
  );
};
