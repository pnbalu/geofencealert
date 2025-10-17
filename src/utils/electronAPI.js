// Utility to safely access electronAPI
export const electronAPI = {
  get isAvailable() {
    return typeof window !== 'undefined' && window.electronAPI
  },

  async getGeofences() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty data')
      return { geofences: [], alerts: [] }
    }
    return window.electronAPI.getGeofences()
  },

  async saveGeofences(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping save')
      return true
    }
    return window.electronAPI.saveGeofences(data)
  },

  async showNotification(title, body) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping notification')
      return
    }
    return window.electronAPI.showNotification(title, body)
  },

  async requestLocationPermission() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping permission request')
      return true
    }
    return window.electronAPI.requestLocationPermission()
  },

  async getCurrentLocation() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning mock location')
      return {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        accuracy: 10,
        timestamp: Date.now()
      }
    }
    return window.electronAPI.getCurrentLocation()
  }
}
