import React, { useState, useCallback } from 'react';
import { useFormContext, useWatch, useController } from 'react-hook-form';
import {
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Slider,
} from '@mui/material';
import { MapPinIcon, CrosshairIcon } from '@phosphor-icons/react';
import { WithTransition } from '@/components/common';
import { LocationSearch } from './LocationSearch';
import { LocationMap } from './LocationMap';
import { useReverseGeocode, useCurrentLocation } from '@/hooks';
import { DEFAULT_RADIUS } from '@/config/google-maps';
import * as S from './FormLocationPicker.styles';

interface FormLocationPickerProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const FormLocationPicker = ({
  name,
  label = 'Location',
  description,
  disabled = false,
}: FormLocationPickerProps) => {
  const { setValue, control } = useFormContext();
  const { reverseGeocode } = useReverseGeocode();
  const { getCurrentLocation, isLoading: isGettingLocation, error: locationError } = useCurrentLocation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [clickToSelectEnabled, setClickToSelectEnabled] = useState(true);

  const location = useWatch({ name });
  const hasLocation = location?.lat != null && location?.lng != null;

  const { field: radiusField } = useController({
    name: `${name}.radius`,
    control,
  });

  const updateLocation = useCallback(
    async (lat: number, lng: number, options?: { skipAddress?: boolean }) => {
      setValue(`${name}.lat`, lat, { shouldDirty: true });
      setValue(`${name}.lng`, lng, { shouldDirty: true });

      if (location?.radius == null) {
        setValue(`${name}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
      }

      if (!options?.skipAddress) {
        const address = await reverseGeocode(lat, lng);
        if (address) {
          setValue(`${name}.address`, address, { shouldDirty: true });
        }
      }
    },
    [name, setValue, reverseGeocode, location?.radius],
  );

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const address = place.formatted_address;

      if (lat != null && lng != null) {
        setValue(`${name}.lat`, lat, { shouldDirty: true });
        setValue(`${name}.lng`, lng, { shouldDirty: true });
        setValue(`${name}.address`, address ?? null, { shouldDirty: true });

        if (location?.radius == null) {
          setValue(`${name}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
        }
      }
    },
    [name, setValue, location?.radius],
  );

  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      updateLocation(lat, lng);
    },
    [updateLocation],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      updateLocation(lat, lng);
    },
    [updateLocation],
  );

  const handleExpand = () => {
    if (!disabled) {
      setIsExpanded(true);
    }
  };

  const handleUseCurrentLocation = async () => {
    const coords = await getCurrentLocation();

    if (coords) {
      await updateLocation(coords.lat, coords.lng);
    }
  };

  const transitionKey = isExpanded || hasLocation ? 'expanded' : 'collapsed';

  return (
    <WithTransition transitionKey={transitionKey} variant="fade-slide-up" duration={100}>
      {!isExpanded && !hasLocation ? (
        <Stack gap={1}>
          <S.SectionLabel>{label}</S.SectionLabel>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          <S.AddLocationButton onClick={handleExpand} tabIndex={disabled ? -1 : 0}>
            <MapPinIcon size={20} aria-hidden="true" />
            <Typography variant="body2">Add starting location</Typography>
          </S.AddLocationButton>
        </Stack>
      ) : (
        <Stack gap={2}>
          <S.SectionLabel>{label}</S.SectionLabel>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}

          <Stack direction="row" gap={1} alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <LocationSearch onPlaceSelect={handlePlaceSelect} value={location?.address ?? ''} />
            </Box>
            <Tooltip title={locationError || 'Use current location'}>
              <span>
                <IconButton
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  color={locationError ? 'error' : 'default'}
                >
                  {isGettingLocation ? <CircularProgress size={20} /> : <CrosshairIcon size={20} />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <LocationMap
            lat={location?.lat}
            lng={location?.lng}
            radius={location?.radius}
            onMarkerDragEnd={handleMarkerDragEnd}
            onMapClick={clickToSelectEnabled ? handleMapClick : undefined}
          />

          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Checkbox checked={clickToSelectEnabled} onChange={(e) => setClickToSelectEnabled(e.target.checked)} />
            }
            label={<Typography variant="body2">Click on map to select location</Typography>}
          />

          <Stack sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="baseline" gap={1}>
              <S.RadiusLabel>Check-in radius: {radiusField.value ?? DEFAULT_RADIUS}m</S.RadiusLabel>
              <S.RadiusHelper> - How close must players be to start</S.RadiusHelper>
            </Stack>
            <Box sx={{ pr: 5 }}>
              <Slider {...radiusField} value={radiusField.value ?? DEFAULT_RADIUS} min={10} max={100} />
            </Box>
          </Stack>
        </Stack>
      )}
    </WithTransition>
  );
};
