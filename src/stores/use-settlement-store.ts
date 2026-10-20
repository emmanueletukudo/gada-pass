import { create } from 'zustand';

interface SettlementState {
  isDismissed: boolean;
  dismissBanner: () => void;
  resetBanner: () => void;
}

export const useSettlementStore = create<SettlementState>((set) => ({
  isDismissed: false,
  dismissBanner: () => set({ isDismissed: true }),
  resetBanner: () => set({ isDismissed: false }),
}));
