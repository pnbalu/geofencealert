import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useGroupStore = create(
  persist(
    (set, get) => ({
      groups: [],
      isLoading: false,

      loadGroups: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getGroups?.() || { groups: [] }
          const loadedGroups = data.groups || []
          
          set({
            groups: loadedGroups,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load groups:', error)
          set({ isLoading: false })
        }
      },

      saveGroups: async () => {
        const { groups } = get()
        try {
          if (electronAPI.saveGroups) {
            const success = await electronAPI.saveGroups({ groups })
            if (!success) {
              throw new Error('Failed to save')
            }
          }
        } catch (error) {
          console.error('Failed to save groups:', error)
          toast.error('Failed to save groups')
        }
      },

      addGroup: (groupData) => {
        const newGroup = {
          ...groupData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          groups: [...state.groups, newGroup],
        }))
        
        get().saveGroups()
        toast.success('Group created successfully')
        return newGroup
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...updates } : group
          ),
        }))
        
        get().saveGroups()
        toast.success('Group updated successfully')
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        }))
        
        get().saveGroups()
        toast.success('Group deleted successfully')
      },

      toggleGroup: (id) => {
        const group = get().groups.find((g) => g.id === id)
        const newEnabledStatus = !group?.enabled
        
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, enabled: newEnabledStatus } : g
          ),
        }))
        
        get().saveGroups()
        toast.success(newEnabledStatus ? 'Group activated' : 'Group deactivated')
      },

      getGroupById: (id) => {
        const { groups } = get()
        return groups.find((g) => g.id === id)
      },
    }),
    {
      name: 'group-storage',
      partialize: (state) => ({
        groups: state.groups,
      }),
    }
  )
)

