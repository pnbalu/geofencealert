import React, { useEffect } from 'react'
import { useLocationStore } from '../stores/locationStore'
import { useGeofenceStore } from '../stores/geofenceStore'

export const LocationTracker = () => {
  const { currentLocation, isTracking } = useLocationStore()
  const { geofences, addAlert } = useGeofenceStore()

  // Geofence detection logic
  useEffect(() => {
    if (!currentLocation || !isTracking) return

    const checkGeofences = () => {
      geofences.forEach(geofence => {
        if (!geofence.enabled) return

        let isInside = false

        // Check if geofence is polygon-based
        if (geofence.shape === 'polygon' && geofence.polygon && geofence.polygon.length >= 3) {
          isInside = isPointInPolygon(
            currentLocation.latitude,
            currentLocation.longitude,
            geofence.polygon
          )
        } else {
          // Fallback to circular geofence
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            geofence.latitude,
            geofence.longitude
          )
          isInside = distance <= geofence.radius
        }

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

// Point-in-polygon algorithm using ray casting
function isPointInPolygon(lat, lon, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude
    const yi = polygon[i].latitude
    const xj = polygon[j].longitude
    const yj = polygon[j].latitude

    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
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
