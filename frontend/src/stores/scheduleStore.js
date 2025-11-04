import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useScheduleStore = create(
  persist(
    (set, get) => ({
      schedules: [],
      isLoading: false,

      loadSchedules: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getSchedules?.() || { schedules: [] }
          const loadedSchedules = data.schedules || []
          
          set({
            schedules: loadedSchedules,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load schedules:', error)
          set({ isLoading: false })
        }
      },

      saveSchedules: async () => {
        const { schedules } = get()
        try {
          if (electronAPI.saveSchedules) {
            const success = await electronAPI.saveSchedules({ schedules })
            if (!success) {
              throw new Error('Failed to save')
            }
          }
        } catch (error) {
          console.error('Failed to save schedules:', error)
          toast.error('Failed to save schedules')
        }
      },

      addSchedule: (scheduleData) => {
        const newSchedule = {
          ...scheduleData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }))
        
        get().saveSchedules()
        toast.success('Schedule created successfully')
        return newSchedule
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...updates } : schedule
          ),
        }))
        
        get().saveSchedules()
        toast.success('Schedule updated successfully')
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        }))
        
        get().saveSchedules()
        toast.success('Schedule deleted successfully')
      },

      toggleSchedule: (id) => {
        const schedule = get().schedules.find((s) => s.id === id)
        const newEnabledStatus = !schedule?.enabled
        
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, enabled: newEnabledStatus } : s
          ),
        }))
        
        get().saveSchedules()
        toast.success(newEnabledStatus ? 'Schedule activated' : 'Schedule deactivated')
      },

      getScheduleById: (id) => {
        const { schedules } = get()
        return schedules.find((s) => s.id === id)
      },
    }),
    {
      name: 'schedule-storage',
      partialize: (state) => ({
        schedules: state.schedules,
      }),
    }
  )
)

