import { contextBridge, ipcRenderer } from 'electron'

export interface GeofenceData {
  geofences: Geofence[]
  alerts: Alert[]
}

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

const electronAPI = {
  getGeofences: (): Promise<GeofenceData> => ipcRenderer.invoke('get-geofences'),
  saveGeofences: (data: GeofenceData): Promise<boolean> => ipcRenderer.invoke('save-geofences', data),
  showNotification: (title: string, body: string): Promise<void> => ipcRenderer.invoke('show-notification', title, body),
  requestLocationPermission: (): Promise<boolean> => ipcRenderer.invoke('request-location-permission'),
  getCurrentLocation: (): Promise<Location | null> => ipcRenderer.invoke('get-current-location'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
