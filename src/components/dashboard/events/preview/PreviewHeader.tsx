'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Monitor,
  Smartphone,
} from 'lucide-react';

interface PreviewHeaderProps {
  previewDevice: 'mobile' | 'desktop';
  onDeviceChange: (device: 'mobile' | 'desktop') => void;
  onBack: () => void;
  onPublish: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
}

export function PreviewHeader({
  previewDevice,
  onDeviceChange,
  onBack,
  onPublish,
  onSaveDraft,
  isSubmitting,
}: PreviewHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-[#dce1d5] pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-xl bg-[#f7f7f2] p-1 border border-[#dce1d5]">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              previewDevice === 'desktop'
                ? 'bg-white text-[#17211b] shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              previewDevice === 'mobile'
                ? 'bg-white text-[#17211b] shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="rounded-full border border-[#dce1d5] bg-white px-4 py-2.5 text-xs font-bold text-[#17211b] hover:bg-[#f7f7f2]"
          >
            Save Draft
          </button>
        )}

        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#25332a] disabled:opacity-50"
        >
          {isSubmitting ? (
            'Publishing...'
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#d6f94a]" />
              Publish Event
            </>
          )}
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex flex-row justify-center items-center rounded-full border border-[#dce1d5] bg-white px-4 py-2.5 text-xs font-bold text-[#17211b] hover:bg-[#f7f7f2]"
        >
          <ArrowLeft size={15}/> Back
        </button>
      </div>
    </div>
  );
}
