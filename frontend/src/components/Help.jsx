import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  BookOpen,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  MapPin,
  Calendar,
  Users,
  Bell,
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Video
} from 'lucide-react'

export const Help = () => {
  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Shield className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      items: [
        { title: 'First Time Login', content: 'Use default credentials: Username: admin, Password: Admin@123. You\'ll be prompted to change your password immediately.' },
        { title: 'Dashboard Overview', content: 'The dashboard provides real-time insights into your workforce, active geofences, and recent alert activity.' },
        { title: 'Navigation', content: 'Use the left sidebar to navigate between modules. The top navigation provides quick access to key features.' },
      ]
    },
    {
      id: 'features',
      title: 'Key Features',
      icon: <Settings className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      items: [
        {
          title: 'Geofence Management',
          content: 'Create and manage geofences (circle or polygon) for monitoring locations. Assign employees or groups to geofences for automated tracking.'
        },
        {
          title: 'Employee & Group Management',
          content: 'Add employees, create groups, and assign schedules. Employees can be assigned to multiple groups and schedules.'
        },
        {
          title: 'Schedule Management',
          content: 'Create work schedules with specific times and days. Assign multiple employees and/or groups to schedules for coordinated monitoring.'
        },
        {
          title: 'Alert Configuration',
          content: 'Configure alerts for geofence entry/exit with time-based rules. Set notification recipients (individuals or groups) and alert conditions.'
        },
        {
          title: 'Alert History',
          content: 'View and manage alert history with filtering options. Export data to CSV and track alert patterns.'
        },
      ]
    },
    {
      id: 'workflows',
      title: 'Common Workflows',
      icon: <Database className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      items: [
        {
          title: 'Setting Up a New Site',
          content: '1. Create geofence → 2. Assign employees/groups → 3. Configure alerts → 4. Activate geofence'
        },
        {
          title: 'Onboarding New Employee',
          content: '1. Add employee in Admin section → 2. Add to relevant groups → 3. Assign schedules → 4. Assign to geofences'
        },
        {
          title: 'Creating a Team Schedule',
          content: '1. Go to Schedules → 2. Create schedule with times and days → 3. Select employees/groups → 4. Activate schedule'
        },
        {
          title: 'Managing Alerts',
          content: '1. View alerts in Alerts section → 2. Filter by type/date → 3. Export data if needed → 4. Configure rules in Alert Config'
        },
      ]
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: <FileText className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      items: [
        {
          title: 'Geofence Best Practices',
          content: 'Use polygon geofences for irregular shapes, circles for round areas. Name geofences descriptively for easy identification.'
        },
        {
          title: 'Group Organization',
          content: 'Organize employees into logical groups by department, shift, or location. Groups simplify assignment and management.'
        },
        {
          title: 'Schedule Optimization',
          content: 'Create multiple schedules for different shifts. Use the enable/disable toggle to temporarily pause schedules.'
        },
        {
          title: 'Alert Management',
          content: 'Set appropriate alert conditions to avoid notification fatigue. Use time-based rules to respect work hours.'
        },
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <RefreshCw className="h-5 w-5" />,
      color: 'from-indigo-500 to-blue-500',
      items: [
        {
          title: 'Map Not Loading',
          content: 'Check your .env file configuration. Ensure VITE_MAP_PROVIDER is set to either "google" or "openstreetmap". Verify API key for Google Maps.'
        },
        {
          title: 'Data Not Saving',
          content: 'Ensure electronAPI is available. Check console for errors. Try restarting the application.'
        },
        {
          title: 'Login Issues',
          content: 'Clear localStorage and re-login. Use admin credentials if first login. Contact support if password reset is needed.'
        },
        {
          title: 'Geofence Not Triggering',
          content: 'Verify geofence is enabled. Check assigned employees/groups. Ensure location tracking is active for assigned users.'
        },
      ]
    },
    {
      id: 'support',
      title: 'Support & Resources',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'from-teal-500 to-cyan-500',
      items: [
        {
          title: 'Documentation',
          content: 'Comprehensive documentation available in README.md, QUICKSTART.md, SETUP.md, and TROUBLESHOOTING.md files.'
        },
        {
          title: 'Keyboard Shortcuts',
          content: 'Ctrl/Cmd + K: Search, Ctrl/Cmd + S: Save, Esc: Close modals, Tab: Navigate between elements'
        },
        {
          title: 'Keyboard Shortcuts',
          content: 'Ctrl/Cmd + K: Search, Ctrl/Cmd + S: Save, Esc: Close modals, Tab: Navigate between elements'
        },
      ]
    }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Help & Support
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
                className="absolute -right-2 -top-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
              />
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Everything you need to know about Geofence Alert
          </p>
        </div>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <p className="font-semibold">Documentation</p>
              <p className="text-sm opacity-90">Read the docs</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8" />
            <div>
              <p className="font-semibold">Video Tutorials</p>
              <p className="text-sm opacity-90">Watch guides</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8" />
            <div>
              <p className="font-semibold">Release Notes</p>
              <p className="text-sm opacity-90">Latest updates</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8" />
            <div>
              <p className="font-semibold">Contact Support</p>
              <p className="text-sm opacity-90">Get help</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Help Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="card shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br ${section.color} rounded-lg shadow-lg`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h2>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedSection === section.id ? 'rotate-90' : ''
                }`}
              />
            </button>
            
            {expandedSection === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
            <p className="opacity-90">Our support team is here to assist you 24/7</p>
          </div>
          <div className="flex gap-3">
            <button className="btn bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </button>
            <button className="btn bg-white/20 text-white border-2 border-white hover:bg-white/30 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

