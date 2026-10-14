export interface TicketTypePreview {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface EventFormDataPreview {
  title: string;
  category: string;
  description: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  locationType: 'VENUE' | 'ONLINE';
  settlementAccountId?: string;
  venueName?: string;
  venueAddress?: string;

  eventType?: string;
  slug?: string;
  coverFees?: boolean;
  meetingLink?: string;
  virtualPlatform?: string;
  meetingPasscode?: string;

  ticketTiers: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  settlementAccount?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
  isPublic: boolean;
}


export interface EventPreviewStepProps {
  formData: EventFormDataPreview;
  onBack: () => void;
  onPublish: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
}
