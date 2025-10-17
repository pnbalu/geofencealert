import React, { useEffect } from 'react'
import { useLocationStore } from '../stores/locationStore'
import { useGeofenceStore } from '../stores/geofenceStore'

export const LocationTracker: React.FC = () => {
  const { currentLocation, isTracking } = useLocationStore()
  const { geofences, addAlert } = useGeofenceStore()

  // Geofence detection logic
  useEffect(() => {
    if (!currentLocation || !isTracking) return

    const checkGeofences = () => {
      geofences.forEach(geofence => {
        if (!geofence.enabled) return

        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          geofence.latitude,
          geofence.longitude
        )

        const isInside = distance <= geofence.radius
        const wasInside = geofence.lastInside || false

        // Check for enter/exit events
        if (isInside && !wasInside) {
          // Entered geofence
          addAlert({
            geofenceId: geofence.id,
            type: 'enter',
            timestamp: new Date().toISOString(),
            location: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            },
            message: `Entered ${geofence.name} (${geofence.type})`,
          })
        } else if (!isInside && wasInside) {
          // Exited geofence
          addAlert({
            geofenceId: geofence.id,
            type: 'exit',
            timestamp: new Date().toISOString(),
            location: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            },
            message: `Exited ${geofence.name} (${geofence.type})`,
          })
        }

        // Update the lastInside state (this would need to be added to the store)
        // For now, we'll use a simple approach
      })
    }

    checkGeofences()
  }, [currentLocation, isTracking, geofences, addAlert])

  return null // This component doesn't render anything, it just handles logic
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}
