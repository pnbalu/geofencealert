import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  MapPin,
  Circle,
  Hexagon,
  Power,
  Edit,
  Trash2,
  Plus,
  Grid3x3,
  List,
  X,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  Building2,
  Navigation2,
  Radio,
  Zap,
  Layers,
  Info,
  Activity,
  Target,
  UserCheck,
} from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useGroupStore } from '../stores/groupStore'
import { LiveMap } from './LiveMap'
import toast from 'react-hot-toast'

export const Geofences = () => {
  const [geofenceStatusFilter, setGeofenceStatusFilter] = useState('all')
  const [geofenceTypeFilter, setGeofenceTypeFilter] = useState('all')
  const [geofenceViewMode, setGeofenceViewMode] = useState('grid')
  const [editingGeofence, setEditingGeofence] = useState(null)
  const [selectedUsersForFence, setSelectedUsersForFence] = useState([])
  const [selectedGroupsForFence, setSelectedGroupsForFence] = useState([])
  const [assignmentMode, setAssignmentMode] = useState('users') // 'users' or 'groups'
  const [editFormData, setEditFormData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showUserAssignment, setShowUserAssignment] = useState(false)

  const { 
    geofences, 
    selectedGeofence, 
    selectGeofence, 
    assignUsersToGeofence,
    assignGroupsToGeofence, 
    deleteGeofence, 
    toggleGeofence,
    updateGeofence,
    addGeofence,
  } = useGeofenceStore()
  
  const { employees } = useEmployeeStore()
  const { groups, loadGroups } = useGroupStore()

  // Select first geofence by default when component mounts
  useEffect(() => {
    if (geofences.length > 0 && !selectedGeofence && !editFormData && !showUserAssignment) {
      selectGeofence(geofences[0])
      setSelectedUsersForFence(geofences[0].assignedUsers || [])
    }
  }, [geofences, selectedGeofence, selectGeofence, editFormData, showUserAssignment])

  // Update selected users and groups when geofence changes
  useEffect(() => {
    if (selectedGeofence) {
      setSelectedUsersForFence(selectedGeofence.assignedUsers || [])
      setSelectedGroupsForFence(selectedGeofence.assignedGroups || [])
    }
  }, [selectedGeofence])

  // Load groups on mount
  useEffect(() => {
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectGeofence = (gf) => {
    selectGeofence(gf)
    setSelectedUsersForFence(gf.assignedUsers || [])
    setSelectedGroupsForFence(gf.assignedGroups || [])
    setShowUserAssignment(false)
    setEditFormData(null)
    setEditingGeofence(null)
  }

  const handleGeofenceUpdate = useCallback((id, updates) => {
    updateGeofence(id, updates)
    if (selectedGeofence && selectedGeofence.id === id) {
      const updatedGeofence = { ...selectedGeofence, ...updates }
      selectGeofence(updatedGeofence)
      if (editFormData) {
        setEditFormData({ ...editFormData, ...updates })
      }
    }
  }, [selectedGeofence, editFormData, updateGeofence, selectGeofence])

  const handleFormDataUpdate = useCallback((updates) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, ...updates })
    }
  }, [editFormData])

  const handleStartEdit = (gf) => {
    setEditingGeofence(gf)
    setEditFormData({
      name: gf.name || '',
      type: gf.type || 'circle',
      latitude: gf.center?.lat?.toString() || '',
      longitude: gf.center?.lng?.toString() || '',
      radius: gf.radius?.toString() || '',
      coordinates: gf.coordinates || [],
    })
    setShowUserAssignment(false)
  }

  const handleEditClick = useCallback((geofence) => {
    handleStartEdit(geofence)
  }, [])

  const handleToggleUser = (userId) => {
    setSelectedUsersForFence((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleToggleAllUsers = () => {
    const activeEmployees = employees.filter((e) => e.isActive !== false)
    const allSelected = activeEmployees.length > 0 && activeEmployees.every((emp) => selectedUsersForFence.includes(emp.id))
    
    if (allSelected) {
      setSelectedUsersForFence([])
    } else {
      setSelectedUsersForFence(activeEmployees.map((emp) => emp.id))
    }
  }

  const handleToggleGroup = (groupId) => {
    setSelectedGroupsForFence((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  const handleToggleAllGroups = () => {
    const activeGroups = groups.filter((g) => g.enabled)
    const allSelected = activeGroups.length > 0 && activeGroups.every((group) => selectedGroupsForFence.includes(group.id))
    
    if (allSelected) {
      setSelectedGroupsForFence([])
    } else {
      setSelectedGroupsForFence(activeGroups.map((group) => group.id))
    }
  }

  const handleSaveAssignments = async () => {
    if (!selectedGeofence) return
    
    setIsSaving(true)
    try {
      await assignUsersToGeofence(selectedGeofence.id, selectedUsersForFence)
      await assignGroupsToGeofence(selectedGeofence.id, selectedGroupsForFence)
      toast.success('Assignments saved successfully! 🎉')
    } catch (error) {
      toast.error('Failed to save assignments')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editFormData) return
    
    setIsSaving(true)
    try {
      const geofenceData = {
        name: editFormData.name,
        type: editFormData.type,
        enabled: true,
        assignedUsers: selectedUsersForFence,
      }

      if (editFormData.type === 'circle') {
        const lat = parseFloat(editFormData.latitude)
        const lng = parseFloat(editFormData.longitude)
        const radius = parseFloat(editFormData.radius)
        
        if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
          toast.error('Please provide valid circle parameters (latitude, longitude, and radius > 0)')
          setIsSaving(false)
          return
        }
        
        geofenceData.center = { lat, lng }
        geofenceData.radius = radius
      } else {
        if (!editFormData.coordinates || editFormData.coordinates.length < 3) {
          toast.error('Polygon must have at least 3 points')
          setIsSaving(false)
          return
        }
        geofenceData.coordinates = editFormData.coordinates
      }

      let result
      if (editingGeofence) {
        result = updateGeofence(editingGeofence.id, geofenceData)
        toast.success('Geofence updated successfully! 🎉')
      } else {
        result = addGeofence(geofenceData)
        toast.success('Geofence created successfully! 🎉')
      }
      
      selectGeofence(result)
      setSelectedUsersForFence(result.assignedUsers || [])
      
      setEditingGeofence(null)
      setEditFormData(null)
    } catch (error) {
      toast.error('Failed to save geofence')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingGeofence(null)
    setEditFormData(null)
    if (selectedGeofence) {
      setEditFormData({
        name: selectedGeofence.name || '',
        type: selectedGeofence.type || 'circle',
        latitude: selectedGeofence.center?.lat?.toString() || '',
        longitude: selectedGeofence.center?.lng?.toString() || '',
        radius: selectedGeofence.radius?.toString() || '',
        coordinates: selectedGeofence.coordinates || [],
      })
    }
  }

  const handleStartAdd = useCallback((lat = '', lng = '') => {
    setEditingGeofence(null)
    setEditFormData({
      name: '',
      type: 'circle',
      latitude: lat,
      longitude: lng,
      radius: '',
      coordinates: [],
    })
    setShowUserAssignment(false)
  }, [])

  const handleMapClick = useCallback((lat, lng) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        latitude: lat.toString(),
        longitude: lng.toString(),
      })
    }
  }, [editFormData])

  const handleRightClick = useCallback((lat, lng) => {
    handleStartAdd(lat.toString(), lng.toString())
  }, [handleStartAdd])

  const assignedUsersCount = selectedGeofence?.assignedUsers?.length || 0
  const activeEmployees = employees.filter((e) => e.isActive !== false)
  const allUsersSelected = activeEmployees.length > 0 && activeEmployees.every((emp) => selectedUsersForFence.includes(emp.id))

  // Statistics
  const stats = useMemo(() => ({
    total: geofences.length,
    active: geofences.filter(g => g.enabled !== false).length,
    inactive: geofences.filter(g => g.enabled === false).length,
    circles: geofences.filter(g => g.type === 'circle').length,
    polygons: geofences.filter(g => g.type === 'polygon').length,
  }), [geofences])

  // Filter geofences
  const filteredGeofences = useMemo(() => {
    return geofences.filter(gf => {
      const matchesSearch = [gf.name, gf.id].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = geofenceTypeFilter === 'all' || gf.type === geofenceTypeFilter
      const matchesStatus = geofenceStatusFilter === 'all' 
        ? true 
        : geofenceStatusFilter === 'active' 
          ? gf.enabled !== false 
          : gf.enabled === false
      return matchesSearch && matchesType && matchesStatus
    })
  }, [geofences, searchQuery, geofenceTypeFilter, geofenceStatusFilter])

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Geofence Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Monitor and manage your location boundaries with precision
            </p>
          </div>
          <motion.button
            onClick={handleStartAdd}
            className="btn-primary gap-2 shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            <span>Create Geofence</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm opacity-90">Total</span>
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm opacity-90">Active</span>
              </div>
              <div className="text-3xl font-bold">{stats.active}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Circle className="h-4 w-4" />
                <span className="text-sm opacity-90">Circles</span>
              </div>
              <div className="text-3xl font-bold">{stats.circles}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Hexagon className="h-4 w-4" />
                <span className="text-sm opacity-90">Polygons</span>
              </div>
              <div className="text-3xl font-bold">{stats.polygons}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card shadow-lg border-0 bg-gradient-to-br from-slate-500 to-slate-600 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm opacity-90">Assigned</span>
              </div>
              <div className="text-3xl font-bold">{assignedUsersCount}</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 gap-6 ${editFormData ? 'lg:grid-cols-12' : 'lg:grid-cols-3'}`}>
        {/* Left Column - Map */}
        <div className={`${editFormData ? 'lg:col-span-8' : 'lg:col-span-2'}`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Live Map</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedGeofence ? selectedGeofence.name : 'Select a geofence'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedGeofence && !editFormData && (
                  <motion.button
                    onClick={() => handleStartEdit(selectedGeofence)}
                    className="btn btn-outline btn-sm gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="relative">
              {editFormData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-xl border border-blue-500/30 dark:border-blue-400/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Navigation2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <strong className="text-sm text-blue-900 dark:text-blue-100">Drawing Mode Active</strong>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {editFormData.type === 'circle' 
                          ? 'Click on the map to set center coordinates, then drag the radius handle' 
                          : 'Click on the map to add polygon points, drag to adjust'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-inner">
                <LiveMap 
                  selectedGeofence={selectedGeofence} 
                  geofences={geofences} 
                  isEditMode={editFormData !== null}
                  onMapClick={handleMapClick}
                  onGeofenceUpdate={handleGeofenceUpdate}
                  editFormData={editFormData}
                  onEditClick={handleEditClick}
                  onFormDataUpdate={handleFormDataUpdate}
                  onRightClick={handleRightClick}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Form or User Assignment */}
        <div className={`${editFormData ? 'lg:col-span-4' : 'lg:col-span-1'}`}>
          <AnimatePresence mode="wait">
            {editFormData ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        {editingGeofence ? 'Edit Geofence' : 'New Geofence'}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {editFormData.type === 'circle' ? 'Circle Zone' : 'Polygonal Zone'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-2">
                  <div>
                    <label className="label flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Geofence Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="e.g., Main Office, Warehouse Zone"
                      required
                    />
                  </div>

                  <div>
                    <label className="label flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Type *
                    </label>
                    <select
                      className="select"
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    >
                      <option value="circle">Circle</option>
                      <option value="polygon">Polygon</option>
                    </select>
                  </div>

                  {editFormData.type === 'circle' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            className="input"
                            value={editFormData.latitude}
                            onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                            placeholder="39.7392"
                            required
                          />
                        </div>
                        <div>
                          <label className="label">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            className="input"
                            value={editFormData.longitude}
                            onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                            placeholder="-104.9903"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Radius (meters) *</label>
                        <input
                          type="number"
                          step="any"
                          className="input"
                          value={editFormData.radius}
                          onChange={(e) => setEditFormData({ ...editFormData, radius: e.target.value })}
                          placeholder="500"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {editFormData.type === 'polygon' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Polygon Points:</strong> {editFormData.coordinates?.length || 0} vertices
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      className="btn btn-primary w-full gap-2 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Geofence'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : selectedGeofence ? (
              <motion.div
                key="user-assign"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        {assignmentMode === 'users' ? 'Assign Users' : 'Assign Groups'}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedGeofence.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setAssignmentMode('users')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        assignmentMode === 'users'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 inline mr-1.5" />
                      Users
                    </button>
                    <button
                      onClick={() => setAssignmentMode('groups')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        assignmentMode === 'groups'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <UserCheck className="h-3.5 w-3.5 inline mr-1.5" />
                      Groups
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  {assignmentMode === 'users' ? (
                    <>
                      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={allUsersSelected}
                            onChange={handleToggleAllUsers}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-sm">Select All ({activeEmployees.length})</span>
                        </label>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {activeEmployees.length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No active employees</p>
                          </div>
                        ) : (
                          activeEmployees.map((emp) => (
                            <motion.label
                              key={emp.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                              whileHover={{ scale: 1.02 }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsersForFence.includes(emp.id)}
                                onChange={() => handleToggleUser(emp.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">
                                  {emp.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{emp.name}</div>
                                <div className="text-xs text-gray-500 truncate">{emp.role}</div>
                              </div>
                            </motion.label>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={groups.filter(g => g.enabled).length > 0 && groups.filter(g => g.enabled).every(group => selectedGroupsForFence.includes(group.id))}
                            onChange={handleToggleAllGroups}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-medium text-sm">
                            Select All ({groups.filter(g => g.enabled).length})
                          </span>
                        </label>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {groups.filter(g => g.enabled).length === 0 ? (
                          <div className="text-center py-12">
                            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No active groups</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Create groups from the Groups page</p>
                          </div>
                        ) : (
                          groups.filter(g => g.enabled).map((group) => (
                            <motion.label
                              key={group.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 cursor-pointer transition-all border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
                              whileHover={{ scale: 1.02 }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedGroupsForFence.includes(group.id)}
                                onChange={() => handleToggleGroup(group.id)}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">
                                  {group.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{group.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </motion.label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  
                  <motion.button
                    onClick={handleSaveAssignments}
                    disabled={isSaving}
                    className="btn-primary w-full mt-4 gap-2 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Save Assignments ({assignmentMode === 'users' ? selectedUsersForFence.length : selectedGroupsForFence.length})
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card shadow-xl border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 h-full flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Select a Geofence
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose a geofence from the list to view details and assign users
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section - Geofences List */}
        <div className={`${editFormData ? 'lg:col-span-12' : 'lg:col-span-3'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">All Geofences</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredGeofences.length} of {geofences.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  <motion.button
                    onClick={() => setGeofenceViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      geofenceViewMode === 'list'
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <List className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setGeofenceViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      geofenceViewMode === 'grid'
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search geofences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="select w-[120px]" 
                  value={geofenceTypeFilter} 
                  onChange={(e) => setGeofenceTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="circle">Circle</option>
                  <option value="polygon">Polygon</option>
                </select>
                <select 
                  className="select w-[120px]" 
                  value={geofenceStatusFilter} 
                  onChange={(e) => setGeofenceStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Geofences List */}
              {filteredGeofences.length === 0 ? (
                <div className="text-center py-12 flex-1 flex items-center justify-center">
                  <div>
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No geofences found</p>
                  </div>
                </div>
              ) : geofenceViewMode === 'list' ? (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {filteredGeofences.map((gf) => (
                    <motion.div
                      key={gf.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                        selectedGeofence?.id === gf.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                      }`}
                      onClick={() => handleSelectGeofence(gf)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {gf.type === 'circle' ? (
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Circle className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Hexagon className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{gf.name}</h3>
                            <p className="text-xs text-gray-500">
                              {gf.type === 'circle' 
                                ? `Circle · ${gf.radius}m radius` 
                                : `Polygon · ${gf.coordinates?.length || 0} points`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleGeofence(gf.id)
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              gf.enabled !== false
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Power className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartEdit(gf)
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm(`Delete ${gf.name}?`)) {
                                deleteGeofence(gf.id)
                                if (selectedGeofence?.id === gf.id) {
                                  selectGeofence(null)
                                }
                              }
                            }}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gf.enabled !== false ? (
                          <span className="badge badge-success inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-danger inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                        {gf.assignedUsers && gf.assignedUsers.length > 0 && (
                          <span className="badge badge-secondary inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {gf.assignedUsers.length}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
                  {filteredGeofences.map((gf) => (
                    <motion.div
                      key={gf.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                        selectedGeofence?.id === gf.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
                      }`}
                      onClick={() => handleSelectGeofence(gf)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {gf.type === 'circle' ? (
                            <Circle className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Hexagon className="h-5 w-5 text-green-600" />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {gf.name}
                          </h3>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleGeofence(gf.id)
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            gf.enabled !== false
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Power className="h-4 w-4" />
                        </motion.button>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-gray-500">
                          {gf.type === 'circle' 
                            ? `Circle · ${gf.radius}m radius` 
                            : `Polygon · ${gf.coordinates?.length || 0} points`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {gf.enabled !== false ? (
                            <span className="badge badge-success text-xs">Active</span>
                          ) : (
                            <span className="badge badge-danger text-xs">Inactive</span>
                          )}
                          {gf.assignedUsers && gf.assignedUsers.length > 0 && (
                            <span className="badge badge-secondary text-xs">
                              {gf.assignedUsers.length} users
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <motion.button
                          className="btn btn-outline btn-sm flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(gf)
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="h-3 w-3" />
                        </motion.button>
                        <motion.button
                          className="btn btn-outline btn-sm flex-1 text-xs text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`Delete ${gf.name}?`)) {
                              deleteGeofence(gf.id)
                              if (selectedGeofence?.id === gf.id) {
                                selectGeofence(null)
                              }
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
