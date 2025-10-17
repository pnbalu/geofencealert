import { create } from 'zustand'
import { Location } from '../types'

interface LocationState {
  currentLocation: Location | null
  isTracking: boolean
  trackingInterval: NodeJS.Timeout | null
  lastUpdate: number
  
  // Actions
  startTracking: () => void
  stopTracking: () => void
  updateLocation: (location: Location) => void
  setTrackingInterval: (interval: number) => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  isTracking: false,
  trackingInterval: null,
  lastUpdate: 0,

  startTracking: () => {
    const { isTracking, trackingInterval } = get()
    
    if (isTracking) return
    
    // Clear any existing interval
    if (trackingInterval) {
      clearInterval(trackingInterval)
    }
    
    // Start new tracking interval (every 5 seconds)
    const interval = setInterval(async () => {
      try {
        const location = await window.electronAPI.getCurrentLocation()
        if (location) {
          get().updateLocation(location)
        }
      } catch (error) {
        console.error('Failed to get location:', error)
      }
    }, 5000)
    
    set({
      isTracking: true,
      trackingInterval: interval,
    })
  },

  stopTracking: () => {
    const { trackingInterval } = get()
    
    if (trackingInterval) {
      clearInterval(trackingInterval)
    }
    
    set({
      isTracking: false,
      trackingInterval: null,
    })
  },

  updateLocation: (location) => {
    set({
      currentLocation: location,
      lastUpdate: Date.now(),
    })
  },

  setTrackingInterval: (intervalMs) => {
    const { isTracking, trackingInterval } = get()
    
    if (!isTracking) return
    
    // Clear existing interval
    if (trackingInterval) {
      clearInterval(trackingInterval)
    }
    
    // Set new interval
    const newInterval = setInterval(async () => {
      try {
        const location = await window.electronAPI.getCurrentLocation()
        if (location) {
          get().updateLocation(location)
        }
      } catch (error) {
        console.error('Failed to get location:', error)
      }
    }, intervalMs)
    
    set({ trackingInterval: newInterval })
  },
}))
