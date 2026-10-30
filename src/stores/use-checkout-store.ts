import { create } from 'zustand';

export interface Tier {
  id: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  quantity: number;
  soldCount: number;
  isMultiDay?: boolean;
  maxScansPerDay?: number;
  validDate?: string;
}

export interface ActiveSelection {
  tier: Tier;
  quantity: number;
}

export interface AttendeeInfo {
  fullName: string;
  email: string;
  phone?: string;
}

interface CheckoutState {
  eventId: string | null;
  tiers: Tier[];
  quantities: Record<string, number>;
  attendee: AttendeeInfo;
  isDrawerOpen: boolean;
  isDrawerVisible: boolean;
  isProcessing: boolean;

  initCheckout: (eventId: string, tiers: Tier[]) => void;
  setQuantity: (tierId: string, delta: number, maxAvailable: number) => void;
  setAttendee: (info: Partial<AttendeeInfo>) => void;
  resetQuantities: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setIsProcessing: (isProcessing: boolean) => void;

  getActiveSelections: () => ActiveSelection[];
  getSubtotal: () => number;
  getPlatformFee: () => number;
  getTotal: () => number;
  getCurrencySymbol: () => string;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  eventId: null,
  tiers: [],
  quantities: {},
  attendee: { fullName: '', email: '', phone: '' },
  isDrawerOpen: false,
  isDrawerVisible: false,
  isProcessing: false,

  initCheckout: (eventId, tiers) => {
    set({ eventId, tiers });
  },

  setQuantity: (tierId, delta, maxAvailable) => {
    set((state) => {
      const current = state.quantities[tierId] || 0;
      const tier = state.tiers.find((t) => t.id === tierId);

      const isFreeTier = tier ? Number(tier.price) === 0 : false;
      const tierMaxCap = isFreeTier ? 1 : 10;
      const effectiveMax = Math.min(maxAvailable, tierMaxCap);

      const updated = Math.max(0, Math.min(effectiveMax, current + delta));

      return {
        quantities: {
          ...state.quantities,
          [tierId]: updated,
        },
      };
    });
  },

  setAttendee: (info) =>
    set((state) => ({
      attendee: { ...state.attendee, ...info },
    })),

  resetQuantities: () => {
    set({ quantities: {} });
  },

  openDrawer: () => {
    set({ isDrawerOpen: true });
    setTimeout(() => set({ isDrawerVisible: true }), 10);
  },

  closeDrawer: () => {
    set({ isDrawerVisible: false });
    setTimeout(() => set({ isDrawerOpen: false }), 300);
  },

  setIsProcessing: (isProcessing) => {
    set({ isProcessing });
  },

  getActiveSelections: () => {
    const { tiers, quantities } = get();
    return tiers
      .map((tier) => ({
        tier,
        quantity: quantities[tier.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
  },

  getSubtotal: () => {
    const selections = get().getActiveSelections();
    return selections.reduce((acc, item) => {
      return acc + Number(item.tier.price) * item.quantity;
    }, 0);
  },

  getPlatformFee: () => {
    const subtotal = get().getSubtotal();
    return subtotal > 0 ? subtotal * 0.05 + 100 : 0;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getPlatformFee();
  },

  getCurrencySymbol: () => {
    const { tiers } = get();
    if (!tiers || tiers.length === 0) return '₦';
    return tiers[0]?.currency === 'NGN' ? '₦' : tiers[0]?.currency || '₦';
  },

  resetCheckout: () =>
    set({
      eventId: null,
      tiers: [],
      quantities: {},
      attendee: { fullName: '', email: '', phone: '' },
      isDrawerOpen: false,
      isDrawerVisible: false,
      isProcessing: false,
    }),
}));
