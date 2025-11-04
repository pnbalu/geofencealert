import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useOrganizationStore = create(
  persist(
    (set, get) => ({
      organizations: [],
      currentOrganization: null,
      isLoading: false,

      loadOrganizations: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getOrganizations()
          set({
            organizations: data.organizations || [],
            currentOrganization: data.currentOrganization || null,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load organizations:', error)
          // Initialize with default organization if none exists
          if (get().organizations.length === 0) {
            const defaultOrg = {
              id: crypto.randomUUID(),
              name: 'Default Organization',
              createdAt: new Date().toISOString(),
              settings: {
                allowSelfRegistration: false,
                requireEmailVerification: false,
              },
            }
            set({ 
              organizations: [defaultOrg],
              currentOrganization: defaultOrg,
              isLoading: false,
            })
            await get().saveOrganizations()
          }
        }
      },

      saveOrganizations: async () => {
        const { organizations, currentOrganization } = get()
        try {
          const success = await electronAPI.saveOrganizations({
            organizations,
            currentOrganization,
          })
          if (!success) {
            throw new Error('Failed to save')
          }
        } catch (error) {
          console.error('Failed to save organizations:', error)
          toast.error('Failed to save organizations')
        }
      },

      createOrganization: (orgData) => {
        const newOrg = {
          ...orgData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          settings: {
            allowSelfRegistration: false,
            requireEmailVerification: false,
            ...orgData.settings,
          },
        }
        
        set((state) => ({
          organizations: [...state.organizations, newOrg],
          currentOrganization: newOrg,
        }))
        
        get().saveOrganizations()
        toast.success('Organization created successfully')
      },

      updateOrganization: (id, updates) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates } : org
          ),
          currentOrganization: state.currentOrganization?.id === id
            ? { ...state.currentOrganization, ...updates }
            : state.currentOrganization,
        }))
        
        get().saveOrganizations()
        toast.success('Organization updated successfully')
      },

      setCurrentOrganization: (org) => {
        set({ currentOrganization: org })
        get().saveOrganizations()
      },

      getOrganizationById: (id) => {
        const { organizations } = get()
        return organizations.find((org) => org.id === id)
      },
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        organizations: state.organizations,
        currentOrganization: state.currentOrganization,
      }),
    }
  )
)

