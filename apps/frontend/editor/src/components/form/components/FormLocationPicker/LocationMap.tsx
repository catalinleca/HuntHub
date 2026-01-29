import { Map as GoogleMap, useApiIsLoaded, MapMouseEvent } from '@vis.gl/react-google-maps';
import { CircularProgress, Typography } from '@mui/material';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, GOOGLE_MAP_ID } from '@/config/google-maps';
import * as S from './FormLocationPicker.styles';
import { MapController } from '@/components/form/components/FormLocationPicker/MapController';

interface LocationMapProps {
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export const LocationMap = ({ lat, lng, radius, onMarkerDragEnd, onMapClick }: LocationMapProps) => {
  const isLoaded = useApiIsLoaded();

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
      <GoogleMap
        defaultCenter={DEFAULT_MAP_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        disableDefaultUI
        gestureHandling="cooperative"
        mapId={GOOGLE_MAP_ID}
        onClick={handleMapClick}
        style={{ cursor: onMapClick ? 'crosshair' : 'grab' }}
      >
        <MapController lat={lat} lng={lng} radius={radius} onMarkerDragEnd={onMarkerDragEnd} />
      </GoogleMap>
    </S.MapContainer>
  );
};
