import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import { WithTransition } from '@/components/common';
import { LocationMapContent } from './LocationMapContent';
import { useCurrentLocation } from '@/hooks';
import { DEFAULT_RADIUS } from '@/config/google-maps';
import * as S from './FormLocationPicker.styles';

interface FormLocationPickerProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Location picker with expand/collapse behavior.
 * Shows "Add location" button when collapsed, expands to show map.
 *
 * For cases where parent controls visibility (e.g., toggle + Collapse),
 * use LocationMapContent directly instead.
 */
export const FormLocationPicker = ({
  name,
  label = 'Location',
  description,
  disabled = false,
}: FormLocationPickerProps) => {
  const { setValue } = useFormContext();
  const { getCurrentLocation } = useCurrentLocation();

  const [isExpanded, setIsExpanded] = useState(false);

  const location = useWatch({ name });
  const hasLocation = location?.lat != null && location?.lng != null;

  const handleExpand = async () => {
    if (disabled) {
      return;
    }

    setIsExpanded(true);

    const coords = await getCurrentLocation();
    if (coords) {
      setValue(`${name}.lat`, coords.lat, { shouldDirty: true });
      setValue(`${name}.lng`, coords.lng, { shouldDirty: true });
      setValue(`${name}.radius`, DEFAULT_RADIUS, { shouldDirty: true });
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
        <LocationMapContent name={name} label={label} description={description} />
      )}
    </WithTransition>
  );
};
