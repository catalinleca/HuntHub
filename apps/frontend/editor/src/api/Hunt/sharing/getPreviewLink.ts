import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';

interface PreviewLinkResponse {
  previewUrl: string;
  expiresIn: number;
}

const getPreviewLink = async (huntId: number): Promise<PreviewLinkResponse> => {
  const response = await apiClient.get<PreviewLinkResponse>(`/hunts/${huntId}/preview-link`);
  return response.data;
};

export const useGetPreviewLink = () => {
  const { mutateAsync, isPending, ...rest } = useMutation({
    mutationFn: getPreviewLink,
  });

  return { getPreviewLink: mutateAsync, isGettingPreviewLink: isPending, ...rest };
};
