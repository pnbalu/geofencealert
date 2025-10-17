export interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  type: 'factory' | 'school' | 'construction' | 'custom'
  color: string
  enabled: boolean
  createdAt: string
}

export interface Alert {
  id: string
  geofenceId: string
  type: 'enter' | 'exit'
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  message: string
}

export interface Location {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface GeofenceData {
  geofences: Geofence[]
  alerts: Alert[]
}

export interface GeofenceType {
  id: 'factory' | 'school' | 'construction' | 'custom'
  label: string
  icon: string
  color: string
  defaultRadius: number
}

export const GEOFENCE_TYPES: GeofenceType[] = [
  {
    id: 'factory',
    label: 'Factory',
    icon: '🏭',
    color: '#ef4444',
    defaultRadius: 100,
  },
  {
    id: 'school',
    label: 'School',
    icon: '🏫',
    color: '#3b82f6',
    defaultRadius: 50,
  },
  {
    id: 'construction',
    label: 'Construction',
    icon: '🚧',
    color: '#f59e0b',
    defaultRadius: 200,
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '📍',
    color: '#8b5cf6',
    defaultRadius: 100,
  },
]
