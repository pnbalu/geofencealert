import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Edit, Trash2, UserPlus, UserMinus, Search, Filter,
  Save, X, Building2, CheckCircle, XCircle, Power, Calendar, Sun, Moon
} from 'lucide-react'
import { useEmployeeStore } from '../stores/employeeStore'
import { useGroupStore } from '../stores/groupStore'
import toast from 'react-hot-toast'

export const Groups = () => {
  const { employees } = useEmployeeStore()
  const { 
    groups, 
    loadGroups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    toggleGroup 
  } = useGroupStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
    enabled: true,
    workSchedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  })

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = statusFilter === 'all' || 
        (statusFilter === 'enabled' && group.enabled) ||
        (statusFilter === 'disabled' && !group.enabled)
      return matchesSearch && matchesType
    })
  }, [groups, searchQuery, statusFilter])

  const stats = {
    total: groups.length,
    enabled: groups.filter(g => g.enabled).length,
    disabled: groups.filter(g => !g.enabled).length,
    totalMembers: groups.reduce((sum, g) => sum + g.members.length, 0),
  }

  const handleStartAdd = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      description: '',
      members: [],
      enabled: true,
      workSchedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    })
    setShowForm(true)
  }

  const handleStartEdit = (group) => {
    setEditingGroup(group)
    setFormData({
      ...group,
      workSchedule: group.workSchedule || {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    })
    setShowForm(true)
  }

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, formData)
    } else {
      addGroup(formData)
    }

    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(id)
    }
  }

  const handleToggleEnabled = (id) => {
    toggleGroup(id)
  }

  const toggleMember = (empId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(empId)
        ? prev.members.filter(id => id !== empId)
        : [...prev.members, empId]
    }))
  }

  const toggleAllMembers = () => {
    const activeEmployees = employees.filter(e => e.isActive !== false)
    const allSelected = activeEmployees.every(emp => formData.members.includes(emp.id))
    
    setFormData(prev => ({
      ...prev,
      members: allSelected ? [] : activeEmployees.map(emp => emp.id)
    }))
  }

  const getMemberNames = (memberIds) => {
    return employees
      .filter(emp => memberIds.includes(emp.id))
      .map(emp => emp.name)
      .join(', ')
  }

  const toggleDay = (day) => {
    const updatedDays = formData.workSchedule.daysOfWeek.includes(day)
      ? formData.workSchedule.daysOfWeek.filter(d => d !== day)
      : [...formData.workSchedule.daysOfWeek, day]
    setFormData({
      ...formData,
      workSchedule: { ...formData.workSchedule, daysOfWeek: updatedDays }
    })
  }

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-cyan-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Groups Management
            </h1>
            <div className="relative">
              <motion.div
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-teal-500 rounded-full blur-md"
              />
              <Users className="h-7 w-7 text-teal-600 relative z-10" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create and manage groups of employees for easier assignment to geofences and alerts
          </p>
        </div>
        
        <button
          onClick={handleStartAdd}
          className="btn btn-primary gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Group</span>
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="card shadow-lg border-0 bg-gradient-to-br from-teal-500 to-cyan-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm opacity-90">Total Groups</span>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm opacity-90">Active</span>
            </div>
            <div className="text-3xl font-bold">{stats.enabled}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-gray-500 to-slate-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-sm opacity-90">Inactive</span>
            </div>
            <div className="text-3xl font-bold">{stats.disabled}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm opacity-90">Total Members</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalMembers}</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="enabled">Active</option>
            <option value="disabled">Inactive</option>
          </select>
        </div>
      </motion.div>

      {/* Groups List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                All Groups
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No groups found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Create your first group to organize employees for geofence and alert assignments.
              </p>
            </div>
          ) : (
            filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 dark:hover:from-teal-900/10 dark:hover:to-cyan-900/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        group.enabled
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                          : 'bg-gradient-to-br from-gray-400 to-slate-500'
                      }`}>
                        {group.enabled ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {group.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {group.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {group.enabled ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-outline">Inactive</span>
                          )}
                          <span className="badge badge-default">
                            <UserPlus className="h-3 w-3 mr-1" />
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </span>
                          {group.workSchedule?.enabled && (
                            <span className="badge" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', color: 'white' }}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {group.members.length > 0 && (
                      <div className="ml-13 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Members:</span>
                          <span className="text-xs">{getMemberNames(group.members)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEnabled(group.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        group.enabled
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={group.enabled ? 'Disable' : 'Enable'}
                    >
                      {group.enabled ? (
                        <Power className="h-5 w-5" />
                      ) : (
                        <Power className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleStartEdit(group)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {editingGroup ? 'Edit Group' : 'Create Group'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Group Name */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Group Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Management Team, Field Operations"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description for this group..."
                  />
                </div>

                {/* Members */}
                <div>
                  <label className="label flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    Members
                  </label>
                  <div className="card p-4 bg-gray-50 dark:bg-gray-800/50">
                    {employees.filter(e => e.isActive !== false).length > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={employees.filter(e => e.isActive !== false).every(emp => formData.members.includes(emp.id))}
                            onChange={toggleAllMembers}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-medium text-sm">
                            Select All ({formData.members.length}/{employees.filter(e => e.isActive !== false).length})
                          </span>
                        </label>
                      </div>
                    )}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {employees.filter(e => e.isActive !== false).map((emp) => (
                        <label
                          key={emp.id}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.members.includes(emp.id)}
                            onChange={() => toggleMember(emp.id)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {emp.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{emp.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Work Schedule Section */}
                <div className="border-t pt-6 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Work Schedule
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Enable Tracking Schedule</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          workSchedule: { ...formData.workSchedule, enabled: !formData.workSchedule.enabled }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.workSchedule.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.workSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {formData.workSchedule.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label flex items-center gap-2 mb-2">
                            <Sun className="h-4 w-4" />
                            Start Time
                          </label>
                          <input
                            type="time"
                            className="input"
                            value={formData.workSchedule.startTime}
                            onChange={(e) => setFormData({
                              ...formData,
                              workSchedule: { ...formData.workSchedule, startTime: e.target.value }
                            })}
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
                            value={formData.workSchedule.endTime}
                            onChange={(e) => setFormData({
                              ...formData,
                              workSchedule: { ...formData.workSchedule, endTime: e.target.value }
                            })}
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
                                formData.workSchedule.daysOfWeek.includes(day)
                                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Only track this group during scheduled hours
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Group
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

