import { useState, useCallback, useRef, useEffect } from 'react';
import { TextField, InputAdornment, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useAutocompleteSuggestions } from '@/hooks';
import * as S from './FormLocationPicker.styles';

interface LocationSearchProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value?: string;
  defaultValue?: string;
}

export const LocationSearch = ({ onPlaceSelect, value, defaultValue = '' }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value ?? defaultValue);

  // Sync when external value changes (from map click, marker drag, etc.)
  const previousValueRef = useRef(value);
  useEffect(() => {
    if (value !== undefined && value !== previousValueRef.current) {
      previousValueRef.current = value;
      setInputValue(value);
    }
  }, [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(inputValue);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0);
  }, []);

  const handleSuggestionClick = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;

      setIsSelecting(true);
      setIsOpen(false);

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: ['location', 'formattedAddress', 'displayName'],
      });

      // Update input with selected place name
      setInputValue(place.formattedAddress || place.displayName || '');

      // Reset session token after fetchFields (billing optimization)
      resetSession();

      // Convert Place to PlaceResult format for parent component
      onPlaceSelect({
        geometry: place.location ? { location: place.location } : undefined,
        formatted_address: place.formattedAddress ?? undefined,
        name: place.displayName ?? undefined,
      });

      setIsSelecting(false);
    },
    [onPlaceSelect, resetSession],
  );

  const handleBlur = useCallback(() => {
    // Delay closing to allow click on suggestion
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (inputValue.length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [inputValue, suggestions]);

  const showDropdown = isOpen && suggestions.length > 0 && !isSelecting;

  return (
    <S.SearchContainer>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="Search for a location..."
        fullWidth
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {isLoading || isSelecting ? (
                  <CircularProgress size={20} />
                ) : (
                  <MagnifyingGlassIcon size={20} aria-hidden="true" />
                )}
              </InputAdornment>
            ),
          },
          htmlInput: {
            'aria-label': 'Search for a location',
            autoComplete: 'off',
          },
        }}
      />

      {showDropdown && (
        <S.SuggestionsDropdown elevation={4}>
          <List dense disablePadding>
            {suggestions.map((suggestion, index) => {
              const text = suggestion.placePrediction?.text.text;
              if (!text) return null;

              return (
                <ListItemButton key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  <ListItemText primary={text} />
                </ListItemButton>
              );
            })}
          </List>
        </S.SuggestionsDropdown>
      )}
    </S.SearchContainer>
  );
};
