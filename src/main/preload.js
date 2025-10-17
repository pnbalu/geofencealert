import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  getGeofences: () => ipcRenderer.invoke('get-geofences'),
  saveGeofences: (data) => ipcRenderer.invoke('save-geofences', data),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  requestLocationPermission: () => ipcRenderer.invoke('request-location-permission'),
  getCurrentLocation: () => ipcRenderer.invoke('get-current-location'),
  getUsers: () => ipcRenderer.invoke('get-users'),
  saveUsers: (data) => ipcRenderer.invoke('save-users', data),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
