// Utility to safely access electronAPI
export const electronAPI = {
  get isAvailable() {
    const available = typeof window !== 'undefined' && window.electronAPI
    if (!available && typeof window !== 'undefined') {
      console.log('⚠️ electronAPI check failed:', {
        windowType: typeof window,
        hasElectronAPI: typeof window.electronAPI,
        userAgent: navigator?.userAgent?.substring(0, 50)
      })
    }
    return available
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
  },

  async getUsers() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty users')
      return { users: [], currentUser: null }
    }
    return window.electronAPI.getUsers()
  },

  async saveUsers(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping user save')
      return true
    }
    return window.electronAPI.saveUsers(data)
  },

  async getOrganizations() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty organizations')
      return { organizations: [], currentOrganization: null }
    }
    return window.electronAPI.getOrganizations()
  },

  async saveOrganizations(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping organization save')
      return true
    }
    return window.electronAPI.saveOrganizations(data)
  },

  async updateUserPassword(userId, hashedPassword) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping password update')
      return true
    }
    return window.electronAPI.updateUserPassword(userId, hashedPassword)
  },

  async getEmployees() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty employees')
      return { employees: [] }
    }
    return window.electronAPI.getEmployees()
  },

  async saveEmployees(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping employee save')
      return true
    }
    return window.electronAPI.saveEmployees(data)
  },

  async getTimesheets() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty timesheets')
      return { timesheets: [] }
    }
    return window.electronAPI.getTimesheets()
  },

  async saveTimesheets(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping timesheet save')
      return true
    }
    return window.electronAPI.saveTimesheets(data)
  },

  async getGroups() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty groups')
      return { groups: [] }
    }
    return window.electronAPI.getGroups?.() || { groups: [] }
  },

  async saveGroups(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping group save')
      return true
    }
    return window.electronAPI.saveGroups?.(data) || true
  },

  async getSchedules() {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, returning empty schedules')
      return { schedules: [] }
    }
    return window.electronAPI.getSchedules?.() || { schedules: [] }
  },

  async saveSchedules(data) {
    if (!this.isAvailable) {
      console.warn('electronAPI not available, skipping schedule save')
      return true
    }
    return window.electronAPI.saveSchedules?.(data) || true
  }
}
