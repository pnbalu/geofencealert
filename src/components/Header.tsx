import React from 'react'
import { motion } from 'framer-motion'
import { Menu, MapPin, Wifi, WifiOff } from 'lucide-react'
import { useLocationStore } from '../stores/locationStore'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const { currentLocation, isTracking } = useLocationStore()

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-slate-500" />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Geofence Alert
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Location Status */}
          <div className="flex items-center space-x-2">
            {isTracking ? (
              <Wifi className="w-4 h-4 text-success-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isTracking ? 'Tracking' : 'Offline'}
            </span>
          </div>

          {/* Current Location */}
          {currentLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
