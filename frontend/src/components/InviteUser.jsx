import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { useOrganizationStore } from '../stores/organizationStore'
import { USER_ROLES, USER_DEPARTMENTS } from '../constants'
import toast from 'react-hot-toast'

export const InviteUser = ({ onClose }) => {
  const { inviteUser } = useUserStore()
  const { currentOrganization } = useOrganizationStore()
  const [credentials, setCredentials] = useState(null)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'other',
    phone: '',
    organizationId: currentOrganization?.id || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      toast.error('Email is required')
      return
    }

    const credentials = inviteUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      phone: formData.phone,
      organizationId: formData.organizationId,
    })

    setCredentials(credentials)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (credentials) {
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
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                  <Check className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    User Invited Successfully
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Save these credentials
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Credentials */}
          <div className="p-6 space-y-4">
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
              <p className="text-sm text-warning-700 dark:text-warning-300 font-medium mb-2">
                ⚠️ Important: Save these credentials
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400">
                The user must change their password on first login
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={credentials.username}
                  readOnly
                  className="input flex-1 bg-slate-50 dark:bg-slate-900"
                />
                <button
                  onClick={() => copyToClipboard(credentials.username)}
                  className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={credentials.email}
                  readOnly
                  className="input flex-1 bg-slate-50 dark:bg-slate-900"
                />
                <button
                  onClick={() => copyToClipboard(credentials.email)}
                  className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Temporary Password
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={credentials.password}
                  readOnly
                  id="temp-password"
                  className="input flex-1 bg-slate-50 dark:bg-slate-900 pr-10"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('temp-password')
                    input.type = input.type === 'password' ? 'text' : 'password'
                  }}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => copyToClipboard(credentials.password)}
                  className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                Instructions:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>1. Share these credentials with the user securely</li>
                <li>2. User will be prompted to change password on first login</li>
                <li>3. Only admin users can access the desktop application</li>
              </ul>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="btn-primary w-full flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-5 h-5" />
              <span>Done</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )
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
            Invite User
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
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email <span className="text-danger-500">*</span>
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

          {/* Info */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              A random password will be generated for this user. They will be required to change it on their first login.
            </p>
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
              <Mail className="w-4 h-4" />
              <span>Send Invite</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

