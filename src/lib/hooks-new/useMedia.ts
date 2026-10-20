'use client';

import { api } from './useApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';


export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const { uploadUrl, publicUrl } = await api<{
        uploadUrl: string;
        publicUrl: string;
      }>('/media/image/upload-url', {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
      });

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      return publicUrl;
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'File upload failed';
      toast.error(message);
    },
  });
}
