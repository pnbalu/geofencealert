import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  currency: 'USD',
  
  setCurrency: (currency) => {
    set({ currency })
  },
}))

