import React, { useState, useRef } from 'react';
import { Autocomplete, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useAutocompleteSuggestions, useThrottledValue } from '@/hooks';

interface LocationSearchProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value?: string;
}

export const LocationSearch = ({ onPlaceSelect, value = '' }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value);

  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const lastSyncedRef = useRef(value);
  if (value !== lastSyncedRef.current) {
    lastSyncedRef.current = value;
    setInputValue(value);
  }

  const throttledInput = useThrottledValue(inputValue, 300);
  const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(throttledInput);

  const handleInputChange = (_event: React.SyntheticEvent, newValue: string, reason: string) => {
    if (reason === 'input' || reason === 'clear') {
      setInputValue(newValue);
    }
  };

  const handleChange = async (
    _event: React.SyntheticEvent,
    suggestion: google.maps.places.AutocompleteSuggestion | null,
  ) => {
    if (!suggestion?.placePrediction) {
      return;
    }

    const place = suggestion.placePrediction.toPlace();
    await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });

    setInputValue(place.formattedAddress || place.displayName || '');

    // Reset session token after fetchFields (billing optimization)
    resetSession();

    onPlaceSelect({
      geometry: place.location ? { location: place.location } : undefined,
      formatted_address: place.formattedAddress ?? undefined,
      name: place.displayName ?? undefined,
    });
  };

  return (
    <Autocomplete
      filterOptions={(x) => x}
      options={suggestions}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={isLoading}
      getOptionLabel={(option) => option.placePrediction?.text.text ?? ''}
      isOptionEqualToValue={(option, value) => option.placePrediction?.text.text === value.placePrediction?.text.text}
      noOptionsText="Type to search for a location"
      loadingText="Searching..."
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search for a location..."
          size="small"
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  {isLoading ? <CircularProgress size={20} /> : <MagnifyingGlassIcon size={20} aria-hidden="true" />}
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
};
