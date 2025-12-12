import { useEffect, useRef } from 'react';
import { Map, AdvancedMarker, Pin, useApiIsLoaded, useMap, MapMouseEvent } from '@vis.gl/react-google-maps';
import { CircularProgress, Typography } from '@mui/material';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, GOOGLE_MAP_ID } from '@/config/google-maps';
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

  // Track previous location to only pan when it actually changes
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Ref to hold the radius circle instance
  const circleRef = useRef<google.maps.Circle | null>(null);

  // Pan to new location when it changes (from autocomplete, map click, marker drag)
  useEffect(() => {
    if (!map || !hasLocation) {
      return;
    }

    const prevLoc = prevLocationRef.current;
    const locationChanged = !prevLoc || prevLoc.lat !== lat || prevLoc.lng !== lng;

    if (locationChanged) {
      map.panTo({ lat, lng });
      prevLocationRef.current = { lat, lng };
    }
  }, [map, lat, lng, hasLocation]);

  // Create/update/cleanup radius circle
  useEffect(() => {
    if (!map) {
      return;
    }

    // Remove existing circle if no location or radius
    if (!hasLocation || !radius) {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }

    // Create circle if doesn't exist
    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        strokeColor: '#B6591B',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#B6591B',
        fillOpacity: 0.15,
      });
    }

    // Update circle position and radius
    circleRef.current.setCenter({ lat, lng });
    circleRef.current.setRadius(radius);

    // Cleanup on unmount
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, lat, lng, radius, hasLocation]);

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
      <S.MapContainer role="region" aria-label="Map loading">
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
    <S.MapContainer role="region" aria-label="Location map">
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
          <AdvancedMarker
            position={{ lat, lng }}
            draggable
            onDragEnd={handleDragEnd}
            title="Drag to adjust location"
          >
            <Pin background="#B6591B" borderColor="#8B4513" glyphColor="#FFFFFF" />
          </AdvancedMarker>
        )}
      </Map>
    </S.MapContainer>
  );
};
