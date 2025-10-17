import React from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Plus } from 'lucide-react'
import { Geofence, TabType } from '../types'

interface Tab {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  tabs: Tab[]
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isTracking: boolean
  onToggleTracking: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isTracking,
  onToggleTracking,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Geofence Alert
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Location Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Tracking Control */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <motion.button
          onClick={onToggleTracking}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-danger-500 hover:bg-danger-600 text-white'
              : 'bg-success-500 hover:bg-success-600 text-white'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isTracking ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop Tracking</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Tracking</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
