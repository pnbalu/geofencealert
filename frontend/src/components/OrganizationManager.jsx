import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Building, Check } from 'lucide-react'
import { useOrganizationStore } from '../stores/organizationStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export const OrganizationManager = () => {
  const { 
    organizations, 
    currentOrganization, 
    loadOrganizations,
    createOrganization, 
    updateOrganization, 
    setCurrentOrganization,
    getOrganizationById 
  } = useOrganizationStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    settings: {
      allowSelfRegistration: false,
      requireEmailVerification: false,
    }
  })

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  const handleEdit = (org) => {
    setEditingOrg(org)
    setFormData({
      name: org.name || '',
      settings: org.settings || {
        allowSelfRegistration: false,
        requireEmailVerification: false,
      }
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingOrg(null)
    setFormData({
      name: '',
      settings: {
        allowSelfRegistration: false,
        requireEmailVerification: false,
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Organization name is required')
      return
    }

    if (editingOrg) {
      updateOrganization(editingOrg.id, formData)
    } else {
      createOrganization(formData)
    }
    
    handleCloseForm()
  }

  const handleDelete = (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      const orgs = organizations.filter(o => o.id !== orgId)
      const { saveOrganizations } = useOrganizationStore.getState()
      
      if (orgs.length > 0) {
        setCurrentOrganization(orgs[0])
      } else {
        setCurrentOrganization(null)
      }
      
      // Update the organizations array and save
      useOrganizationStore.setState({ organizations: orgs })
      saveOrganizations()
      toast.success('Organization deleted')
    }
  }

  const handleSetCurrent = (org) => {
    setCurrentOrganization(org)
    toast.success(`Switched to ${org.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Organizations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your organizations and settings
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Organization</span>
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
              <Building className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Organizations</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {organizations.length}
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
              <Check className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Current Organization</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {currentOrganization?.name || 'None'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Organizations Grid */}
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org, index) => {
            const isCurrent = currentOrganization?.id === org.id
            
            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-6 ${isCurrent ? 'ring-2 ring-primary-500' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {org.name}
                      </h3>
                      {isCurrent && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                          Current
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  Created {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {!isCurrent && (
                    <motion.button
                      onClick={() => handleSetCurrent(org)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-4 h-4" />
                      <span>Set Active</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => handleEdit(org)}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  
                  {!isCurrent && (
                    <motion.button
                      onClick={() => handleDelete(org.id)}
                      className="flex-1 bg-danger-500 hover:bg-danger-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </motion.button>
                  )}
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
          <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No organizations created yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first organization to get started
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Organization</span>
          </motion.button>
        </motion.div>
      )}

      {/* Organization Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {editingOrg ? 'Edit Organization' : 'Create Organization'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter organization name"
                    required
                    autoFocus
                  />
                </div>

                {/* Settings */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowSelfRegistration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowSelfRegistration: e.target.checked }
                        }))}
                        className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Allow Self Registration
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.requireEmailVerification}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, requireEmailVerification: e.target.checked }
                        }))}
                        className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Require Email Verification
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleCloseForm}
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
                    <Plus className="w-4 h-4" />
                    <span>{editingOrg ? 'Update' : 'Create'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

