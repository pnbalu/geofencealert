import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Settings, Plus, Edit, Trash2, Users, AlertTriangle, 
  MapPin, Clock, CheckCircle, XCircle, Save, X, Search, Filter,
  Radio, ToggleLeft, ToggleRight, Building2, Zap, UserCheck
} from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useGroupStore } from '../stores/groupStore'
import toast from 'react-hot-toast'

export const AlertConfiguration = () => {
  const { geofences } = useGeofenceStore()
  const { employees } = useEmployeeStore()
  const { groups, loadGroups } = useGroupStore()
  const [alertConfigs, setAlertConfigs] = useState([
    {
      id: '1',
      name: 'Off-Hours Entry Alert',
      geofenceId: null,
      condition: 'enter', // enter, exit, both
      timeCondition: {
        enabled: true,
        startDate: '',
        endDate: '',
        start: '17:00',
        end: '09:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      recipients: [],
      assignedGroups: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'VIP Area Access',
      geofenceId: null,
      condition: 'both',
      timeCondition: {
        enabled: false,
        startDate: '',
        endDate: '',
        start: '09:00',
        end: '17:00',
        days: [],
      },
      recipients: [],
      assignedGroups: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    },
  ])
  
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [assignmentMode, setAssignmentMode] = useState('users') // 'users' or 'groups'
  const [formData, setFormData] = useState({
    name: '',
    geofenceId: '',
    condition: 'both',
    timeCondition: {
      enabled: false,
      startDate: '',
      endDate: '',
      start: '09:00',
      end: '17:00',
      days: [],
    },
    recipients: [],
    assignedGroups: [],
    enabled: true,
  })

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const filteredConfigs = useMemo(() => {
    return alertConfigs.filter(config => {
      const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'enabled' && config.enabled) ||
        (typeFilter === 'disabled' && !config.enabled)
      return matchesSearch && matchesType
    })
  }, [alertConfigs, searchQuery, typeFilter])

  const handleStartAdd = () => {
    setEditingConfig(null)
    setFormData({
      name: '',
      geofenceId: '',
      condition: 'both',
      timeCondition: {
        enabled: false,
        startDate: '',
        endDate: '',
        start: '09:00',
        end: '17:00',
        days: [],
      },
      recipients: [],
      assignedGroups: [],
      enabled: true,
    })
    setShowForm(true)
  }

  const handleStartEdit = (config) => {
    setEditingConfig(config)
    setFormData(config)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Alert name is required')
      return
    }

    if (!formData.geofenceId) {
      toast.error('Please select a geofence')
      return
    }

    if (formData.recipients.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }

    const configToSave = {
      ...formData,
      id: editingConfig ? editingConfig.id : crypto.randomUUID(),
      createdAt: editingConfig ? editingConfig.createdAt : new Date().toISOString(),
    }

    if (editingConfig) {
      setAlertConfigs(prev => prev.map(c => c.id === editingConfig.id ? configToSave : c))
      toast.success('Alert configuration updated! 🎉')
    } else {
      setAlertConfigs(prev => [configToSave, ...prev])
      toast.success('Alert configuration created! 🎉')
    }

    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this alert configuration?')) {
      setAlertConfigs(prev => prev.filter(c => c.id !== id))
      toast.success('Alert configuration deleted')
    }
  }

  const handleToggleEnabled = (id) => {
    setAlertConfigs(prev =>
      prev.map(c =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    )
    const config = alertConfigs.find(c => c.id === id)
    toast.success(`Alert configuration ${!config.enabled ? 'enabled' : 'disabled'}`)
  }

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      timeCondition: {
        ...prev.timeCondition,
        days: prev.timeCondition.days.includes(day)
          ? prev.timeCondition.days.filter(d => d !== day)
          : [...prev.timeCondition.days, day]
      }
    }))
  }

  const toggleRecipient = (empId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(empId)
        ? prev.recipients.filter(id => id !== empId)
        : [...prev.recipients, empId]
    }))
  }

  const toggleAllRecipients = () => {
    const activeEmployees = employees.filter(e => e.isActive !== false)
    const allSelected = activeEmployees.every(emp => formData.recipients.includes(emp.id))
    
    setFormData(prev => ({
      ...prev,
      recipients: allSelected ? [] : activeEmployees.map(emp => emp.id)
    }))
  }

  const toggleGroup = (groupId) => {
    setFormData(prev => ({
      ...prev,
      assignedGroups: prev.assignedGroups.includes(groupId)
        ? prev.assignedGroups.filter(id => id !== groupId)
        : [...prev.assignedGroups, groupId]
    }))
  }

  const toggleAllGroups = () => {
    const activeGroups = groups.filter(g => g.enabled)
    const allSelected = activeGroups.every(group => formData.assignedGroups.includes(group.id))
    
    setFormData(prev => ({
      ...prev,
      assignedGroups: allSelected ? [] : activeGroups.map(group => group.id)
    }))
  }

  const getGeofenceName = (geofenceId) => {
    const geofence = geofences.find(gf => gf.id === geofenceId)
    return geofence?.name || 'Unknown Geofence'
  }

  const getRecipientNames = (recipientIds) => {
    return employees
      .filter(emp => recipientIds.includes(emp.id))
      .map(emp => emp.name)
      .join(', ')
  }

  const stats = {
    total: alertConfigs.length,
    enabled: alertConfigs.filter(c => c.enabled).length,
    disabled: alertConfigs.filter(c => !c.enabled).length,
    withTimeCondition: alertConfigs.filter(c => c.timeCondition.enabled).length,
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Alert Configuration
            </h1>
            <div className="relative">
              <motion.div
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500 rounded-full blur-md"
              />
              <Settings className="h-7 w-7 text-purple-600 relative z-10" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure alerts with conditions and assign notification recipients
          </p>
        </div>
        
        <button
          onClick={handleStartAdd}
          className="btn btn-primary gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Alert</span>
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="card shadow-lg border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4" />
              <span className="text-sm opacity-90">Total Alerts</span>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <ToggleRight className="h-4 w-4" />
              <span className="text-sm opacity-90">Enabled</span>
            </div>
            <div className="text-3xl font-bold">{stats.enabled}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-gray-500 to-slate-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <ToggleLeft className="h-4 w-4" />
              <span className="text-sm opacity-90">Disabled</span>
            </div>
            <div className="text-3xl font-bold">{stats.disabled}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm opacity-90">Time Based</span>
            </div>
            <div className="text-3xl font-bold">{stats.withTimeCondition}</div>
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
          <Filter className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="select" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </motion.div>

      {/* Alert Configurations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Configured Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredConfigs.length} configuration{filteredConfigs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No alert configurations
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Create your first alert configuration to notify users about geofence events.
              </p>
            </div>
          ) : (
            filteredConfigs.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        config.enabled
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-gray-400 to-slate-500'
                      }`}>
                        {config.enabled ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {config.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge type={config.condition} />
                          {config.timeCondition.enabled && (
                            <span className="badge badge-default">
                              <Clock className="h-3 w-3 mr-1" />
                              Time-based
                            </span>
                          )}
                          {!config.enabled && (
                            <span className="badge badge-outline">Disabled</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 ml-13">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Geofence:</span>
                        <span>{getGeofenceName(config.geofenceId)}</span>
                      </div>
                      {config.timeCondition.enabled && (
                        <>
                          {(config.timeCondition.startDate || config.timeCondition.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Date Range:</span>
                              <span>
                                {config.timeCondition.startDate || 'Start'} - {config.timeCondition.endDate || 'End'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Time:</span>
                            <span>{config.timeCondition.start} - {config.timeCondition.end}</span>
                            {config.timeCondition.days.length > 0 && (
                              <span className="text-xs">
                                ({config.timeCondition.days.length} days)
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Recipients:</span>
                        <span className="text-xs">
                          {config.recipients.length === 0 
                            ? 'No recipients' 
                            : `${config.recipients.length} recipient${config.recipients.length !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      {config.assignedGroups && config.assignedGroups.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Groups:</span>
                          <span className="text-xs">
                            {config.assignedGroups.length} group{config.assignedGroups.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEnabled(config.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        config.enabled
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={config.enabled ? 'Disable' : 'Enable'}
                    >
                      {config.enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleStartEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
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
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {editingConfig ? 'Edit Alert Configuration' : 'Create Alert Configuration'}
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
                {/* Alert Name */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Alert Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Off-Hours Entry Alert"
                  />
                </div>

                {/* Geofence Selection */}
                <div>
                  <label className="label flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Geofence *
                  </label>
                  <select
                    className="select"
                    value={formData.geofenceId}
                    onChange={(e) => setFormData({ ...formData, geofenceId: e.target.value })}
                  >
                    <option value="">Select a geofence...</option>
                    {geofences.map(gf => (
                      <option key={gf.id} value={gf.id}>{gf.name}</option>
                    ))}
                  </select>
                </div>

                {/* Condition Type */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    Trigger Condition *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: 'enter' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.condition === 'enter'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <CheckCircle className={`h-5 w-5 ${formData.condition === 'enter' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-medium">Enter</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: 'exit' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.condition === 'exit'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <AlertTriangle className={`h-5 w-5 ${formData.condition === 'exit' ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className="font-medium">Exit</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: 'both' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.condition === 'both'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <Zap className={`h-5 w-5 ${formData.condition === 'both' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="font-medium">Both</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Time Condition */}
                <div className="card p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="label flex items-center gap-2 mb-0">
                      <Clock className="h-4 w-4" />
                      Time-Based Condition
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        timeCondition: { ...prev.timeCondition, enabled: !prev.timeCondition.enabled }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.timeCondition.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.timeCondition.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.timeCondition.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label text-sm">Start Date</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.timeCondition.startDate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              timeCondition: { ...prev.timeCondition, startDate: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="label text-sm">End Date</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.timeCondition.endDate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              timeCondition: { ...prev.timeCondition, endDate: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      {/* Time Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label text-sm">Start Time</label>
                          <input
                            type="time"
                            className="input"
                            value={formData.timeCondition.start}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              timeCondition: { ...prev.timeCondition, start: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="label text-sm">End Time</label>
                          <input
                            type="time"
                            className="input"
                            value={formData.timeCondition.end}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              timeCondition: { ...prev.timeCondition, end: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label text-sm mb-2">Days of Week</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {weekDays.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                formData.timeCondition.days.includes(day)
                                  ? 'bg-purple-600 text-white shadow-lg'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Recipients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label flex items-center gap-2 mb-0">
                      <Users className="h-4 w-4" />
                      Recipients *
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('users')}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          assignmentMode === 'users'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Users className="h-3 w-3 inline mr-1" />
                        Users
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('groups')}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          assignmentMode === 'groups'
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <UserCheck className="h-3 w-3 inline mr-1" />
                        Groups
                      </button>
                    </div>
                  </div>
                  <div className="card p-4 bg-gray-50 dark:bg-gray-800/50">
                    {assignmentMode === 'users' ? (
                      <>
                        {employees.filter(e => e.isActive !== false).length > 0 && (
                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={employees.filter(e => e.isActive !== false).every(emp => formData.recipients.includes(emp.id))}
                                onChange={toggleAllRecipients}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-medium text-sm">
                                Select All ({formData.recipients.length}/{employees.filter(e => e.isActive !== false).length})
                              </span>
                            </label>
                          </div>
                        )}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {employees.filter(e => e.isActive !== false).map((emp) => (
                            <label
                              key={emp.id}
                              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.recipients.includes(emp.id)}
                                onChange={() => toggleRecipient(emp.id)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      </>
                    ) : (
                      <>
                        {groups.filter(g => g.enabled).length > 0 && (
                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={groups.filter(g => g.enabled).every(group => formData.assignedGroups.includes(group.id))}
                                onChange={toggleAllGroups}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="font-medium text-sm">
                                Select All Groups ({formData.assignedGroups.length}/{groups.filter(g => g.enabled).length})
                              </span>
                            </label>
                          </div>
                        )}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {groups.filter(g => g.enabled).length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No groups available. Create groups from the Groups page.
                            </p>
                          ) : (
                            groups.filter(g => g.enabled).map((group) => (
                              <label
                                key={group.id}
                                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.assignedGroups.includes(group.id)}
                                  onChange={() => toggleGroup(group.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {group.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                    {group.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Configuration
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

// Badge component for alert conditions
const Badge = ({ type }) => {
  const badges = {
    enter: { label: 'Enter Only', className: 'badge-success', icon: CheckCircle },
    exit: { label: 'Exit Only', className: 'badge-danger', icon: AlertTriangle },
    both: { label: 'Enter & Exit', className: 'badge badge-default', icon: Zap },
  }
  const badge = badges[type] || badges.enter
  const Icon = badge.icon

  return (
    <span className={`badge ${badge.className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {badge.label}
    </span>
  )
}

