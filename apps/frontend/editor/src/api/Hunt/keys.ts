/**
 * Query key factory for Hunt queries
 *
 * Hierarchical structure enables granular cache invalidation:
 * - huntKeys.all() - invalidates ALL hunt queries
 * - huntKeys.lists() - invalidates all list queries
 * - huntKeys.details() - invalidates all detail queries
 * - huntKeys.detail(id) - invalidates specific hunt
 *
 * Pattern from TkDodo's blog: https://tkdodo.eu/blog/effective-react-query-keys
 */

export const huntKeys = {
  all: () => ['hunts'] as const,
  lists: () => [...huntKeys.all(), 'list'] as const,
  list: (filters?: { status?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string }) =>
    [...huntKeys.lists(), filters] as const,
  details: () => [...huntKeys.all(), 'detail'] as const,
  detail: (id: number) => [...huntKeys.details(), id] as const,
};
