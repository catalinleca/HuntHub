import { useState, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography, InputAdornment, FormControlLabel, Checkbox } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { LocationSearch } from './LocationSearch';
import { LocationMap } from './LocationMap';
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
  const { setValue } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clickToSelectEnabled, setClickToSelectEnabled] = useState(true);
  const geocoding = useMapsLibrary('geocoding');

  const location = useWatch({ name });
  const hasLocation = location?.lat != null && location?.lng != null;

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
    [name, setValue, location?.radius]
  );

  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      setValue(`${name}.lat`, lat, { shouldDirty: true });
      setValue(`${name}.lng`, lng, { shouldDirty: true });

      if (geocoding) {
        const geocoder = new geocoding.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setValue(`${name}.address`, results[0].formatted_address, { shouldDirty: true });
          }
        });
      }
    },
    [name, setValue, geocoding],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setValue(`${name}.lat`, lat, { shouldDirty: true });
      setValue(`${name}.lng`, lng, { shouldDirty: true });

      // Set default radius if not already set
      if (location?.radius == null) {
        setValue(`${name}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
      }

      // Reverse geocode to get address
      if (geocoding) {
        const geocoder = new geocoding.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setValue(`${name}.address`, results[0].formatted_address, { shouldDirty: true });
          }
        });
      }
    },
    [name, setValue, geocoding, location?.radius],
  );

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value);
      setValue(`${name}.radius`, value, { shouldDirty: true });
    },
    [name, setValue]
  );

  const handleExpand = () => {
    if (!disabled) {
      setIsExpanded(true);
    }
  };

  if (!isExpanded && !hasLocation) {
    return (
      <Stack spacing={1}>
        <S.SectionLabel>{label}</S.SectionLabel>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <S.AddLocationButton
          onClick={handleExpand}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Add starting location"
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleExpand();
            }
          }}
        >
          <MapPinIcon size={20} aria-hidden="true" />
          <Typography variant="body2">Add starting location</Typography>
        </S.AddLocationButton>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <S.SectionLabel>{label}</S.SectionLabel>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}

      <LocationSearch onPlaceSelect={handlePlaceSelect} value={location?.address ?? ''} />

      <LocationMap
        lat={location?.lat}
        lng={location?.lng}
        radius={location?.radius}
        onMarkerDragEnd={handleMarkerDragEnd}
        onMapClick={clickToSelectEnabled ? handleMapClick : undefined}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={clickToSelectEnabled}
            onChange={(e) => setClickToSelectEnabled(e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Click on map to select location</Typography>}
      />

      <S.RadiusContainer>
        <S.RadiusInput
          label="Check-in radius"
          type="number"
          size="small"
          value={location?.radius ?? ''}
          onChange={handleRadiusChange}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">meters</InputAdornment>,
            },
          }}
        />
        <S.RadiusHelper>How close must players be to start</S.RadiusHelper>
      </S.RadiusContainer>
    </Stack>
  );
};
