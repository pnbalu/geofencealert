try {
  console.log('🔧 Loading preload script...')
  
  const { contextBridge, ipcRenderer } = require('electron')

  console.log('✅ Preload script loaded successfully!')

  const electronAPI = {
    getGeofences: () => ipcRenderer.invoke('get-geofences'),
    saveGeofences: (data) => ipcRenderer.invoke('save-geofences', data),
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
    requestLocationPermission: () => ipcRenderer.invoke('request-location-permission'),
    getCurrentLocation: () => ipcRenderer.invoke('get-current-location'),
    getUsers: () => ipcRenderer.invoke('get-users'),
    saveUsers: (data) => ipcRenderer.invoke('save-users', data),
    getOrganizations: () => ipcRenderer.invoke('get-organizations'),
    saveOrganizations: (data) => ipcRenderer.invoke('save-organizations', data),
    updateUserPassword: (userId, hashedPassword) => ipcRenderer.invoke('update-user-password', userId, hashedPassword),
    getEmployees: () => ipcRenderer.invoke('get-employees'),
    saveEmployees: (data) => ipcRenderer.invoke('save-employees', data),
    getTimesheets: () => ipcRenderer.invoke('get-timesheets'),
    saveTimesheets: (data) => ipcRenderer.invoke('save-timesheets', data),
    getGroups: () => ipcRenderer.invoke('get-groups'),
    saveGroups: (data) => ipcRenderer.invoke('save-groups', data),
    getSchedules: () => ipcRenderer.invoke('get-schedules'),
    saveSchedules: (data) => ipcRenderer.invoke('save-schedules', data),
  }

  contextBridge.exposeInMainWorld('electronAPI', electronAPI)

  console.log('✅ electronAPI exposed to renderer!')
} catch (error) {
  console.error('❌ Error loading preload script:', error)
}
