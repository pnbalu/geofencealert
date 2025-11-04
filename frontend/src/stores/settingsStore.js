import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      currency: 'USD',
      language: 'en',
      darkMode: false,
      notificationsEnabled: true,
      soundEnabled: true,
      autoBackup: true,
      backupFrequency: 'daily',
      updateFrequency: 300, // Default: 5 minutes (in seconds)
      
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAutoBackup: (enabled) => set({ autoBackup: enabled }),
      setBackupFrequency: (frequency) => set({ backupFrequency: frequency }),
      setUpdateFrequency: (frequency) => set({ updateFrequency: frequency }),
    }),
    {
      name: 'app-settings',
    }
  )
)

