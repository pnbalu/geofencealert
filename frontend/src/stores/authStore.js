import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

// Simple password hashing using Web Crypto API (for demo purposes - use proper bcrypt in production)
const hashPassword = async (password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Synchronous wrapper for compatibility
const hashPasswordSync = (password) => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authUser: null,
      isFirstLogin: false,
      loading: false,

      login: async (username, password) => {
        set({ loading: true })
        try {
          // Development mode: bypass login if electronAPI not available
          if (!electronAPI.isAvailable) {
            console.log('⚠️ Development mode: Bypassing login validation')
            const mockUser = {
              id: 'dev-admin',
              name: 'Admin User',
              email: username || 'admin@geofencealert.com',
              username: username || 'admin',
              role: 'admin',
              department: 'management',
              isActive: true,
              isFirstLogin: false,
              createdAt: new Date().toISOString(),
            }

            set({
              isAuthenticated: true,
              authUser: mockUser,
              isFirstLogin: false,
              loading: false,
            })

            toast.success('Login successful (Dev Mode)')
            return true
          }

          const { users } = await electronAPI.getUsers()
          const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.role === 'admin' // Only allow admin users to login
          )

          if (!user) {
            toast.error('User not found or insufficient permissions')
            set({ loading: false })
            return false
          }

          // Check if password matches
          const hashedPassword = hashPasswordSync(password)
          if (user.password !== hashedPassword) {
            toast.error('Invalid credentials')
            set({ loading: false })
            return false
          }

          // Check if this is first login
          const isFirstLogin = user.isFirstLogin || false

          set({
            isAuthenticated: true,
            authUser: user,
            isFirstLogin,
            loading: false,
          })

          toast.success('Login successful')
          return true
        } catch (error) {
          console.error('Login error:', error)
          toast.error('Login failed')
          set({ loading: false })
          return false
        }
      },

      signup: async (username, email, password, organization, phone) => {
        set({ loading: true })
        try {
          // Development mode: bypass signup if electronAPI not available
          if (!electronAPI.isAvailable) {
            console.log('⚠️ Development mode: Bypassing signup validation')
            const mockUser = {
              id: `dev-${Date.now()}`,
              name: username,
              email: email,
              username: username,
              role: 'user',
              department: 'management',
              isActive: true,
              isFirstLogin: false,
              organization: organization,
              phone: phone,
              createdAt: new Date().toISOString(),
            }

            set({
              isAuthenticated: true,
              authUser: mockUser,
              isFirstLogin: false,
              loading: false,
            })

            toast.success('Signup successful (Dev Mode)')
            return true
          }

          // In production, you would call electronAPI to create a new user
          const hashedPassword = hashPasswordSync(password)
          // await electronAPI.createUser({ username, email, password: hashedPassword, organization, phone })

          const newUser = {
            id: `user-${Date.now()}`,
            username,
            email,
            password: hashedPassword,
            organization,
            phone,
            role: 'user',
            isActive: true,
            isFirstLogin: true,
            createdAt: new Date().toISOString(),
          }

          set({
            isAuthenticated: true,
            authUser: newUser,
            isFirstLogin: true,
            loading: false,
          })

          toast.success('Signup successful! Please change your password.')
          return true
        } catch (error) {
          console.error('Signup error:', error)
          toast.error('Signup failed')
          set({ loading: false })
          return false
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        const { authUser } = get()
        if (!authUser) return false

        try {
          // Verify old password
          const hashedOldPassword = hashPasswordSync(oldPassword)
          if (authUser.password !== hashedOldPassword) {
            toast.error('Current password is incorrect')
            return false
          }

          // Update password
          const hashedNewPassword = hashPasswordSync(newPassword)
          await electronAPI.updateUserPassword(authUser.id, hashedNewPassword)

          // Update local state
          const updatedUser = { ...authUser, password: hashedNewPassword, isFirstLogin: false }
          set({ 
            authUser: updatedUser, 
            isFirstLogin: false 
          })

          toast.success('Password changed successfully')
          return true
        } catch (error) {
          console.error('Password change error:', error)
          toast.error('Failed to change password')
          return false
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          authUser: null,
          isFirstLogin: false,
        })
        toast.success('Logged out successfully')
      },

      checkAuth: () => {
        const { isAuthenticated, authUser } = get()
        return isAuthenticated && authUser !== null
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authUser: state.authUser,
        isFirstLogin: state.isFirstLogin,
      }),
    }
  )
)


