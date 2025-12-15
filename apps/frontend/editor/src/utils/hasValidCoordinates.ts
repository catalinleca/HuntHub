import { Location } from '@hunthub/shared';
import { LocationFormData } from '@/types/editor';

export const hasValidCoordinates = (
  location: Location | LocationFormData | null | undefined,
): location is (Location | LocationFormData) & { lat: number; lng: number } => {
  return location?.lat != null && location?.lng != null;
};
