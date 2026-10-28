'use client';

import { useState } from 'react';
import { EventCardPreview } from './EventCardPreview';
import { EventSummaryGrid } from './EventSummaryGrid';
import { PreviewHeader } from './PreviewHeader';
import { PublishSuccessModal } from './PublishSuccessModal';
import { EventPreviewStepProps } from './types';

export function EventPreviewStep({
  formData,
  onBack,
  onPublish,
  onSaveDraft,
  isSubmitting = false,
}: EventPreviewStepProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePublishSubmit = async () => {
    await onPublish();
    setShowSuccessModal(true);
  };

  const resolvedSlug =
    formData.slug ||
    formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  return (
    <div className="space-y-8">
      <PreviewHeader
        previewDevice={deviceMode}
        onDeviceChange={setDeviceMode}
        onBack={onBack}
        onPublish={handlePublishSubmit}
        onSaveDraft={onSaveDraft}
        isSubmitting={isSubmitting}
      />

      <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-12">
        <div className="lg:col-span-6 border-b border-[#dce1d5] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#6d766d]">
            Live Attendee View ({deviceMode})
          </p>
          <EventCardPreview formData={formData} deviceMode={deviceMode} />
        </div>

        <div className="space-y-4 lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
            Event Breakdown
          </p>
          <EventSummaryGrid
            formData={formData}
            onEditSection={(stepIdx) => {
              console.log('Navigate to step:', stepIdx);
            }}
          />
        </div>
      </div>

      {/* <PublishSuccessModal
        isOpen={showSuccessModal}
        eventTitle={formData.title}
        eventSlug={resolvedSlug}
        onClose={() => {
          setShowSuccessModal(false);
        }}
      /> */}
    </div>
  );
}
