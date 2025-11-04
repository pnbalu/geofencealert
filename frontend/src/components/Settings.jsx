import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  DollarSign,
  Globe,
  Moon,
  Sun,
  CheckCircle,
  Languages,
  Eye,
  EyeOff,
  Bell,
  Shield,
  HardDrive,
  Download,
  Trash2,
  Lock,
  Key,
  Smartphone,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '../stores/settingsStore'
import { currencies } from '../utils/currencies'

export const Settings = () => {
  const {
    currency,
    language,
    darkMode,
    notificationsEnabled,
    soundEnabled,
    autoBackup,
    backupFrequency,
    updateFrequency,
    setCurrency,
    setLanguage,
    setDarkMode,
    setNotificationsEnabled,
    setSoundEnabled,
    setAutoBackup,
    setBackupFrequency,
    setUpdateFrequency
  } = useSettingsStore()
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ]

  const updateFrequencies = [
    { value: 300, label: 'Every 5 minutes', display: '5 min' },
    { value: 600, label: 'Every 10 minutes', display: '10 min' },
    { value: 900, label: 'Every 15 minutes', display: '15 min' },
    { value: 1800, label: 'Every 30 minutes', display: '30 min' },
    { value: 2700, label: 'Every 45 minutes', display: '45 min' },
    { value: 3600, label: 'Every hour', display: '1 hour' },
    { value: 86400, label: 'Every day', display: '1 day' },
  ]

  const handleSave = () => {
    toast.success('Settings saved successfully!')
    // Settings are automatically saved via Zustand persist
  }

  const handleExportData = () => {
    toast.success('Data export initiated!')
  }

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cached data?')) {
      localStorage.clear()
      toast.success('Cache cleared successfully!')
    }
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!')
      return
    }
    
    // Here you would typically call an API to change the password
    toast.success('Password changed successfully!')
    setShowPasswordForm(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const currencySymbol = currencies.find(c => c.code === currency)?.symbol || '$'

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your application preferences
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle className="h-4 w-4" />
          Saved
        </motion.button>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Currency Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Currency Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set default currency for payroll</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Default Currency</label>
                <select
                  className="select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                <p className="text-2xl font-bold text-green-600">
                  {currencySymbol}1,234.56
                </p>
                <p className="text-xs text-gray-500 mt-1">Sample amount format</p>
              </div>
            </div>
          </motion.div>

          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Language Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Interface Language</label>
                <select
                  className="select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Language</p>
                <p className="text-lg font-bold text-blue-600">
                  {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                {darkMode ? <Moon className="h-6 w-6 text-white" /> : <Sun className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize look and feel</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage alert preferences</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Enable Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive app notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Sound Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Play sound for alerts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Update Frequency Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Update Frequency</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set how often data is refreshed</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Refresh Interval</label>
                <select
                  className="select"
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(parseInt(e.target.value))}
                >
                  {updateFrequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Setting</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {updateFrequencies.find(f => f.value === updateFrequency)?.display || '5 min'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-full">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-600" />
              Data Management
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="btn btn-outline w-full justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export All Data
              </button>
              <button
                onClick={handleClearCache}
                className="btn btn-outline w-full justify-start gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cache
              </button>
            </div>
          </motion.div>

          {/* Current Settings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Current Settings
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currency</p>
                <p className="font-bold">{currency} ({currencySymbol})</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Language</p>
                <p className="font-bold">{languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Theme</p>
                <p className="font-bold">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notifications</p>
                <p className="font-bold">{notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Update Frequency</p>
                <p className="font-bold">{updateFrequencies.find(f => f.value === updateFrequency)?.display || '5 min'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

