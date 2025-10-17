import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Filter, Trash2, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { formatDistanceToNow, format } from 'date-fns'

type FilterType = 'all' | 'enter' | 'exit'
type TimeFilter = 'all' | 'today' | 'week' | 'month'

export const AlertHistory: React.FC = () => {
  const { alerts, geofences, clearAlerts } = useGeofenceStore()
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const getGeofenceName = (geofenceId: string) => {
    const geofence = geofences.find(gf => gf.id === geofenceId)
    return geofence?.name || 'Unknown Geofence'
  }

  const getGeofenceColor = (geofenceId: string) => {
    const geofence = geofences.find(gf => gf.id === geofenceId)
    return geofence?.color || '#6b7280'
  }

  const filteredAlerts = alerts.filter(alert => {
    // Type filter
    if (typeFilter !== 'all' && alert.type !== typeFilter) {
      return false
    }

    // Time filter
    const alertDate = new Date(alert.timestamp)
    const now = new Date()
    
    switch (timeFilter) {
      case 'today':
        return alertDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return alertDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return alertDate >= monthAgo
      default:
        return true
    }
  })

  const typeFilters = [
    { id: 'all' as FilterType, label: 'All Alerts', icon: Bell },
    { id: 'enter' as FilterType, label: 'Enter Events', icon: MapPin },
    { id: 'exit' as FilterType, label: 'Exit Events', icon: AlertTriangle },
  ]

  const timeFilters = [
    { id: 'all' as TimeFilter, label: 'All Time' },
    { id: 'today' as TimeFilter, label: 'Today' },
    { id: 'week' as TimeFilter, label: 'This Week' },
    { id: 'month' as TimeFilter, label: 'This Month' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Alert History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            View and manage all geofence alerts and notifications
          </p>
        </div>
        
        {alerts.length > 0 && (
          <motion.button
            onClick={clearAlerts}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Filters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Alert Type
            </label>
            <div className="space-y-2">
              {typeFilters.map((filter) => {
                const Icon = filter.icon
                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => setTypeFilter(filter.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      typeFilter === filter.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Time Period
            </label>
            <div className="space-y-2">
              {timeFilters.map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => setTimeFilter(filter.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    timeFilter === filter.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Alerts ({filteredAlerts.length})
          </h3>
        </div>
        
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.type === 'enter'
                          ? 'bg-success-100 dark:bg-success-900/20'
                          : 'bg-warning-100 dark:bg-warning-900/20'
                      }`}
                    >
                      {alert.type === 'enter' ? (
                        <MapPin className={`w-5 h-5 ${
                          alert.type === 'enter'
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-warning-600 dark:text-warning-400'
                        }`} />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.type === 'enter'
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-warning-600 dark:text-warning-400'
                        }`} />
                      )}
                    </div>
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {alert.type === 'enter' ? 'Entered' : 'Exited'} Geofence
                      </h4>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getGeofenceColor(alert.geofenceId) }}
                      ></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {getGeofenceName(alert.geofenceId)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono">
                          {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      {format(new Date(alert.timestamp), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      {format(new Date(alert.timestamp), 'h:mm a')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No alerts found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {alerts.length === 0
                ? 'No alerts have been generated yet. Create geofences and start tracking to see alerts here.'
                : 'No alerts match the current filters. Try adjusting your filter settings.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
