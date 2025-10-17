import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Shield, Building } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { useGeofenceStore } from '../stores/geofenceStore'
import { UserForm } from './UserForm'
import { USER_ROLES, USER_DEPARTMENTS } from '../constants'
import { formatDistanceToNow } from 'date-fns'

export const UserManager = () => {
  const { users, deleteUser, toggleUserStatus, getActiveUsers } = useUserStore()
  const { geofences } = useGeofenceStore()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const getUserRole = (roleId) => {
    return USER_ROLES.find(r => r.id === roleId) || USER_ROLES[2]
  }

  const getUserDepartment = (deptId) => {
    return USER_DEPARTMENTS.find(d => d.id === deptId) || USER_DEPARTMENTS[7]
  }

  const getAssignedGeofences = (user) => {
    if (!user.assignedGeofences) return []
    return user.assignedGeofences.map(geofenceId => 
      geofences.find(gf => gf.id === geofenceId)
    ).filter(Boolean)
  }

  const activeUsers = getActiveUsers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage users and assign them to geofences
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {users.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeUsers.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
              <UserX className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Inactive Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {users.length - activeUsers.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Users Grid */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => {
            const role = getUserRole(user.role)
            const department = getUserDepartment(user.department)
            const assignedGeofences = getAssignedGeofences(user)
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isActive
                        ? 'text-success-500 hover:bg-success-50 dark:hover:bg-success-900/20'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {user.isActive ? (
                      <UserCheck className="w-5 h-5" />
                    ) : (
                      <UserX className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Role and Department */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{role.icon}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {role.label}
                    </span>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: role.color }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{department.icon}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {department.label}
                    </span>
                  </div>
                </div>

                {/* Assigned Geofences */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Assigned Geofences
                    </span>
                  </div>
                  
                  {assignedGeofences.length > 0 ? (
                    <div className="space-y-1">
                      {assignedGeofences.slice(0, 2).map((geofence) => (
                        <div key={geofence.id} className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: geofence.color }}
                          ></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {geofence.name}
                          </span>
                        </div>
                      ))}
                      {assignedGeofences.length > 2 && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          +{assignedGeofences.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      No geofences assigned
                    </span>
                  )}
                </div>

                {/* Created Date */}
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  Created {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(user)}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => deleteUser(user.id)}
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
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No users created yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first user to start managing access to geofences
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </motion.button>
        </motion.div>
      )}

      {/* User Form Modal */}
      <AnimatePresence>
        {showForm && (
          <UserForm
            user={editingUser}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
