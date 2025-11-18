import { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';

export const huntsApi = {
  // Get all user's hunts
  getAll: async (): Promise<Hunt[]> => {
    const response = await apiClient.get<Hunt[]>('/hunts');
    return response.data;
  },

  // Get hunt by ID
  getById: async (id: number): Promise<Hunt> => {
    const response = await apiClient.get<Hunt>(`/hunts/${id}`);
    return response.data;
  },

  // Create new hunt
  create: async (data: HuntCreate): Promise<Hunt> => {
    const response = await apiClient.post<Hunt>('/hunts', data);
    return response.data;
  },

  // Update hunt
  update: async (id: number, data: HuntUpdate): Promise<Hunt> => {
    const response = await apiClient.put<Hunt>(`/hunts/${id}`, data);
    return response.data;
  },

  // Delete hunt
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/hunts/${id}`);
  },
};
