"use client";

import { useState } from "react";
import { API_URL } from "../hooks-new/api";

interface UploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

interface UseR2UploadReturn {
  uploadFile: (file: File) => Promise<string | null>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useR2Upload(
  apiEndpoint = `${API_URL}"/media/image/upload-url"`,
): UseR2UploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to generate upload URL");
      }

      const { uploadUrl, publicUrl }: UploadResponse = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`R2 upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during R2 upload"));
        xhr.send(file);
      });

      return publicUrl;
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress, error };
}
