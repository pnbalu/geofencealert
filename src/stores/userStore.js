import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,

      loadUsers: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getUsers()
          set({
            users: data.users || [],
            currentUser: data.currentUser || null,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load users:', error)
          toast.error('Failed to load users')
          set({ isLoading: false })
        }
      },

      saveUsers: async () => {
        const { users, currentUser } = get()
        try {
          const success = await electronAPI.saveUsers({
            users,
            currentUser,
          })
          if (!success) {
            throw new Error('Failed to save')
          }
        } catch (error) {
          console.error('Failed to save users:', error)
          toast.error('Failed to save users')
        }
      },

      addUser: (userData) => {
        const newUser = {
          ...userData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          isActive: true,
        }
        
        set((state) => ({
          users: [...state.users, newUser],
        }))
        
        get().saveUsers()
        toast.success('User added successfully')
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }))
        
        get().saveUsers()
        toast.success('User updated successfully')
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
        }))
        
        get().saveUsers()
        toast.success('User deleted successfully')
      },

      setCurrentUser: (user) => {
        set({ currentUser: user })
        get().saveUsers()
      },

      toggleUserStatus: (id) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, isActive: !user.isActive } : user
          ),
        }))
        
        get().saveUsers()
      },

      assignUserToGeofence: (userId, geofenceId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  assignedGeofences: [...(user.assignedGeofences || []), geofenceId],
                }
              : user
          ),
        }))
        
        get().saveUsers()
        toast.success('User assigned to geofence')
      },

      unassignUserFromGeofence: (userId, geofenceId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  assignedGeofences: (user.assignedGeofences || []).filter(
                    (id) => id !== geofenceId
                  ),
                }
              : user
          ),
        }))
        
        get().saveUsers()
        toast.success('User unassigned from geofence')
      },

      getUsersByGeofence: (geofenceId) => {
        const { users } = get()
        return users.filter((user) =>
          user.assignedGeofences?.includes(geofenceId)
        )
      },

      getActiveUsers: () => {
        const { users } = get()
        return users.filter((user) => user.isActive)
      },

      getUserById: (id) => {
        const { users } = get()
        return users.find((user) => user.id === id)
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
)
