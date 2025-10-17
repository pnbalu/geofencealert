import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { Geofence, GeofenceData, Alert } from '../types'

interface GeofenceState {
  geofences: Geofence[]
  alerts: Alert[]
  selectedGeofence: Geofence | null
  isLoading: boolean
  
  // Actions
  loadGeofences: () => Promise<void>
  saveGeofences: () => Promise<void>
  addGeofence: (geofence: Omit<Geofence, 'id' | 'createdAt'>) => void
  updateGeofence: (id: string, updates: Partial<Geofence>) => void
  deleteGeofence: (id: string) => void
  selectGeofence: (geofence: Geofence | null) => void
  addAlert: (alert: Omit<Alert, 'id'>) => void
  clearAlerts: () => void
  toggleGeofence: (id: string) => void
}

export const useGeofenceStore = create<GeofenceState>()(
  persist(
    (set, get) => ({
      geofences: [],
      alerts: [],
      selectedGeofence: null,
      isLoading: false,

      loadGeofences: async () => {
        set({ isLoading: true })
        try {
          const data = await window.electronAPI.getGeofences()
          set({
            geofences: data.geofences || [],
            alerts: data.alerts || [],
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load geofences:', error)
          toast.error('Failed to load geofences')
          set({ isLoading: false })
        }
      },

      saveGeofences: async () => {
        const { geofences, alerts } = get()
        try {
          const success = await window.electronAPI.saveGeofences({
            geofences,
            alerts,
          })
          if (!success) {
            throw new Error('Failed to save')
          }
        } catch (error) {
          console.error('Failed to save geofences:', error)
          toast.error('Failed to save geofences')
        }
      },

      addGeofence: (geofenceData) => {
        const newGeofence: Geofence = {
          ...geofenceData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          geofences: [...state.geofences, newGeofence],
        }))
        
        get().saveGeofences()
        toast.success('Geofence added successfully')
      },

      updateGeofence: (id, updates) => {
        set((state) => ({
          geofences: state.geofences.map((gf) =>
            gf.id === id ? { ...gf, ...updates } : gf
          ),
        }))
        
        get().saveGeofences()
        toast.success('Geofence updated successfully')
      },

      deleteGeofence: (id) => {
        set((state) => ({
          geofences: state.geofences.filter((gf) => gf.id !== id),
          alerts: state.alerts.filter((alert) => alert.geofenceId !== id),
          selectedGeofence: state.selectedGeofence?.id === id ? null : state.selectedGeofence,
        }))
        
        get().saveGeofences()
        toast.success('Geofence deleted successfully')
      },

      selectGeofence: (geofence) => {
        set({ selectedGeofence: geofence })
      },

      addAlert: (alertData) => {
        const newAlert: Alert = {
          ...alertData,
          id: crypto.randomUUID(),
        }
        
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
        }))
        
        get().saveGeofences()
        
        // Show notification
        window.electronAPI.showNotification(
          `Geofence ${alertData.type === 'enter' ? 'Enter' : 'Exit'}`,
          alertData.message
        )
      },

      clearAlerts: () => {
        set({ alerts: [] })
        get().saveGeofences()
        toast.success('Alerts cleared')
      },

      toggleGeofence: (id) => {
        set((state) => ({
          geofences: state.geofences.map((gf) =>
            gf.id === id ? { ...gf, enabled: !gf.enabled } : gf
          ),
        }))
        
        get().saveGeofences()
      },
    }),
    {
      name: 'geofence-storage',
      partialize: (state) => ({
        geofences: state.geofences,
        alerts: state.alerts,
      }),
    }
  )
)
