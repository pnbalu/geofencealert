import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link as LinkIcon,
  Settings,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Save,
  Trash2,
  Edit,
  Plus,
  X,
  Globe,
  Database,
  Activity,
  ArrowUpDown
} from 'lucide-react'
import { useEmployeeStore } from '../stores/employeeStore'
import { useTimesheetStore } from '../stores/timesheetStore'
import toast from 'react-hot-toast'

export const LinkIntegration = () => {
  const { employees, loadEmployees } = useEmployeeStore()
  const { timesheets, loadTimesheets } = useTimesheetStore()
  
  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      name: 'Employee Sync',
      type: 'employee',
      direction: 'receive', // receive or send
      endpoint: 'https://api.example.com/employees',
      method: 'GET',
      enabled: true,
      schedule: 'hourly',
      headers: { 'Authorization': 'Bearer token123' },
      lastSync: new Date('2024-01-15T10:30:00'),
      status: 'success',
      lastSyncCount: 0
    },
    {
      id: '2',
      name: 'Timesheet Export',
      type: 'timesheet',
      direction: 'send',
      endpoint: 'https://api.example.com/timesheets',
      method: 'POST',
      enabled: false,
      schedule: 'daily',
      headers: { 'Authorization': 'Bearer token123' },
      lastSync: null,
      status: 'inactive',
      lastSyncCount: 0
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState('integrations')

  const [formData, setFormData] = useState({
    name: '',
    type: 'employee',
    direction: 'receive',
    endpoint: '',
    method: 'GET',
    enabled: false,
    schedule: 'hourly',
    headers: ''
  })

  const stats = {
    total: integrations.length,
    enabled: integrations.filter(i => i.enabled).length,
    successful: integrations.filter(i => i.status === 'success').length,
    failed: integrations.filter(i => i.status === 'error').length,
  }

  const handleStartAdd = () => {
    setEditingIntegration(null)
    setFormData({
      name: '',
      type: 'employee',
      direction: 'receive',
      endpoint: '',
      method: 'GET',
      enabled: false,
      schedule: 'hourly',
      headers: ''
    })
    setShowForm(true)
  }

  const handleStartEdit = (integration) => {
    setEditingIntegration(integration)
    setFormData({
      name: integration.name,
      type: integration.type,
      direction: integration.direction,
      endpoint: integration.endpoint,
      method: integration.method,
      enabled: integration.enabled,
      schedule: integration.schedule,
      headers: typeof integration.headers === 'object' ? JSON.stringify(integration.headers, null, 2) : integration.headers || ''
    })
    setShowForm(true)
  }

  const handleSave = () => {
    try {
      const integration = {
        ...formData,
        id: editingIntegration?.id || crypto.randomUUID(),
        headers: formData.headers ? JSON.parse(formData.headers) : {},
        lastSync: editingIntegration ? editingIntegration.lastSync : null,
        status: 'inactive',
        lastSyncCount: 0
      }

      if (editingIntegration) {
        setIntegrations(integrations.map(i => i.id === editingIntegration.id ? integration : i))
        toast.success('Integration updated successfully!')
      } else {
        setIntegrations([...integrations, integration])
        toast.success('Integration created successfully!')
      }

      setShowForm(false)
    } catch (error) {
      toast.error('Invalid JSON in headers')
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      setIntegrations(integrations.filter(i => i.id !== id))
      toast.success('Integration deleted successfully!')
    }
  }

  const handleToggleEnabled = (id) => {
    setIntegrations(integrations.map(i => 
      i.id === id ? { ...i, enabled: !i.enabled, status: !i.enabled ? 'active' : 'inactive' } : i
    ))
    const integration = integrations.find(i => i.id === id)
    toast.success(`Integration ${!integration.enabled ? 'enabled' : 'disabled'}`)
  }

  const handleSync = async (integration) => {
    setIsSyncing(true)
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const now = new Date()
      const syncCount = integration.direction === 'receive' 
        ? employees.length 
        : timesheets.filter(t => {
          const lastSync = integration.lastSync
          return !lastSync || new Date(t.timestamp) > lastSync
        }).length

      setIntegrations(integrations.map(i => 
        i.id === integration.id ? { 
          ...i, 
          lastSync: now, 
          status: 'success',
          lastSyncCount: syncCount
        } : i
      ))

      toast.success(`${integration.direction === 'receive' ? 'Imported' : 'Exported'} ${syncCount} records successfully!`)
    } catch (error) {
      setIntegrations(integrations.map(i => 
        i.id === integration.id ? { ...i, status: 'error' } : i
      ))
      toast.error('Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  const scheduleOptions = [
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'manual', label: 'Manual Only' }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Link Integration
            </h1>
            <div className="relative">
              <motion.div
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -right-2 -top-2 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
              />
              <LinkIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Integrate with external systems via REST APIs
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Create Integration
        </button>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
            <LinkIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Integrations</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enabled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.enabled}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.successful}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.failed}</p>
          </div>
        </div>
      </motion.div>

      {/* Integrations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="p-6">
          {integrations.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No integrations configured</p>
              <button onClick={handleStartAdd} className="btn btn-primary">
                Create Your First Integration
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map(integration => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        integration.direction === 'receive' 
                          ? 'bg-blue-100 dark:bg-blue-900/20' 
                          : 'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {integration.direction === 'receive' ? (
                          <Download className={`h-6 w-6 ${
                            integration.direction === 'receive' 
                              ? 'text-blue-600' 
                              : 'text-green-600'
                          }`} />
                        ) : (
                          <Upload className={`h-6 w-6 ${
                            integration.direction === 'receive' 
                              ? 'text-blue-600' 
                              : 'text-green-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {integration.name}
                          </h3>
                          <span className={`badge ${
                            integration.type === 'employee' ? 'badge-secondary' : 'badge-default'
                          }`}>
                            {integration.type}
                          </span>
                          <span className={`badge ${
                            integration.direction === 'receive' ? 'badge-outline' : 'badge-success'
                          }`}>
                            {integration.direction === 'receive' ? 'Import' : 'Export'}
                          </span>
                          {integration.status === 'success' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {integration.status === 'error' && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Globe className="h-4 w-4" />
                            <span className="font-mono">{integration.method}</span>
                            <span className="font-mono">{integration.endpoint}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Schedule: {scheduleOptions.find(s => s.value === integration.schedule)?.label}</span>
                            {integration.lastSync && (
                              <>
                                <span>Last Sync: {integration.lastSync.toLocaleString()}</span>
                                <span>{integration.lastSyncCount} records</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleEnabled(integration.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          integration.enabled
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}
                        title={integration.enabled ? 'Disable' : 'Enable'}
                      >
                        {integration.enabled ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSync(integration)}
                        disabled={isSyncing}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>
                      <button
                        onClick={() => handleStartEdit(integration)}
                        className="btn btn-outline btn-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(integration.id)}
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Integration Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingIntegration ? 'Edit Integration' : 'Create Integration'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Integration Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sync Employees from HR System"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Data Type *</label>
                    <select
                      className="select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="timesheet">Timesheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Direction *</label>
                    <select
                      className="select"
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    >
                      <option value="receive">Receive (Import)</option>
                      <option value="send">Send (Export)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Endpoint URL *</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="https://api.example.com/employees"
                    required
                  />
                </div>

                <div>
                  <label className="label">HTTP Method *</label>
                  <select
                    className="select"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="label">Schedule</label>
                  <select
                    className="select"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  >
                    {scheduleOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Headers (JSON)</label>
                  <textarea
                    className="input font-mono text-sm"
                    rows="4"
                    value={formData.headers}
                    onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                    placeholder='{ "Authorization": "Bearer token", "Content-Type": "application/json" }'
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="label mb-0">Status</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formData.enabled ? 'Enabled' : 'Disabled'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
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

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} className="btn btn-primary flex-1">
                    {editingIntegration ? 'Update Integration' : 'Create Integration'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

