import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Settings, Bell, Activity, Plus } from 'lucide-react'

import { useGeofenceStore } from './stores/geofenceStore'
import { useLocationStore } from './stores/locationStore'
import { GeofenceManager } from './components/GeofenceManager'
import { LocationTracker } from './components/LocationTracker'
import { AlertHistory } from './components/AlertHistory'
import { SettingsPanel } from './components/SettingsPanel'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const { loadGeofences } = useGeofenceStore()
  const { startTracking, stopTracking, isTracking } = useLocationStore()

  useEffect(() => {
    // Load initial data
    loadGeofences()
    
    // Request location permission
    window.electronAPI.requestLocationPermission()
  }, [loadGeofences])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'geofences', label: 'Geofences', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'geofences':
        return <GeofenceManager />
      case 'alerts':
        return <AlertHistory />
      case 'settings':
        return <SettingsPanel />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0"
          >
            <Sidebar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isTracking={isTracking}
              onToggleTracking={isTracking ? stopTracking : startTracking}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
