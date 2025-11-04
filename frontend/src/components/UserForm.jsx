import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, User, Mail, Shield, Building, MapPin } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { useGeofenceStore } from '../stores/geofenceStore'
import { USER_ROLES, USER_DEPARTMENTS } from '../constants'

export const UserForm = ({ user, onClose }) => {
  const { addUser, updateUser } = useUserStore()
  const { geofences } = useGeofenceStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'other',
    phone: '',
    assignedGeofences: [],
    notes: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'employee',
        department: user.department || 'other',
        phone: user.phone || '',
        assignedGeofences: user.assignedGeofences || [],
        notes: user.notes || '',
      })
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (user) {
      updateUser(user.id, formData)
    } else {
      addUser(formData)
    }
    
    onClose()
  }

  const toggleGeofenceAssignment = (geofenceId) => {
    setFormData(prev => ({
      ...prev,
      assignedGeofences: prev.assignedGeofences.includes(geofenceId)
        ? prev.assignedGeofences.filter(id => id !== geofenceId)
        : [...prev.assignedGeofences, geofenceId]
    }))
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
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {user ? 'Edit User' : 'Create User'}
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="input"
                required
              >
                {USER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="input"
                required
              >
                {USER_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.icon} {dept.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="input"
              placeholder="Enter phone number"
            />
          </div>

          {/* Assigned Geofences */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 inline mr-2" />
                Assigned Geofences
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formData.assignedGeofences.length} selected
                </span>
                {formData.assignedGeofences.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assignedGeofences: [] }))}
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
              {geofences.length > 0 ? (
                geofences.map((geofence) => {
                  const isSelected = formData.assignedGeofences.includes(geofence.id)
                  return (
                    <motion.label
                      key={geofence.id}
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
                          onChange={() => toggleGeofenceAssignment(geofence.id)}
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
                      
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: geofence.color }}
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {geofence.name}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                            {geofence.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {geofence.shape === 'polygon' && geofence.polygon 
                            ? `${geofence.polygon.length} vertices`
                            : `Radius: ${geofence.radius}m`
                          }
                        </p>
                      </div>
                    </motion.label>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    No geofences available
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Create geofences first to assign them to users
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input min-h-[80px] resize-none"
              placeholder="Additional notes about this user..."
              rows={3}
            />
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
              <span>{user ? 'Update' : 'Create'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
