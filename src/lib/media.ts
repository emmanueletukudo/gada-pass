import { api } from "./api";

export const uploadFileToR2 = async (file: File): Promise<string> => {
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
};
