import { LocationStatus } from '@/constants';
import { useGeolocation } from '@/hooks';
import type { LocationContentState } from './LocationContent';

interface UseLocationContentStateProps {
  isSubmitting: boolean;
}

export const useLocationContentState = ({
  isSubmitting,
}: UseLocationContentStateProps): LocationContentState & {
  watchPosition: () => void;
  clearWatch: () => void;
} => {
  const geo = useGeolocation();

  const getStatus = (): LocationStatus => {
    if (geo.position && isSubmitting) {
      return LocationStatus.Submitting;
    }
    if (geo.error) {
      return LocationStatus.Error;
    }
    if (geo.position) {
      return LocationStatus.Ready;
    }
    if (geo.isLoading) {
      return LocationStatus.Loading;
    }
    return LocationStatus.Idle;
  };

  return {
    status: getStatus(),
    position: geo.position,
    error: geo.error,
    watchPosition: geo.watchPosition,
    clearWatch: geo.clearWatch,
  };
};
