export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
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

export function buildSortObject(sortBy: string | undefined, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> {
  if (!sortBy) {
    return {};
  }

  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };
}
