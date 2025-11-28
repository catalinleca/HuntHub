import { useHuntsQuery } from './getHunts';
import { DEFAULT_HUNTS_LIMIT } from './config';

export const useDashboardHunts = () => {
  const { data, isLoading, error } = useHuntsQuery({
    page: 1,
    limit: DEFAULT_HUNTS_LIMIT,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  return {
    hunts: data?.data || [],
    totalCount: data?.pagination.total || 0,
    hasNext: data?.pagination.hasNext || false,
    isLoading,
    error,
  };
};
