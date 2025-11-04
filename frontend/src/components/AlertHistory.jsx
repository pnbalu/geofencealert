import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Filter, Trash2, MapPin, Clock, AlertTriangle, Users, Activity, TrendingUp, CheckCircle, XCircle, Info, Search, Download, Sparkles, Zap, RefreshCw } from 'lucide-react'
import { useGeofenceStore } from '../stores/geofenceStore'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const exportCSV = (rows, filename = "alerts.csv") => {
  const headers = Object.keys(rows[0] || { timestamp: "", type: "", geofence: "", message: "", location: "" });
  const csv = [headers.join(",")]
    .concat(
      rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const AlertHistory = () => {
  const { alerts, geofences, clearAlerts, addAlert } = useGeofenceStore()
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pulseAnimation, setPulseAnimation] = useState(false)

  const getGeofenceName = (geofenceId) => {
    const geofence = geofences.find(gf => gf.id === geofenceId)
    return geofence?.name || 'Unknown Geofence'
  }

  const getGeofenceColor = (geofenceId) => {
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
  }).filter(alert => {
    // Search filter
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return getGeofenceName(alert.geofenceId).toLowerCase().includes(query) ||
           alert.message?.toLowerCase().includes(query)
  })

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      total: alerts.length,
      enter: alerts.filter(a => a.type === 'enter').length,
      exit: alerts.filter(a => a.type === 'exit').length,
      today: alerts.filter(a => new Date(a.timestamp) >= today).length,
      week: alerts.filter(a => new Date(a.timestamp) >= week).length,
    }
  }, [alerts])

  const typeFilters = [
    { id: 'all', label: 'All Alerts', icon: Bell },
    { id: 'enter', label: 'Enter Events', icon: MapPin },
    { id: 'exit', label: 'Exit Events', icon: AlertTriangle },
  ]

  const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ]

  const handleClearAlerts = () => {
    if (window.confirm('Are you sure you want to clear all alerts? This action cannot be undone.')) {
      clearAlerts()
      toast.success('All alerts cleared! 🧹')
    }
  }

  const generateDemoAlerts = () => {
    if (geofences.length === 0) {
      toast.error('No geofences available to generate alerts')
      return
    }

    const demoAlerts = [
      {
        geofenceId: geofences[0].id,
        type: 'enter',
        message: `Entry detected at ${getGeofenceName(geofences[0].id)}`,
        location: { latitude: 39.7392, longitude: -104.9903 },
        timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
      },
      {
        geofenceId: geofences[1]?.id || geofences[0].id,
        type: 'exit',
        message: `Exit detected from ${getGeofenceName(geofences[1]?.id || geofences[0].id)}`,
        location: { latitude: 39.7589, longitude: -104.9877 },
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      },
      {
        geofenceId: geofences[0].id,
        type: 'enter',
        message: `Entry confirmed at ${getGeofenceName(geofences[0].id)}`,
        location: { latitude: 39.7400, longitude: -105.0000 },
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      },
      {
        geofenceId: geofences[2]?.id || geofences[0].id,
        type: 'exit',
        message: `Exit from ${getGeofenceName(geofences[2]?.id || geofences[0].id)}`,
        location: { latitude: 39.7250, longitude: -104.9850 },
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      },
      {
        geofenceId: geofences[0].id,
        type: 'enter',
        message: `New entry at ${getGeofenceName(geofences[0].id)}`,
        location: { latitude: 39.7350, longitude: -104.9920 },
        timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
      },
      {
        geofenceId: geofences[1]?.id || geofences[0].id,
        type: 'exit',
        message: `Exit from ${getGeofenceName(geofences[1]?.id || geofences[0].id)}`,
        location: { latitude: 39.7500, longitude: -105.0100 },
        timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
      },
      {
        geofenceId: geofences[0].id,
        type: 'enter',
        message: `Entry at ${getGeofenceName(geofences[0].id)}`,
        location: { latitude: 39.7450, longitude: -105.0050 },
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      },
      {
        geofenceId: geofences[2]?.id || geofences[0].id,
        type: 'exit',
        message: `Exit from ${getGeofenceName(geofences[2]?.id || geofences[0].id)}`,
        location: { latitude: 39.7300, longitude: -104.9900 },
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      },
      {
        geofenceId: geofences[0].id,
        type: 'enter',
        message: `Entry detected at ${getGeofenceName(geofences[0].id)}`,
        location: { latitude: 39.7320, longitude: -104.9930 },
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      },
      {
        geofenceId: geofences[1]?.id || geofences[0].id,
        type: 'exit',
        message: `Exit from ${getGeofenceName(geofences[1]?.id || geofences[0].id)}`,
        location: { latitude: 39.7600, longitude: -104.9800 },
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
      },
    ]

    // Add alerts one by one with a small delay for animation
    demoAlerts.forEach((alert, index) => {
      setTimeout(() => {
        addAlert(alert)
      }, index * 100)
    })

    toast.success('Demo alerts generated! 🎉')
  }

  const handleExport = () => {
    if (filteredAlerts.length === 0) {
      toast.error('No alerts to export')
      return
    }
    exportCSV(filteredAlerts.map(alert => ({
      timestamp: format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      type: alert.type === 'enter' ? 'Enter' : 'Exit',
      geofence: getGeofenceName(alert.geofenceId),
      message: alert.message || '',
      location: alert.location 
        ? `${alert.location.latitude}, ${alert.location.longitude}` 
        : '',
    })))
    toast.success('Alerts exported successfully! 📥')
  }

  // Pulse animation for new alerts
  useEffect(() => {
    if (alerts.length > 0) {
      setPulseAnimation(true)
      const timer = setTimeout(() => setPulseAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [alerts.length])

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Live Alerts & History
            </h1>
            <motion.div
              animate={pulseAnimation ? { scale: [1, 1.2, 1] } : {}}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    opacity: pulseAnimation ? [1, 0.5, 1] : 1,
                    scale: pulseAnimation ? [1, 1.5, 1] : 1
                  }}
                  className="absolute inset-0 bg-red-500 rounded-full blur-md"
                />
                <Zap className="h-6 w-6 text-red-500 relative z-10" />
              </div>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">LIVE</span>
            </motion.div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor geofence events and track entry/exit activities in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {alerts.length === 0 ? (
            <motion.button
              onClick={generateDemoAlerts}
              className="btn btn-primary gap-2 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Generate Demo Alerts</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={handleExport}
                className="btn btn-primary gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </motion.button>
              <motion.button
                onClick={handleClearAlerts}
                className="btn-secondary gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="card shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-sm opacity-90">Total Alerts</span>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm opacity-90">Entries</span>
            </div>
            <div className="text-3xl font-bold">{stats.enter}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-sm opacity-90">Exits</span>
            </div>
            <div className="text-3xl font-bold">{stats.exit}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-amber-500 to-yellow-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm opacity-90">Today</span>
            </div>
            <div className="text-3xl font-bold">{stats.today}</div>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm opacity-90">This Week</span>
            </div>
            <div className="text-3xl font-bold">{stats.week}</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Filter Alerts
            </h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select 
            className="select" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeFilters.map(filter => (
              <option key={filter.id} value={filter.id}>{filter.label}</option>
            ))}
          </select>

          {/* Time Filter */}
          <select 
            className="select" 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            {timeFilters.map(filter => (
              <option key={filter.id} value={filter.id}>{filter.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Info Banner for Empty State */}
      {alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card shadow-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
        >
          <div className="flex items-start gap-4 p-6">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Alerts Yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Alerts are automatically generated when employees enter or exit geofence boundaries.
                Click the button above to generate sample alerts and explore the interface.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Real-time tracking generates alerts automatically</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold text-blue-600 dark:text-blue-400">{filteredAlerts.length}</span> {filteredAlerts.length === 1 ? 'alert' : 'alerts'} found
              </p>
            </div>
          </div>
          {filteredAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {filteredAlerts.length === alerts.length 
                  ? 'All alerts visible' 
                  : `${alerts.length - filteredAlerts.length} hidden by filter`}
              </span>
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {filteredAlerts.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    {/* Alert Icon */}
                    <div className="flex-shrink-0">
                      <motion.div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          alert.type === 'enter'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {alert.type === 'enter' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-white" />
                        )}
                      </motion.div>
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`badge ${
                          alert.type === 'enter' 
                            ? 'badge-success' 
                            : 'badge-danger'
                        } text-xs font-semibold px-3 py-1`}>
                          {alert.type === 'enter' ? '✓ ENTER' : '✗ EXIT'}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Geofence Event
                        </h4>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: getGeofenceColor(alert.geofenceId) }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getGeofenceName(alert.geofenceId)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                        </div>
                        {alert.location && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-mono text-xs">
                              {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-right">
                      <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {format(new Date(alert.timestamp), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {format(new Date(alert.timestamp), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl"
                />
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <Bell className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {alerts.length === 0
                  ? 'No alerts have been generated yet. Create geofences and start tracking to see alerts here.'
                  : 'No alerts match the current filters. Try adjusting your filter settings.'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
