import React from 'react'
import { motion } from 'framer-motion'
import { Menu, MapPin, Wifi, WifiOff, LogOut, User } from 'lucide-react'
import { useLocationStore } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'

export const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { currentLocation, isTracking } = useLocationStore()
  const { authUser, logout } = useAuthStore()

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

          {/* User Info & Logout */}
          {authUser && (
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {authUser.name || authUser.email}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {authUser.role || 'Admin'}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 hover:text-danger-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
