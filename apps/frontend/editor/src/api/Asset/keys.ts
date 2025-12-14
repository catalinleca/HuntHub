import type { AssetQueryParams } from '@hunthub/shared';

export const assetKeys = {
  all: () => ['assets'] as const,
  lists: () => [...assetKeys.all(), 'list'] as const,
  list: (params?: AssetQueryParams) => [...assetKeys.lists(), params] as const,
  details: () => [...assetKeys.all(), 'detail'] as const,
  detail: (id: number) => [...assetKeys.details(), id] as const,
};
