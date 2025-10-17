import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useUserStore } from '../stores/userStore'
import { GeofenceForm } from './GeofenceForm'
import { GEOFENCE_TYPES } from '../constants'
import { formatDistanceToNow } from 'date-fns'

export const GeofenceManager = () => {
  const { geofences, deleteGeofence, toggleGeofence, selectGeofence, selectedGeofence } = useGeofenceStore()
  const { users } = useUserStore()
  const [showForm, setShowForm] = useState(false)
  const [editingGeofence, setEditingGeofence] = useState(null)

  const handleEdit = (geofence) => {
    setEditingGeofence(geofence)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingGeofence(null)
  }

  const getAssignedUsers = (geofence) => {
    if (!geofence.assignedUsers) return []
    return geofence.assignedUsers.map(userId => 
      users.find(user => user.id === userId)
    ).filter(Boolean)
  }

  const getGeofenceType = (type) => {
    return GEOFENCE_TYPES.find(t => t.id === type) || GEOFENCE_TYPES[3]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Geofence Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create and manage location-based geofences for monitoring
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Geofence</span>
        </motion.button>
      </div>

      {/* Geofences Grid */}
      {geofences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {geofences.map((geofence, index) => {
            const type = getGeofenceType(geofence.type)
            const isSelected = selectedGeofence?.id === geofence.id
            
            return (
              <motion.div
                key={geofence.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-6 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
                }`}
                onClick={() => selectGeofence(isSelected ? null : geofence)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: geofence.color }}
                    ></div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {geofence.name}
                    </h3>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGeofence(geofence.id)
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {geofence.enabled ? (
                      <ToggleRight className="w-5 h-5 text-success-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Type */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {type.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Shape:</span>
                    <span className="text-slate-900 dark:text-slate-100 capitalize">
                      {geofence.shape || 'polygon'}
                    </span>
                  </div>
                  {geofence.shape === 'polygon' && geofence.polygon ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Points:</span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {geofence.polygon.length} vertices
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Radius:</span>
                      <span className="font-mono text-slate-900 dark:text-slate-100">
                        {geofence.radius}m
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Created:</span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {formatDistanceToNow(new Date(geofence.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Assigned Users */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Assigned Users
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {getAssignedUsers(geofence).length} users
                    </span>
                  </div>
                  
                  {getAssignedUsers(geofence).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getAssignedUsers(geofence).slice(0, 3).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {user.name}
                          </span>
                        </div>
                      ))}
                      {getAssignedUsers(geofence).length > 3 && (
                        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            +{getAssignedUsers(geofence).length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        No users assigned
                      </span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      geofence.enabled ? 'bg-success-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      geofence.enabled ? 'text-success-600' : 'text-gray-500'
                    }`}>
                      {geofence.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(geofence)
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteGeofence(geofence.id)
                    }}
                    className="flex-1 bg-danger-500 hover:bg-danger-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No geofences created yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first geofence to start monitoring locations
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Geofence</span>
          </motion.button>
        </motion.div>
      )}

      {/* Geofence Form Modal */}
      <AnimatePresence>
        {showForm && (
          <GeofenceForm
            geofence={editingGeofence}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
