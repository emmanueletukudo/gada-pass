'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface OrgLogoSettingsProps {
  currentLogoUrl?: string | null;
  orgName?: string;
  onLogoChange?: (file: File) => void;
}

export function OrganizationLogoSettings({
  currentLogoUrl,
  orgName = 'Image will be displayed on your event pages and tickets.',
}: OrgLogoSettingsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogoUrl || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-[#ff765f] p-1 bg-transparent">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1e1e1e]">
          {previewUrl ? (
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
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute inset-0 flex items-center justify-center bg- opacity-0 transition-opacity hover:opacity-100 text-white"
              title="Remove logo"
            >
              <X className="h-6 w-6"/>
            </button>
          )}
        </div>

        <label className="absolute bottom-1 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#8c5222] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border border-[#1e1e1e]">
          <ImageIcon className="h-5 w-5" />
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      <span className="mt-4 text-sm font-medium text-gray-600">{orgName}</span>
    </div>
  );
}
