import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Save, Users } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useLocationStore } from '../stores/locationStore'
import { useUserStore } from '../stores/userStore'
import { GEOFENCE_TYPES, DEFAULT_POLYGONS } from '../constants'
import { GeofenceMap } from './GeofenceMap'

export const GeofenceForm = ({ geofence, onClose }) => {
  const { addGeofence, updateGeofence } = useGeofenceStore()
  const { currentLocation } = useLocationStore()
  const { users, getActiveUsers } = useUserStore()
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
    type: 'custom',
    color: '#3b82f6',
    enabled: true,
    shape: 'polygon',
    polygon: [],
    assignedUsers: [],
  })
  
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194])
  const [isMapDrawing, setIsMapDrawing] = useState(false)

  useEffect(() => {
    if (geofence) {
      setFormData({
        name: geofence.name,
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        radius: geofence.radius,
        type: geofence.type,
        color: geofence.color,
        enabled: geofence.enabled,
        shape: geofence.shape || 'polygon',
        polygon: geofence.polygon || [],
        assignedUsers: geofence.assignedUsers || [],
      })
      
      // Set map center to geofence center
      if (geofence.latitude && geofence.longitude) {
        setMapCenter([geofence.latitude, geofence.longitude])
      }
    } else if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        polygon: DEFAULT_POLYGONS.custom.map(point => ({
          latitude: point.latitude + (Math.random() - 0.5) * 0.001,
          longitude: point.longitude + (Math.random() - 0.5) * 0.001,
        })),
      }))
      
      // Set map center to current location
      setMapCenter([currentLocation.latitude, currentLocation.longitude])
    }
  }, [geofence, currentLocation])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (geofence) {
      updateGeofence(geofence.id, formData)
    } else {
      addGeofence(formData)
    }
    
    onClose()
  }

  const handleTypeChange = (type) => {
    const typeConfig = GEOFENCE_TYPES.find(t => t.id === type)
    if (typeConfig) {
      setFormData(prev => ({
        ...prev,
        type: type,
        color: typeConfig.color,
        radius: typeConfig.defaultRadius,
        polygon: DEFAULT_POLYGONS[type] || DEFAULT_POLYGONS.custom,
      }))
    }
  }

  const addPolygonPoint = () => {
    setFormData(prev => ({
      ...prev,
      polygon: [...prev.polygon, { latitude: prev.latitude, longitude: prev.longitude }],
    }))
  }

  const removePolygonPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      polygon: prev.polygon.filter((_, i) => i !== index),
    }))
  }

  const updatePolygonPoint = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      polygon: prev.polygon.map((point, i) => 
        i === index ? { ...point, [field]: parseFloat(value) || 0 } : point
      ),
    }))
  }

  const toggleUserAssignment = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }))
  }

  const handleMapPolygonChange = (polygonPoints) => {
    try {
      if (!Array.isArray(polygonPoints)) return
      
      const polygonData = polygonPoints
        .filter(point => Array.isArray(point) && point.length >= 2)
        .map(point => ({
          latitude: point[0],
          longitude: point[1]
        }))
      
      setFormData(prev => ({
        ...prev,
        polygon: polygonData
      }))
    } catch (error) {
      console.error('Error handling polygon change:', error)
    }
  }

  const handleMapCenterChange = (center) => {
    try {
      if (!Array.isArray(center) || center.length < 2) return
      
      setMapCenter(center)
      setFormData(prev => ({
        ...prev,
        latitude: center[0],
        longitude: center[1]
      }))
    } catch (error) {
      console.error('Error handling center change:', error)
    }
  }

  const handleMapDrawingToggle = (isDrawing) => {
    try {
      setIsMapDrawing(Boolean(isDrawing))
    } catch (error) {
      console.error('Error handling drawing toggle:', error)
    }
  }

  const useCurrentLocation = () => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {geofence ? 'Edit Geofence' : 'Create New Geofence'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {geofence ? 'Update geofence settings and assignments' : 'Set up a new geofence area for monitoring'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="geofence-form" onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Geofence Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input text-lg"
                    placeholder="Enter geofence name"
                    required
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Geofence Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {GEOFENCE_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.type === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {type.label}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Shape Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Location & Shape</h3>
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Center Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="37.7749"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="-122.4194"
                      required
                    />
                  </div>
                </div>
                {currentLocation && (
                  <motion.button
                    type="button"
                    onClick={useCurrentLocation}
                    className="btn-secondary flex items-center space-x-2 w-full mt-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Use Current Location</span>
                  </motion.button>
                )}
              </div>

              {/* Interactive Map */}
              <div>
                {Array.isArray(mapCenter) && mapCenter.length === 2 ? (
                  <GeofenceMap
                    center={mapCenter}
                    zoom={13}
                    polygon={formData.polygon
                      .filter(point => point && typeof point.latitude === 'number' && typeof point.longitude === 'number')
                      .map(point => [point.latitude, point.longitude])}
                    onPolygonChange={handleMapPolygonChange}
                    onCenterChange={handleMapCenterChange}
                    isDrawing={isMapDrawing}
                    onToggleDrawing={handleMapDrawingToggle}
                  />
                ) : (
                  <div className="h-96 w-full rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-slate-400">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Polygon Points (Alternative) */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Manual Points Entry
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Alternative to map drawing
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.polygon.length} points defined
                    </span>
                    <motion.button
                      type="button"
                      onClick={addPolygonPoint}
                      className="btn-secondary flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Add Point</span>
                    </motion.button>
                  </div>
                  
                  {formData.polygon.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.polygon.map((point, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-8">
                            {index + 1}
                          </span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              step="any"
                              value={point.latitude}
                              onChange={(e) => updatePolygonPoint(index, 'latitude', e.target.value)}
                              className="input text-sm"
                              placeholder="Latitude"
                            />
                            <input
                              type="number"
                              step="any"
                              value={point.longitude}
                              onChange={(e) => updatePolygonPoint(index, 'longitude', e.target.value)}
                              className="input text-sm"
                              placeholder="Longitude"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePolygonPoint(index)}
                            className="p-1 text-danger-500 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.polygon.length < 3 && (
                    <div className="text-sm text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                      ⚠️ At least 3 points are required to create a polygon
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="input font-mono text-sm"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>

          {/* Assigned Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned Users
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formData.assignedUsers.length} selected
                </span>
                {formData.assignedUsers.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assignedUsers: [] }))}
                    className="text-xs text-danger-500 hover:text-danger-700 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {getActiveUsers().length > 0 ? (
                getActiveUsers().map((user) => {
                  const isSelected = formData.assignedUsers.includes(user.id)
                  return (
                    <motion.label
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUserAssignment(user.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                        }`}>
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {user.name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            user.role === 'supervisor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            user.role === 'employee' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            user.role === 'student' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </motion.label>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    No users available
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Create users first to assign them to geofences
                  </p>
                </div>
              )}
            </div>
          </div>

            {/* User Assignment Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Assignment</h3>
              </div>
              
              {/* Assigned Users */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Assigned Users
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formData.assignedUsers.length} selected
                    </span>
                    {formData.assignedUsers.length > 0 && (
                      <motion.button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, assignedUsers: [] }))}
                        className="text-xs text-danger-500 hover:text-danger-700 font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear All
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {getActiveUsers().length > 0 ? (
                    getActiveUsers().map((user) => {
                      const isSelected = formData.assignedUsers.includes(user.id)
                      return (
                        <motion.label
                          key={user.id}
                          className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserAssignment(user.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                            }`}>
                              {isSelected && (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </motion.svg>
                              )}
                            </div>
                          </div>
                          
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {user.name}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                user.role === 'supervisor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                user.role === 'employee' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                user.role === 'student' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </motion.label>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        No users available
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Create users first to assign them to geofences
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Settings</h3>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Geofence Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="input font-mono text-sm"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              {/* Enabled */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Geofence
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Active geofences will trigger alerts when users enter or exit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
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
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex space-x-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              form="geofence-form"
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>{geofence ? 'Update Geofence' : 'Create Geofence'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
