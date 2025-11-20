import type { PaginationMeta } from '@hunthub/shared';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  if (limit <= 0) {
    throw new Error('Limit must be a positive number');
  }
  if (page <= 0) {
    throw new Error('Page must be a positive number');
  }

  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildSortObject(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' = 'desc',
): Record<string, 1 | -1> {
  if (!sortBy) {
    return {};
  }

  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };
}
