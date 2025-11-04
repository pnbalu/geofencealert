import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useTimesheetStore = create(
  persist(
    (set, get) => ({
      timesheets: [],
      isLoading: false,

      loadTimesheets: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getTimesheets()
          set({
            timesheets: data.timesheets || [],
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load timesheets:', error)
          set({
            timesheets: [],
            isLoading: false,
          })
        }
      },

      saveTimesheets: async () => {
        const { timesheets } = get()
        try {
          const success = await electronAPI.saveTimesheets({ timesheets })
          if (!success) {
            throw new Error('Failed to save')
          }
        } catch (error) {
          console.error('Failed to save timesheets:', error)
          toast.error('Failed to save timesheets')
        }
      },

      addTimesheetEntry: (entry) => {
        const newEntry = {
          ...entry,
          timestamp: entry.timestamp || Date.now(),
        }

        set((state) => ({
          timesheets: [newEntry, ...state.timesheets],
        }))

        get().saveTimesheets()
      },

      deleteTimesheetEntry: (index) => {
        set((state) => ({
          timesheets: state.timesheets.filter((_, i) => i !== index),
        }))

        get().saveTimesheets()
        toast.success('Timesheet entry deleted')
      },

      clearTimesheets: () => {
        set({ timesheets: [] })
        get().saveTimesheets()
        toast.success('Timesheets cleared')
      },
    }),
    {
      name: 'timesheet-storage',
      partialize: (state) => ({
        timesheets: state.timesheets,
      }),
    }
  )
)

