import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Save } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useLocationStore } from '../stores/locationStore'
import { GEOFENCE_TYPES } from '../constants'

export const GeofenceForm = ({ geofence, onClose }) => {
  const { addGeofence, updateGeofence } = useGeofenceStore()
  const { currentLocation } = useLocationStore()
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
      type: 'custom',
    color: '#3b82f6',
    enabled: true,
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
      })
    } else if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
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
      }))
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

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Radius (meters)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={formData.radius}
              onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) || 100 }))}
              className="input"
              required
            />
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Current radius: {formData.radius}m
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
