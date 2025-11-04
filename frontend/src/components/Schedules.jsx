import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Plus, Edit, Trash2, Search,
  Save, X, Sun, Moon, CheckCircle, XCircle, Power,
  Users
} from 'lucide-react'
import { useScheduleStore } from '../stores/scheduleStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useGroupStore } from '../stores/groupStore'
import toast from 'react-hot-toast'

export const Schedules = () => {
  const { 
    schedules, 
    loadSchedules, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule, 
    toggleSchedule 
  } = useScheduleStore()
  const { employees } = useEmployeeStore()
  const { groups } = useGroupStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    enabled: true,
    assignedEmployees: [],
    assignedGroups: [],
  })
  const [assignmentMode, setAssignmentMode] = useState('employees') // 'employees' or 'groups'

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch = schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           schedule.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = statusFilter === 'all' || 
        (statusFilter === 'enabled' && schedule.enabled) ||
        (statusFilter === 'disabled' && !schedule.enabled)
      return matchesSearch && matchesType
    })
  }, [schedules, searchQuery, statusFilter])

  const stats = {
    total: schedules.length,
    enabled: schedules.filter(s => s.enabled).length,
    disabled: schedules.filter(s => !s.enabled).length,
  }

  const handleStartAdd = () => {
    setEditingSchedule(null)
    setFormData({
      name: '',
      description: '',
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      enabled: true,
      assignedEmployees: [],
      assignedGroups: [],
    })
    setShowForm(true)
  }

  const handleStartEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      name: schedule.name || '',
      description: schedule.description || '',
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '17:00',
      daysOfWeek: schedule.daysOfWeek || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      enabled: schedule.enabled !== false,
      assignedEmployees: schedule.assignedEmployees || [],
      assignedGroups: schedule.assignedGroups || [],
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Schedule name is required')
      return
    }

    try {
      if (editingSchedule) {
        updateSchedule(editingSchedule.id, formData)
        toast.success('Schedule updated successfully')
      } else {
        addSchedule(formData)
        toast.success('Schedule created successfully')
      }
      setShowForm(false)
      setEditingSchedule(null)
    } catch (error) {
      toast.error('Failed to save schedule')
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(id)
      toast.success('Schedule deleted successfully')
    }
  }

  const handleToggleEnabled = (id) => {
    toggleSchedule(id)
  }

  const toggleDay = (day) => {
    const updatedDays = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day]
    setFormData({
      ...formData,
      daysOfWeek: updatedDays
    })
  }

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleToggleEmployee = (employeeId) => {
    setFormData({
      ...formData,
      assignedEmployees: formData.assignedEmployees.includes(employeeId)
        ? formData.assignedEmployees.filter(id => id !== employeeId)
        : [...formData.assignedEmployees, employeeId]
    })
  }

  const handleToggleGroup = (groupId) => {
    setFormData({
      ...formData,
      assignedGroups: formData.assignedGroups.includes(groupId)
        ? formData.assignedGroups.filter(id => id !== groupId)
        : [...formData.assignedGroups, groupId]
    })
  }

  const handleToggleAllEmployees = () => {
    const activeEmployees = employees.filter(e => e.isActive !== false)
    const allSelected = activeEmployees.length > 0 && activeEmployees.every(emp => formData.assignedEmployees.includes(emp.id))
    
    setFormData({
      ...formData,
      assignedEmployees: allSelected ? [] : activeEmployees.map(emp => emp.id)
    })
  }

  const handleToggleAllGroups = () => {
    const activeGroups = groups.filter(g => g.enabled)
    const allSelected = activeGroups.length > 0 && activeGroups.every(group => formData.assignedGroups.includes(group.id))
    
    setFormData({
      ...formData,
      assignedGroups: allSelected ? [] : activeGroups.map(group => group.id)
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Schedules
            </h1>
            <div className="relative">
              <motion.div
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -right-2 -top-2 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
              />
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage work schedules for your team
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Create Schedule
        </button>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Schedules</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Schedules</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.enabled}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Schedules</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.disabled}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Schedules List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:col-span-1"
        >
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              All Schedules
            </h3>
            <div className="flex items-center gap-2">
              <select
                className="select w-32"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="enabled">Active</option>
                <option value="disabled">Inactive</option>
              </select>
              <button onClick={handleStartAdd} className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No schedules found.</div>
            ) : (
              filteredSchedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{schedule.name}</p>
                    <p className="text-sm text-gray-500">{schedule.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    <p className="text-xs text-gray-400">
                      {schedule.daysOfWeek.map(d => d.slice(0, 3)).join(', ')}
                    </p>
                    {(schedule.assignedEmployees?.length > 0 || schedule.assignedGroups?.length > 0) && (
                      <div className="flex items-center gap-2 mt-1">
                        {schedule.assignedEmployees?.length > 0 && (
                          <span className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                            {schedule.assignedEmployees.length} employee{schedule.assignedEmployees.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {schedule.assignedGroups?.length > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                            {schedule.assignedGroups.length} group{schedule.assignedGroups.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {schedule.enabled ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                    <button 
                      onClick={() => handleToggleEnabled(schedule.id)} 
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Power className={`h-5 w-5 ${schedule.enabled ? 'text-green-600' : 'text-red-600'}`} />
                    </button>
                    <button 
                      onClick={() => handleStartEdit(schedule)} 
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleDelete(schedule.id)} 
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Schedule Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                  {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingSchedule(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Schedule Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Shift, Weekend Coverage"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the schedule"
                    rows="2"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label flex items-center gap-2 mb-2">
                      <Moon className="h-4 w-4" />
                      End Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label mb-2">Working Days</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          formData.daysOfWeek.includes(day)
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assign Employees/Groups */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Assign To</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('employees')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          assignmentMode === 'employees'
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Employees
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('groups')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          assignmentMode === 'groups'
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Groups
                      </button>
                    </div>
                  </div>
                  
                  {assignmentMode === 'employees' ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Employees
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleAllEmployees}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {employees.filter(e => e.isActive !== false).every(emp => formData.assignedEmployees.includes(emp.id)) 
                            ? 'Deselect All' 
                            : 'Select All'}
                        </button>
                      </div>
                      {employees.filter(e => e.isActive !== false).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No active employees found.</p>
                      ) : (
                        employees.filter(e => e.isActive !== false).map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assignedEmployees.includes(emp.id)}
                              onChange={() => handleToggleEmployee(emp.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{emp.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">{emp.role}</span>
                          </label>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Groups
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleAllGroups}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {groups.filter(g => g.enabled).every(group => formData.assignedGroups.includes(group.id)) 
                            ? 'Deselect All' 
                            : 'Select All'}
                        </button>
                      </div>
                      {groups.filter(g => g.enabled).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No active groups found.</p>
                      ) : (
                        groups.filter(g => g.enabled).map(group => (
                          <label key={group.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assignedGroups.includes(group.id)}
                              onChange={() => handleToggleGroup(group.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">{group.members?.length || 0} members</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="label mb-0">Schedule Status</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formData.enabled ? 'Active' : 'Inactive'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingSchedule(null)
                    }} 
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} className="btn btn-primary flex-1">
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
