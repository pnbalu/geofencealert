import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Save, Users } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useLocationStore } from '../stores/locationStore'
import { useUserStore } from '../stores/userStore'
import { GEOFENCE_TYPES, DEFAULT_POLYGONS } from '../constants'

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {geofence ? 'Edit Geofence' : 'Create Geofence'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Geofence Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Enter geofence name"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GEOFENCE_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === type.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {type.label}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Location
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    placeholder="Latitude"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    placeholder="Longitude"
                    required
                  />
                </div>
              </div>
              
              {currentLocation && (
                <motion.button
                  type="button"
                  onClick={useCurrentLocation}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use Current Location</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Polygon Points */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Polygon Points
            </label>
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

          {/* Enabled */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Enable geofence
            </label>
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

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
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
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>{geofence ? 'Update' : 'Create'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
