import type { AssetQueryParams } from '@hunthub/shared';

/**
 * Query key factory for Asset queries
 *
 * Hierarchical structure enables granular cache invalidation:
 * - assetKeys.all() - invalidates ALL asset queries
 * - assetKeys.lists() - invalidates all list queries
 * - assetKeys.list(params) - invalidates specific list query
 * - assetKeys.details() - invalidates all detail queries
 * - assetKeys.detail(id) - invalidates specific asset
 *
 * Pattern from TkDodo's blog: https://tkdodo.eu/blog/effective-react-query-keys
 */
export const assetKeys = {
  all: () => ['assets'] as const,
  lists: () => [...assetKeys.all(), 'list'] as const,
  list: (params?: AssetQueryParams) => [...assetKeys.lists(), params] as const,
  details: () => [...assetKeys.all(), 'detail'] as const,
  detail: (id: number) => [...assetKeys.details(), id] as const,
};
