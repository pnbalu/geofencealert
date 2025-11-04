import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useGeofenceStore = create(
  persist(
    (set, get) => ({
      geofences: [],
      alerts: [],
      selectedGeofence: null,
      isLoading: false,

      loadGeofences: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getGeofences()
          const loadedGeofences = data.geofences || []
          
          // Initialize with default geofences if none exist
          if (loadedGeofences.length === 0) {
            const defaultGeofences = [
              {
                id: crypto.randomUUID(),
                name: 'Headquarters Circle',
                type: 'circle',
                center: { lat: 39.7392, lng: -104.9903 },
                radius: 500,
                enabled: true,
                createdAt: new Date().toISOString(),
                assignedUsers: [],
              },
              {
                id: crypto.randomUUID(),
                name: 'Warehouse Perimeter',
                type: 'circle',
                center: { lat: 39.7589, lng: -104.9877 },
                radius: 300,
                enabled: true,
                createdAt: new Date().toISOString(),
                assignedUsers: [],
              },
              {
                id: crypto.randomUUID(),
                name: 'Office Complex',
                type: 'polygon',
                coordinates: [
                  { lat: 39.7400, lng: -105.0000 },
                  { lat: 39.7420, lng: -105.0000 },
                  { lat: 39.7420, lng: -104.9980 },
                  { lat: 39.7400, lng: -104.9980 },
                  { lat: 39.7400, lng: -105.0000 },
                ],
                enabled: true,
                createdAt: new Date().toISOString(),
                assignedUsers: [],
              },
              {
                id: crypto.randomUUID(),
                name: 'Parking Area',
                type: 'polygon',
                coordinates: [
                  { lat: 39.7350, lng: -104.9950 },
                  { lat: 39.7370, lng: -104.9950 },
                  { lat: 39.7370, lng: -104.9920 },
                  { lat: 39.7350, lng: -104.9920 },
                  { lat: 39.7350, lng: -104.9950 },
                ],
                enabled: true,
                createdAt: new Date().toISOString(),
                assignedUsers: [],
              },
              {
                id: crypto.randomUUID(),
                name: 'Service Zone Alpha',
                type: 'circle',
                center: { lat: 39.7250, lng: -104.9850 },
                radius: 200,
                enabled: true,
                createdAt: new Date().toISOString(),
                assignedUsers: [],
              },
            ]
            
            set({
              geofences: defaultGeofences,
              alerts: [],
              isLoading: false,
            })
            await get().saveGeofences()
          } else {
            set({
              geofences: loadedGeofences,
              alerts: data.alerts || [],
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Failed to load geofences:', error)
          toast.error('Failed to load geofences')
          set({ isLoading: false })
        }
      },

      saveGeofences: async () => {
        const { geofences, alerts } = get()
        try {
          const success = await electronAPI.saveGeofences({
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
        const newGeofence = {
          ...geofenceData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          geofences: [...state.geofences, newGeofence],
        }))
        
        get().saveGeofences()
        toast.success('Geofence added successfully')
        return newGeofence
      },

      updateGeofence: (id, updates) => {
        let updatedGeofence = null
        set((state) => {
          updatedGeofence = state.geofences.find(gf => gf.id === id)
          return {
            geofences: state.geofences.map((gf) =>
              gf.id === id ? { ...gf, ...updates } : gf
            ),
          }
        })
        
        get().saveGeofences()
        toast.success('Geofence updated successfully')
        return { ...updatedGeofence, ...updates }
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

      assignUsersToGeofence: (geofenceId, userIds) => {
        set((state) => ({
          geofences: state.geofences.map((gf) =>
            gf.id === geofenceId ? { ...gf, assignedUsers: userIds } : gf
          ),
        }))

        get().saveGeofences()
      },

      assignGroupsToGeofence: (geofenceId, groupIds) => {
        set((state) => ({
          geofences: state.geofences.map((gf) =>
            gf.id === geofenceId ? { ...gf, assignedGroups: groupIds } : gf
          ),
        }))

        get().saveGeofences()
      },

      getGeofenceById: (id) => {
        const { geofences } = get()
        return geofences.find((gf) => gf.id === id)
      },

      addAlert: (alertData) => {
        const newAlert = {
          ...alertData,
          id: crypto.randomUUID(),
        }
        
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
        }))
        
        get().saveGeofences()
        
        // Show notification
        electronAPI.showNotification(
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
        const geofence = get().geofences.find((gf) => gf.id === id)
        const newEnabledStatus = !geofence?.enabled
        
        set((state) => ({
          geofences: state.geofences.map((gf) =>
            gf.id === id ? { ...gf, enabled: newEnabledStatus } : gf
          ),
        }))
        
        get().saveGeofences()
        toast.success(newEnabledStatus ? 'Geofence activated' : 'Geofence deactivated')
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
