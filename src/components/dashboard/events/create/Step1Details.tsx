'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import { GadaInput } from '@/components/common/gada-inputs';
import { EventFormValues } from './schema';

interface Step1DetailsProps {
  form: UseFormReturn<EventFormValues>;
}

export function Step1Details({ form }: Step1DetailsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const coverImageUrl = watch('coverImageUrl');
  const description = watch('description') || '';
  const title = watch('title') || '';
  const slug = watch('slug') || '';
  const coverFees = watch('coverFees') ?? false;

  const [imagePreview, setImagePreview] = useState<string | null>(
    coverImageUrl || null,
  );

  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const domain =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.gada.africa';

  const fullUrlPreview = `${domain}/events/${slug || 'your-event-slug'}`;

  useEffect(() => {
    if (coverImageUrl) {
      setImagePreview(coverImageUrl);
    }
  }, [coverImageUrl]);

  useEffect(() => {
    if (title && !isSlugTouched) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [title, isSlugTouched, setValue]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugTouched(true);
    setValue('slug', e.target.value, { shouldValidate: true });
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue('coverImageUrl', previewUrl, { shouldValidate: true });
      setValue('coverImageFiles', [file], { shouldValidate: true });
      toast.success('Cover image staged successfully.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setValue('coverImageUrl', '', { shouldValidate: true });
    setValue('coverImageFiles', [], { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold tracking-wider text-[#17211b]">
          Event Main Cover Banner <span className="text-[#c34837]">*</span>
        </label>
        <div
          {...getRootProps()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            imagePreview
              ? 'border-[#17211b] bg-[#17211b]/5'
              : errors.coverImageUrl
                ? 'border-[#c34837] bg-red-50/50'
                : 'border-[#dce1d5] bg-[#f7f7f2] hover:border-[#17211b]'
          }`}
        >
          <input {...getInputProps()} />

          {imagePreview ? (
            <div className="relative h-44 w-full overflow-hidden rounded-xl">
              <img
                src={imagePreview}
                alt="Cover Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#17211b]/5 text-[#6d766d]">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#17211b]">
                Drag & drop an image asset here, or click to browse
              </p>
              <p className="text-[10px] text-[#6d766d]">
                Supports PNG, JPEG, or WEBP (Recommended 16:9 ratio)
              </p>
            </div>
          )}
        </div>
        {errors.coverImageUrl && (
          <p className="mt-1 text-xs text-[#c34837]">
            {errors.coverImageUrl.message}
          </p>
        )}
      </div>

      <GadaInput
        register={register}
        type="text"
        name="title"
        label="Event Title"
        placeHolder="e.g. The Good Life Brunch"
        required
        error={errors.title?.message}
      />

      <div className="relative">
        <LinkIcon className="absolute left-3 top-10 h-4 w-4 text-[#ff5500]" />
        <GadaInput
          register={register}
          type="text"
          name="slug"
          label={`Customize your event URL: ${fullUrlPreview}`}
          placeHolder="e.g. uyo-fitfest"
          styles="pl-9"
          required
          onChange={handleSlugChange}
          error={errors.slug?.message}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:p-5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-[#ff5500]" />
            <div className="flex-row items-center gap-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
                Cover Commission Fees?
              </h4>
              <p className="text-xs text-[#6d766d]">
                Enable to absorb platform commission fees on behalf of your
                ticket buyers.
              </p>
            </div>
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={coverFees}
            onChange={(e) =>
              setValue('coverFees', e.target.checked, { shouldValidate: true })
            }
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-[#dce1d5] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#ff5500] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
        </label>
      </div>

      <div className="space-y-2" data-color-mode="light">
        <label className="text-xs font-bold tracking-wider text-[#17211b]">
          Event Description <span className="text-[#c34837]">*</span>
        </label>
        <div
          className={`overflow-hidden rounded-xl border ${
            errors.description ? 'border-[#c34837]' : 'border-[#dce1d5]'
          }`}
        >
          <MDEditor
            value={description}
            onChange={(val) =>
              setValue('description', val || '', { shouldValidate: true })
            }
            preview="edit" // Keeps it as a single full-width editor with a formatting toolbar
            height={240}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-xs text-[#c34837]">
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
}
