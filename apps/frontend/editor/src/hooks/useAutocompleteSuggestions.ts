import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface UseAutocompleteSuggestionsReturn {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  resetSession: () => void;
}

/**
 * Hook to fetch autocomplete suggestions using the NEW Places API.
 * Based on vis.gl's production implementation.
 *
 * @see https://github.com/visgl/react-google-maps/blob/main/examples/autocomplete/src/hooks/use-autocomplete-suggestions.ts
 * @see https://developers.google.com/maps/documentation/javascript/place-autocomplete-data
 */
export function useAutocompleteSuggestions(
  inputString: string,
  requestOptions: Partial<google.maps.places.AutocompleteRequest> = {},
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary('places');

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!placesLib) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    // Create a new session token if one doesn't exist.
    // Must be reset after fetchFields is called (for billing purposes).
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const request: google.maps.places.AutocompleteRequest = {
      ...requestOptions,
      input: inputString,
      sessionToken: sessionTokenRef.current,
    };

    // Clear suggestions if input is empty
    if (inputString === '') {
      if (suggestions.length > 0) setSuggestions([]);
      return;
    }

    setIsLoading(true);

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then((res) => {
        setSuggestions(res.suggestions);
        setIsLoading(false);
      })
      .catch(() => {
        setSuggestions([]);
        setIsLoading(false);
      });
  }, [placesLib, inputString]);

  return {
    suggestions,
    isLoading,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    },
  };
}
