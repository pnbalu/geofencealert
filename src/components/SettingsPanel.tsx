import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, MapPin, Bell, Clock, Shield } from 'lucide-react'
import { useLocationStore } from '../stores/locationStore'

export const SettingsPanel: React.FC = () => {
  const { setTrackingInterval } = useLocationStore()
  const [settings, setSettings] = useState({
    trackingInterval: 5000, // 5 seconds
    enableNotifications: true,
    enableSound: true,
    autoStartTracking: false,
    highAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 300000, // 5 minutes
  })

  const handleSave = () => {
    // Apply tracking interval
    setTrackingInterval(settings.trackingInterval)
    
    // Save other settings to localStorage or electron store
    localStorage.setItem('geofence-settings', JSON.stringify(settings))
    
    // Show success message
    console.log('Settings saved successfully')
  }

  const handleReset = () => {
    const defaultSettings = {
      trackingInterval: 5000,
      enableNotifications: true,
      enableSound: true,
      autoStartTracking: false,
      highAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    }
    setSettings(defaultSettings)
  }

  const trackingIntervals = [
    { value: 1000, label: '1 second' },
    { value: 2000, label: '2 seconds' },
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
  ]

  const settingSections = [
    {
      title: 'Location Tracking',
      icon: MapPin,
      settings: [
        {
          key: 'trackingInterval',
          label: 'Update Interval',
          description: 'How often to check for location updates',
          type: 'select' as const,
          options: trackingIntervals,
        },
        {
          key: 'highAccuracy',
          label: 'High Accuracy Mode',
          description: 'Use GPS for more precise location data',
          type: 'toggle' as const,
        },
        {
          key: 'timeout',
          label: 'Location Timeout',
          description: 'Maximum time to wait for location data (ms)',
          type: 'number' as const,
          min: 1000,
          max: 60000,
          step: 1000,
        },
        {
          key: 'maximumAge',
          label: 'Maximum Age',
          description: 'Maximum age of cached location data (ms)',
          type: 'number' as const,
          min: 0,
          max: 3600000,
          step: 60000,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'enableNotifications',
          label: 'Enable Notifications',
          description: 'Show desktop notifications for geofence events',
          type: 'toggle' as const,
        },
        {
          key: 'enableSound',
          label: 'Enable Sound',
          description: 'Play sound when notifications appear',
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Application',
      icon: Settings,
      settings: [
        {
          key: 'autoStartTracking',
          label: 'Auto-start Tracking',
          description: 'Automatically start location tracking when app opens',
          type: 'toggle' as const,
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure your geofence monitoring preferences
          </p>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>
          
          <motion.button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-6">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {setting.label}
                      </label>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {setting.description}
                      </p>
                    </div>

                    <div className="ml-6">
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            [setting.key]: !prev[setting.key as keyof typeof prev]
                          }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key as keyof typeof settings]
                              ? 'bg-primary-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[setting.key as keyof typeof settings]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}

                      {setting.type === 'select' && (
                        <select
                          value={settings[setting.key as keyof typeof settings]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            [setting.key]: parseInt(e.target.value)
                          }))}
                          className="input w-40"
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {setting.type === 'number' && (
                        <input
                          type="number"
                          min={setting.min}
                          max={setting.max}
                          step={setting.step}
                          value={settings[setting.key as keyof typeof settings]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            [setting.key]: parseInt(e.target.value)
                          }))}
                          className="input w-32"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Privacy & Security
          </h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Location Data
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your location data is stored locally on your device and is never transmitted to external servers. 
              All geofence data and alerts remain private and secure.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Permissions
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This application requires location permissions to function. You can revoke these permissions 
              at any time through your system settings.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
