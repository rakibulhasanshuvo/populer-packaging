import { create } from "zustand";

interface UIState {
  isProductDrawerOpen: boolean;
  isOrderSheetOpen: boolean;
  setProductDrawerOpen: (open: boolean) => void;
  setOrderSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isProductDrawerOpen: false,
  isOrderSheetOpen: false,
  setProductDrawerOpen: (open) => set({ isProductDrawerOpen: open }),
  setOrderSheetOpen: (open) => set({ isOrderSheetOpen: open }),
}));
