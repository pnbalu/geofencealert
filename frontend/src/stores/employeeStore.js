import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { electronAPI } from '../utils/electronAPI'

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,

      loadEmployees: async () => {
        set({ isLoading: true })
        try {
          const data = await electronAPI.getEmployees()
          const loadedEmployees = data.employees || []
          
          // Initialize with seed employees if none exist
          if (loadedEmployees.length === 0) {
            const seedEmployees = [
              { id: 'E-101', name: 'Alex Rivera', role: 'Field Tech', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 42, battery: 87, isActive: true },
              { id: 'E-102', name: 'Priya Shah', role: 'Ops Lead', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 5, battery: 62, isActive: true },
              { id: 'E-103', name: 'Sam Chen', role: 'Driver', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 10, battery: 54, isActive: true },
              { id: 'E-104', name: 'Taylor Brooks', role: 'Warehouse', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 2, battery: 73, isActive: true },
              { id: 'E-105', name: 'Michael Johnson', role: 'Supervisor', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 120, battery: 45, isActive: false },
              { id: 'E-106', name: 'Sarah Martinez', role: 'Analyst', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 8, battery: 91, isActive: true },
              { id: 'E-107', name: 'David Kim', role: 'Technician', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 35, battery: 38, isActive: false },
              { id: 'E-108', name: 'Emily Wilson', role: 'Manager', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 3, battery: 88, isActive: true },
              { id: 'E-109', name: 'James Brown', role: 'Engineer', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 15, battery: 67, isActive: true },
              { id: 'E-110', name: 'Lisa Anderson', role: 'Coordinator', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 4, battery: 72, isActive: true },
            ]
            set({
              employees: seedEmployees,
              isLoading: false,
            })
            await get().saveEmployees()
          } else {
            set({
              employees: loadedEmployees,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Failed to load employees:', error)
          // Initialize with seed employees if none exist
          if (get().employees.length === 0) {
            const seedEmployees = [
              { id: 'E-101', name: 'Alex Rivera', role: 'Field Tech', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 42, battery: 87, isActive: true },
              { id: 'E-102', name: 'Priya Shah', role: 'Ops Lead', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 5, battery: 62, isActive: true },
              { id: 'E-103', name: 'Sam Chen', role: 'Driver', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 10, battery: 54, isActive: true },
              { id: 'E-104', name: 'Taylor Brooks', role: 'Warehouse', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 2, battery: 73, isActive: true },
              { id: 'E-105', name: 'Michael Johnson', role: 'Supervisor', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 120, battery: 45, isActive: false },
              { id: 'E-106', name: 'Sarah Martinez', role: 'Analyst', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 8, battery: 91, isActive: true },
              { id: 'E-107', name: 'David Kim', role: 'Technician', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 35, battery: 38, isActive: false },
              { id: 'E-108', name: 'Emily Wilson', role: 'Manager', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 3, battery: 88, isActive: true },
              { id: 'E-109', name: 'James Brown', role: 'Engineer', status: 'Outside', lastSeen: Date.now() - 1000 * 60 * 15, battery: 67, isActive: true },
              { id: 'E-110', name: 'Lisa Anderson', role: 'Coordinator', status: 'Inside', lastSeen: Date.now() - 1000 * 60 * 4, battery: 72, isActive: true },
            ]
            set({
              employees: seedEmployees,
              isLoading: false,
            })
            await get().saveEmployees()
          } else {
            set({ isLoading: false })
          }
        }
      },

      saveEmployees: async () => {
        const { employees } = get()
        try {
          const success = await electronAPI.saveEmployees({ employees })
          if (!success) {
            throw new Error('Failed to save')
          }
        } catch (error) {
          console.error('Failed to save employees:', error)
          toast.error('Failed to save employees')
        }
      },

      addEmployee: (employeeData) => {
        const newEmployee = {
          ...employeeData,
          id: employeeData.id || `E-${Date.now()}`,
          status: employeeData.status || 'Outside',
          battery: employeeData.battery || 100,
          lastSeen: Date.now(),
        }

        set((state) => ({
          employees: [...state.employees, newEmployee],
        }))

        get().saveEmployees()
        toast.success('Employee added successfully')
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          ),
        }))

        get().saveEmployees()
        toast.success('Employee updated successfully')
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        }))

        get().saveEmployees()
        toast.success('Employee deleted successfully')
      },

      updateEmployeeStatus: (id, status) => {
        const now = Date.now()
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, status, lastSeen: now } : emp
          ),
        }))

        get().saveEmployees()
      },

      getEmployeeById: (id) => {
        const { employees } = get()
        return employees.find((emp) => emp.id === id)
      },

      toggleEmployeeActive: (id) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, isActive: !emp.isActive } : emp
          ),
        }))

        get().saveEmployees()
        const emp = get().employees.find((e) => e.id === id)
        toast.success(`${emp.name} is now ${emp.isActive ? 'active' : 'inactive'}`)
      },
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        employees: state.employees,
      }),
    }
  )
)

