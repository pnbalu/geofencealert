import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Bell, Activity, Users, Clock, AlertTriangle } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { useLocationStore } from '../stores/locationStore'
import { formatDistanceToNow } from 'date-fns'

export const Dashboard = () => {
  const { geofences, alerts } = useGeofenceStore()
  const { currentLocation, isTracking, lastUpdate } = useLocationStore()

  const activeGeofences = geofences.filter(gf => gf.enabled)
  const recentAlerts = alerts.slice(0, 5)
  const todayAlerts = alerts.filter(alert => {
    const alertDate = new Date(alert.timestamp)
    const today = new Date()
    return alertDate.toDateString() === today.toDateString()
  })

  const stats = [
    {
      title: 'Active Geofences',
      value: activeGeofences.length,
      total: geofences.length,
      icon: MapPin,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      title: 'Today\'s Alerts',
      value: todayAlerts.length,
      total: alerts.length,
      icon: Bell,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
    },
    {
      title: 'Tracking Status',
      value: isTracking ? 'Active' : 'Inactive',
      icon: Activity,
      color: isTracking ? 'text-success-600' : 'text-gray-600',
      bgColor: isTracking ? 'bg-success-50 dark:bg-success-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
    },
    {
      title: 'Last Update',
      value: lastUpdate ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true }) : 'Never',
      icon: Clock,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor your geofences and track location alerts in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-6 border border-slate-200 dark:border-slate-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                    {stat.value}
                  </p>
                  {stat.total !== undefined && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      of {stat.total} total
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Location */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Current Location
          </h3>
          
          {currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Location acquired
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Latitude:</span>
                    <p className="font-mono text-slate-900 dark:text-slate-100">
                      {currentLocation.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Longitude:</span>
                    <p className="font-mono text-slate-900 dark:text-slate-100">
                      {currentLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Accuracy:</span>
                    <p className="font-mono text-slate-900 dark:text-slate-100">
                      ±{currentLocation.accuracy}m
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Updated:</span>
                    <p className="font-mono text-slate-900 dark:text-slate-100">
                      {formatDistanceToNow(new Date(currentLocation.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No location data available
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Start tracking to get location updates
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recent Alerts
          </h3>
          
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'enter' ? 'bg-success-500' : 'bg-warning-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No recent alerts
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Alerts will appear here when you enter or exit geofences
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Active Geofences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Active Geofences
        </h3>
        
        {activeGeofences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGeofences.map((geofence) => (
              <motion.div
                key={geofence.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: geofence.color }}
                  ></div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {geofence.name}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {geofence.type.charAt(0).toUpperCase() + geofence.type.slice(1)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Radius: {geofence.radius}m
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No active geofences
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Create geofences to start monitoring locations
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
