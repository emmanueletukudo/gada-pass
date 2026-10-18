'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, mediaUrl } from '@/lib/api';

interface OrgLogoSettingsProps {
  currentLogoUrl?: string | null;
  orgName?: string;
  onLogoChange?: (newUrl: string | null) => void;
}

export function OrganizationLogoSettings({
  currentLogoUrl,
  orgName = 'Image will be displayed on your event pages and tickets.',
  onLogoChange,
}: OrgLogoSettingsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogoUrl ? mediaUrl(currentLogoUrl) : null,
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentLogoUrl ? mediaUrl(currentLogoUrl) : null);
  }, [currentLogoUrl]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const { uploadUrl, publicUrl } = await api<{
        uploadUrl: string;
        fileKey: string;
        publicUrl: string;
      }>('/users/profile/logo-presign', {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to storage.');
      }
      await api('/users/profile/logo', {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: publicUrl }),
      });

      setPreviewUrl(mediaUrl(publicUrl));
      toast.success('Host logo uploaded successfully!');
      onLogoChange?.(publicUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Logo upload failed',
      );
      setPreviewUrl(currentLogoUrl ? mediaUrl(currentLogoUrl) : null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setIsUploading(true);
      await api('/users/profile/logo', {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: null }),
      });

      setPreviewUrl(null);
      toast.success('Logo removed successfully.');
      onLogoChange?.(null);
    } catch (error) {
      toast.error('Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-[#ff765f] p-1 bg-transparent">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1e1e1e]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Host Logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cover">
              <div className="relative flex h-full w-full items-center justify-center rounded-[50%]/[55%] bg-black">
                <div className="flex w-14 justify-between px-3">
                  <div className="h-7.5 w-3.5 rounded-full bg-white shadow-sm" />
                  <div className="h-4.5 w-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#d6f94a]" />
            </div>
          )}

          {previewUrl && !isUploading && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 text-white"
              title="Remove logo"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <label className="absolute bottom-1 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#8c5222] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border border-[#1e1e1e]">
          <ImageIcon className="h-5 w-5" />
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileSelect}
          />
        </label>
      </div>

      <span className="mt-4 text-sm font-medium text-gray-600 text-center">
        {orgName}
      </span>
    </div>
  );
}
