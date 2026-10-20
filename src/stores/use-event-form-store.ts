import { create } from 'zustand';
import { CreateTicketTierInput, CreateEventInput } from '@/lib/hooks-new/useEvents';

interface EventFormState {
  step: number;
  isEditing: boolean;
  editingEventId: string | null;
  formData: CreateEventInput;


  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<CreateEventInput>) => void;


  addTicketTier: (tier: CreateTicketTierInput) => void;
  updateTicketTier: (
    index: number,
    tier: Partial<CreateTicketTierInput>,
  ) => void;
  removeTicketTier: (index: number) => void;

  setImages: (images: File[]) => void;

  initEditMode: (
    eventId: string,
    existingData: Partial<CreateEventInput>,
  ) => void;
  resetForm: () => void;
}

const initialFormData: CreateEventInput = {
  name: '',
  description: '',
  eventType: 'PHYSICAL',
  startsAt: '',
  endsAt: '',
  ticketTiers: [],
  categoryId: '',
  images: [],
  banner: '',
  venue: '',
  city: '',
  isOnline: false,
  capacity: 100,
  coverFees: false,
  meetingLink: '',
  virtualPlatform: '',
  meetingPasscode: '',
  settlementAccountId: '',
  instagram: '',
  x: '',
  website: '',
  slug: '',
};

export const useEventFormStore = create<EventFormState>((set) => ({
  step: 1,
  isEditing: false,
  editingEventId: null,
  formData: initialFormData,

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  addTicketTier: (tier) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ticketTiers: [...state.formData.ticketTiers, tier],
      },
    })),

  updateTicketTier: (index, updatedTier) =>
    set((state) => {
      const tiers = [...state.formData.ticketTiers];
      tiers[index] = { ...tiers[index], ...updatedTier };
      return { formData: { ...state.formData, ticketTiers: tiers } };
    }),

  removeTicketTier: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ticketTiers: state.formData.ticketTiers.filter((_, i) => i !== index),
      },
    })),

  setImages: (images) =>
    set((state) => ({
      formData: { ...state.formData, images },
    })),

  initEditMode: (eventId, existingData) =>
    set({
      isEditing: true,
      editingEventId: eventId,
      step: 1,
      formData: { ...initialFormData, ...existingData },
    }),

  resetForm: () =>
    set({
      step: 1,
      isEditing: false,
      editingEventId: null,
      formData: initialFormData,
    }),
}));
