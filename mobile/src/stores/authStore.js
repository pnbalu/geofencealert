import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  hasCode: false,
  employee: null,
  code: null,
  updateFrequency: 300, // Default 5 minutes in seconds
  schedule: null,

  login: async (username, password) => {
    try {
      // API call to authenticate
      const response = await fetch('YOUR_API_URL/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        set({ isAuthenticated: true })
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  },

  setCode: async (code) => {
    try {
      // Mock: For now, just set some basic employee data
      set({ 
        code,
        hasCode: true,
        employee: {
          id: 'EMP001',
          name: 'Demo Employee',
          role: 'Developer',
          status: 'Inside'
        },
        updateFrequency: 300,
        schedule: {
          startTime: '09:00',
          endTime: '18:00',
          daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      })
      return true
    } catch (error) {
      console.error('Code setup error:', error)
      return false
    }
  },

  requestCodeFromAdmin: async (message) => {
    try {
      const response = await fetch('YOUR_API_URL/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      return response.ok
    } catch (error) {
      console.error('Request code error:', error)
      return false
    }
  },

  logout: async () => {
    set({ 
      isAuthenticated: false,
      hasCode: false,
      employee: null,
      code: null
    })
  },
}))

