import React, { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Shield,
  Users,
  Clock,
  Download,
  Pause,
  Play,
  RefreshCw,
  Satellite,
  CheckCircle2,
  XCircle,
  Bell,
  Settings as SettingsIcon,
  BarChart3,
  HelpCircle,
  Menu,
  Building2,
  CheckCircle,
  FileDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
  Grid3x3,
  List,
  Power,
  Circle,
  Hexagon,
  Map as MapIcon,
  AlertTriangle,
  Calendar,
  Sun,
  Moon,
  Link as LinkIcon,
  DollarSign,
  Upload,
  Download as DownloadIcon,
  Globe,
  Activity,
  LogOut,
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useOrganizationStore } from './stores/organizationStore'
import { useEmployeeStore } from './stores/employeeStore'
import { useTimesheetStore } from './stores/timesheetStore'
import { useLocationStore } from './stores/locationStore'
import { useGeofenceStore } from './stores/geofenceStore'
import { useGroupStore } from './stores/groupStore'
import { useScheduleStore } from './stores/scheduleStore'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { ForgotPassword } from './components/ForgotPassword'
import { ChangePassword } from './components/ChangePassword'
import { Geofences } from './components/Geofences'
import { AlertHistory } from './components/AlertHistory'
import { AlertConfiguration } from './components/AlertConfiguration'
import { Groups } from './components/Groups'
import { UserManager } from './components/UserManager'
import { Schedules } from './components/Schedules'
import { Help } from './components/Help'
import { OrganizationSettings } from './components/OrganizationSettings'
import { LinkIntegration } from './components/LinkIntegration'
import { HRManagement } from './components/HRManagement'
import { Settings } from './components/Settings'
import { useAuthStore } from './stores/authStore'
import { electronAPI } from './utils/electronAPI'

const fmt = (d) => new Date(d).toLocaleString()

const exportCSV = (rows, filename = 'timesheets.csv') => {
  if (rows.length === 0) {
    rows = [{ timestamp: '', name: '', event: '', geofence: '', durationMinutes: '', notes: '' }]
  }
  const headers = Object.keys(rows[0])
  const csv = [headers.join(',')]
    .concat(
      rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? '').replaceAll('"', '""')}"`)
          .join(',')
      )
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [tracking, setTracking] = useState(true)
  const [fence, setFence] = useState({ name: 'HQ Perimeter', lat: 39.7392, lng: -104.9903, radius: 300 })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTop, setActiveTop] = useState('Dashboard')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all') // all, active, inactive
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [authView, setAuthView] = useState('login') // 'login', 'signup', 'forgot'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) // Changed to 6 for better grid layout (2x3 or 3x2)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const { employees, loadEmployees, updateEmployeeStatus, addEmployee, updateEmployee, deleteEmployee, toggleEmployeeActive, addTimesheetEntry: addToStore } = useEmployeeStore()
  const { timesheets, loadTimesheets, addTimesheetEntry } = useTimesheetStore()
  const { isTracking, startTracking, stopTracking } = useLocationStore()
  const { isAuthenticated, isFirstLogin, checkAuth, logout } = useAuthStore()
  const { currentOrganization, loadOrganizations, updateOrganization, createOrganization, setCurrentOrganization } = useOrganizationStore()
  const { geofences, loadGeofences } = useGeofenceStore()
  const { groups } = useGroupStore()
  const { schedules } = useScheduleStore()

  const checkInMapRef = useRef(new Map())
  const insideCount = useMemo(() => employees.filter((e) => e.status === 'Inside').length, [employees])

  useEffect(() => {
    const authenticated = checkAuth()
    if (authenticated && isFirstLogin) {
      setShowPasswordChange(true)
    }

    if (authenticated) {
      loadEmployees()
      loadTimesheets()
      loadOrganizations()
      loadGeofences()
    electronAPI.requestLocationPermission()
    }
  }, [checkAuth, isFirstLogin, loadEmployees, loadTimesheets, loadOrganizations, loadGeofences])

  const simulateEnter = (emp) => {
    if (!tracking || emp.status === 'Inside') return
    const now = Date.now()
    updateEmployeeStatus(emp.id, 'Inside')
    checkInMapRef.current.set(emp.id, now)
    addTimesheetEntry({
      timestamp: now,
      name: emp.name,
      employeeId: emp.id,
      event: 'IN',
      geofence: fence.name,
      notes: 'Auto entry',
    })
  }

  const simulateExit = (emp) => {
    if (!tracking || emp.status === 'Outside') return
    const now = Date.now()
    updateEmployeeStatus(emp.id, 'Outside')
    const inTs = checkInMapRef.current.get(emp.id)
    const minutes = inTs ? Math.max(1, Math.round((now - inTs) / 60000)) : ''
    addTimesheetEntry({
      timestamp: now,
      name: emp.name,
      employeeId: emp.id,
      event: 'OUT',
      geofence: fence.name,
      durationMinutes: minutes,
      notes: inTs ? 'Calculated from IN' : 'No prior IN',
    })
    checkInMapRef.current.delete(emp.id)
  }

  const handleLoginSuccess = () => {
    loadEmployees()
    loadTimesheets()
  }

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false)
  }

  const TopNav = () => (
    <div className="sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"
              title="Organization"
              onClick={() => setActiveTop('Organization')}
            >
              {currentOrganization?.logoUrl ? (
                <img src={currentOrganization.logoUrl} alt="Logo" className="h-6 w-6 rounded object-contain bg-white" />
              ) : (
                <Building2 className="h-5 w-5 text-white" />
              )}
            </button>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currentOrganization?.name || 'Geofence Workforce Tracker'}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {['Dashboard', 'Workforce', 'Timesheets', 'Geofences', 'Groups', 'Schedules', 'Alert Config', 'Alerts', 'HR', 'Reports', 'Admin', 'Organization', 'Links', 'Help'].map((m) => (
              <button
                key={m}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  activeTop === m
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setActiveTop(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <input placeholder="Search (⌘/Ctrl+K)" className="pl-8 pr-3 py-1.5 border rounded-lg w-56" />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <span className="badge badge-outline">GPS</span>
          <span className="badge badge-outline">Network</span>
          {tracking ? <span className="badge badge-default">Tracking On</span> : <span className="badge badge-secondary">Paused</span>}
        </div>
      </div>
    </div>
  )

  const Sidebar = () => (
    <aside className={`border-r border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl ${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 hidden md:block overflow-hidden flex flex-col`}>
      <div className="p-4 flex-1">
        <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-4 px-2">Navigation</div>
        {[
          { label: 'Executive Overview', key: 'Dashboard', icon: CheckCircle },
          { label: 'Employees', key: 'Workforce', icon: Users },
          { label: 'Timesheet Feed', key: 'Timesheets', icon: Clock },
          { label: 'Sites & Geofences', key: 'Geofences', icon: Shield },
          { label: 'Groups', key: 'Groups', icon: Users },
          { label: 'Schedules', key: 'Schedules', icon: Calendar },
          { label: 'Alert Configuration', key: 'Alert Config', icon: AlertTriangle },
          { label: 'Live Alerts', key: 'Alerts', icon: Bell },
          { label: 'HR & Payroll', key: 'HR', icon: DollarSign },
          { label: 'Reports', key: 'Reports', icon: BarChart3 },
          { label: 'Admin', key: 'Admin', icon: SettingsIcon },
          { label: 'Organization', key: 'Organization', icon: Building2 },
          { label: 'Links', key: 'Links', icon: LinkIcon },
          { label: 'Help', key: 'Help', icon: HelpCircle },
        ].map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            className={`w-full flex items-center justify-start mb-2 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              activeTop === key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTop(key)}
          >
            <Icon className="mr-2 h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <motion.button
          onClick={logout}
          className="w-full flex items-center justify-start px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </motion.button>
      </div>
    </aside>
  )

  const KPIs = () => (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <motion.div 
        className="card shadow-sm overflow-hidden relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative pb-2 flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-gray-600">Active Personnel</div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="relative mt-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{employees.length}</div>
          <p className="text-xs text-gray-500 mt-1">Provisioned for telemetry</p>
        </div>
      </motion.div>

      <motion.div 
        className="card shadow-sm overflow-hidden relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative pb-2 flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-gray-600">Inside Geofence</div>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="relative mt-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{insideCount}</div>
          <p className="text-xs text-gray-500 mt-1">Within boundary</p>
        </div>
      </motion.div>

      <motion.div 
        className="card shadow-sm overflow-hidden relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative pb-2 flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-gray-600">Outside Geofence</div>
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="relative mt-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{employees.length - insideCount}</div>
          <p className="text-xs text-gray-500 mt-1">Out of bounds</p>
        </div>
      </motion.div>

      <motion.div 
        className="card shadow-sm overflow-hidden relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative pb-2 flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-gray-600">System Status</div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Satellite className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="relative mt-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-outline">GPS</span>
            <span className="badge badge-outline">Network</span>
            {tracking ? <span className="badge badge-default">Tracking On</span> : <span className="badge badge-secondary">Paused</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">Heartbeat nominal</p>
        </div>
      </motion.div>
    </div>
  )

  const GeofenceConfig = () => (
    <div className="card shadow-sm">
      <div className="pb-0 mb-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <Shield className="h-5 w-5" /> Geofence Configuration
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="label">Fence Name</label>
            <input
              type="text"
              className="input"
              value={fence.name}
              onChange={(e) => setFence({ ...fence, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Latitude</label>
            <input
              type="number"
              className="input"
              value={fence.lat}
              onChange={(e) => setFence({ ...fence, lat: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input
              type="number"
              className="input"
              value={fence.lng}
              onChange={(e) => setFence({ ...fence, lng: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Radius (m)</label>
            <input
              type="number"
              className="input"
              value={fence.radius}
              onChange={(e) => setFence({ ...fence, radius: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div className="flex items-end">
            <button className="btn btn-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const MapCard = () => (
    <div className="card shadow-sm">
      <div className="pb-0 mb-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <MapPin className="h-5 w-5" /> Live Map & Fence
        </div>
      </div>
      <div className="pt-4">
        <div className="w-full h-80 rounded-2xl border border-dashed border-gray-300 grid place-items-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Map placeholder. Integrate Mapbox GL / Leaflet and draw a circle at ({fence.lat.toFixed(4)}, {fence.lng.toFixed(4)}) radius {fence.radius}m.
          </div>
        </div>
      </div>
    </div>
  )

  const EmployeeDetailsPanel = ({ employee }) => {
    if (!employee) return null

    const employeeGroups = groups.filter(g => g.members?.includes(employee.id))
    const employeeSchedules = schedules.filter(s => 
      s.assignedEmployees?.includes(employee.id) || 
      employeeGroups.some(g => s.assignedGroups?.includes(g.id))
    )
    const employeeGeofences = geofences.filter(g => g.assignedUsers?.includes(employee.id))
    const employeeAlerts = geofences
      .filter(g => g.assignedUsers?.includes(employee.id))
      .flatMap(g => g.alerts || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10) // Latest 10 alerts

    return (
      <div className="space-y-4">
        <div className="card shadow-sm">
          <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="font-medium text-lg">{employee.name}</div>
              <div className="text-sm text-gray-500">{employee.role} · {employee.id}</div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {employee.status === 'Inside' ? (
                <span className="badge badge-default">Inside</span>
              ) : (
                <span className="badge badge-outline">Outside</span>
              )}
              {employee.isActive !== false ? (
                <span className="badge badge-success">Active</span>
              ) : (
                <span className="badge badge-danger">Inactive</span>
              )}
              {employee.workSchedule?.enabled && (
                <span className="badge" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', color: 'white' }}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Scheduled
                </span>
              )}
            </div>

            {/* Schedules */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedules ({employeeSchedules.length})
              </h4>
              {employeeSchedules.length === 0 ? (
                <p className="text-sm text-gray-500">No schedules assigned</p>
              ) : (
                <div className="space-y-2">
                  {employeeSchedules.map(schedule => (
                    <div key={schedule.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <div className="font-medium">{schedule.name}</div>
                      <div className="text-xs text-gray-500">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        {schedule.daysOfWeek?.map(d => d.slice(0, 3)).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Groups */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups ({employeeGroups.length})
              </h4>
              {employeeGroups.length === 0 ? (
                <p className="text-sm text-gray-500">Not in any groups</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {employeeGroups.map(group => (
                    <span key={group.id} className="badge badge-secondary">{group.name}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Geofences */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Geofences ({employeeGeofences.length})
              </h4>
              {employeeGeofences.length === 0 ? (
                <p className="text-sm text-gray-500">Not assigned to any geofences</p>
              ) : (
                <div className="space-y-1">
                  {employeeGeofences.map(gf => (
                    <div key={gf.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {gf.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Alerts */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Recent Alerts ({employeeAlerts.length})
              </h4>
              {employeeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500">No recent alerts</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employeeAlerts.map((alert, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          alert.type === 'enter' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {alert.type.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">{alert.geofenceName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const Employees = () => {
    // Filter employees based on search query and status
    const filteredEmployees = employees
      .filter((e) => [e.name, e.id, e.role].join(' ').toLowerCase().includes(query.toLowerCase()))
      .filter((e) => (statusFilter === 'all' ? true : e.status.toLowerCase() === statusFilter))
      .filter((e) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'active') return e.isActive !== false
        if (activeFilter === 'inactive') return e.isActive === false
        return true
      })

    // Calculate pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
      setCurrentPage(1)
    }, [query, statusFilter, activeFilter])

    const handleEdit = (emp) => {
      setEditingEmployee(emp)
      setShowEmployeeModal(true)
    }

    const handleDelete = (emp) => {
      if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
        deleteEmployee(emp.id)
      }
    }

    const handleAdd = () => {
      setEditingEmployee(null)
      setShowEmployeeModal(true)
  }

  return (
      <div className="card shadow-sm">
        <div className="pb-0 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
              <Users className="h-5 w-5" /> Workforce Employees
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length}
              </div>
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleAdd} className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
        <div className="pt-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              className="input"
              placeholder="Search name, role, or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="select w-[140px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Location: All</option>
              <option value="inside">Inside</option>
              <option value="outside">Outside</option>
            </select>
            <select className="select w-[140px]" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {paginatedEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No employees found</p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {paginatedEmployees.map((emp) => (
          <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    selectedEmployee?.id === emp.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {emp.name} <span className="text-gray-400 font-normal">· {emp.role}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {emp.id} · Last seen {Math.round((Date.now() - emp.lastSeen) / 60000)}m ago · Battery {emp.battery}%
                      </div>
                      <div className="mt-1 flex gap-2">
                        {emp.status === 'Inside' ? (
                          <span className="badge badge-default">Inside</span>
                        ) : (
                          <span className="badge badge-outline">Outside</span>
                        )}
                        {emp.isActive !== false ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Inactive</span>
                        )}
                        {emp.workSchedule?.enabled && (
                          <span className="badge" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', color: 'white' }}>
                            <Calendar className="h-3 w-3 mr-1" />
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEmployeeActive(emp.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        emp.isActive !== false
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={emp.isActive !== false ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => simulateEnter(emp)}>
                      Mark IN
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => simulateExit(emp)}>
                      Mark OUT
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(emp)}
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleDelete(emp)}
                      title="Delete Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:shadow-lg cursor-pointer ${
                    selectedEmployee?.id === emp.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.role}</div>
                    </div>
                    <button
                      onClick={() => toggleEmployeeActive(emp.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        emp.isActive !== false
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={emp.isActive !== false ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>ID: {emp.id}</div>
                    <div>Last seen: {Math.round((Date.now() - emp.lastSeen) / 60000)}m ago</div>
                    <div>Battery: {emp.battery}%</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {emp.status === 'Inside' ? (
                      <span className="badge badge-default">Inside</span>
                    ) : (
                      <span className="badge badge-outline">Outside</span>
                    )}
                    {emp.isActive !== false ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                    {emp.workSchedule?.enabled && (
                      <span className="badge" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', color: 'white' }}>
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn btn-secondary btn-sm text-xs" onClick={() => simulateEnter(emp)}>
                      Mark IN
                    </button>
                    <button className="btn btn-outline btn-sm text-xs" onClick={() => simulateExit(emp)}>
                      Mark OUT
                    </button>
                    <button
                      className="btn btn-outline btn-sm text-xs"
                      onClick={() => handleEdit(emp)}
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      className="btn btn-outline btn-sm text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(emp)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && paginatedEmployees.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (page === 1 || page === totalPages) return true
                      if (Math.abs(page - currentPage) <= 1) return true
                      return false
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis between non-consecutive pages
                      const prevPage = arr[idx - 1]
                      const showEllipsisBefore = prevPage && page - prevPage > 1

                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            className={`btn btn-sm min-w-[40px] pagination-btn ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'btn-outline'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      )
                    })}
                </div>
                <button
                  className="btn btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const EmployeeModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      role: '',
      battery: 100,
      isActive: true,
      status: 'Outside',
      workSchedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    })

    useEffect(() => {
      if (editingEmployee) {
        setFormData({
          name: editingEmployee.name || '',
          role: editingEmployee.role || '',
          battery: editingEmployee.battery || 100,
          isActive: editingEmployee.isActive !== undefined ? editingEmployee.isActive : true,
          status: editingEmployee.status || 'Outside',
          workSchedule: editingEmployee.workSchedule || {
            enabled: false,
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          },
        })
      } else {
        setFormData({
          name: '',
          role: '',
          battery: 100,
          isActive: true,
          status: 'Outside',
          workSchedule: {
            enabled: false,
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          },
        })
      }
    }, [editingEmployee])

    const handleSubmit = (e) => {
      e.preventDefault()
      
      if (!formData.name || !formData.role) {
        alert('Please fill in all required fields')
        return
      }

      if (editingEmployee) {
        // Update existing employee
        updateEmployee(editingEmployee.id, formData)
      } else {
        // Add new employee
        addEmployee(formData)
      }
      
      setShowEmployeeModal(false)
      setEditingEmployee(null)
    }

    const handleClose = () => {
      setShowEmployeeModal(false)
      setEditingEmployee(null)
    }

    const toggleDay = (day) => {
      const updatedDays = formData.workSchedule.daysOfWeek.includes(day)
        ? formData.workSchedule.daysOfWeek.filter(d => d !== day)
        : [...formData.workSchedule.daysOfWeek, day]
      setFormData({
        ...formData,
        workSchedule: { ...formData.workSchedule, daysOfWeek: updatedDays }
      })
    }

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    if (!showEmployeeModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter employee name"
                required
              />
            </div>

            <div>
              <label className="label">Role *</label>
              <input
                type="text"
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter role"
                required
              />
            </div>

            <div>
              <label className="label">Battery (%)</label>
              <input
                type="number"
                className="input"
                value={formData.battery}
                onChange={(e) => setFormData({ ...formData, battery: parseInt(e.target.value) || 100 })}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Outside">Outside</option>
                <option value="Inside">Inside</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="label mb-0">Active Status</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{formData.isActive ? 'Active' : 'Inactive'}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Work Schedule Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Work Schedule
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Enable Tracking Schedule</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      workSchedule: { ...formData.workSchedule, enabled: !formData.workSchedule.enabled }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.workSchedule.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.workSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {formData.workSchedule.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4" />
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="input"
                        value={formData.workSchedule.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          workSchedule: { ...formData.workSchedule, startTime: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-2 mb-2">
                        <Moon className="h-4 w-4" />
                        End Time
                      </label>
                      <input
                        type="time"
                        className="input"
                        value={formData.workSchedule.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          workSchedule: { ...formData.workSchedule, endTime: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label mb-2">Working Days</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            formData.workSchedule.daysOfWeek.includes(day)
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Only track this employee during scheduled hours
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                {editingEmployee ? 'Update' : 'Add'} Employee
              </button>
            </div>
          </form>
          </motion.div>
      </div>
    )
  }

  const TimesheetFeed = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [filterType, setFilterType] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTimesheets = timesheets.filter(t => {
      const timesheetDate = new Date(t.timestamp).toISOString().split('T')[0]
      const matchesDate = timesheetDate === selectedDate
      const matchesType = filterType === 'all' || t.event.toLowerCase() === filterType.toLowerCase()
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.geofence?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesDate && matchesType && matchesSearch
    })

    const groupedByEmployee = filteredTimesheets.reduce((acc, t) => {
      if (!acc[t.name]) acc[t.name] = []
      acc[t.name].push(t)
      return acc
    }, {})

    const employeeStats = Object.entries(groupedByEmployee).map(([name, entries]) => {
      const totalDuration = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0)
      const enterExitPairs = entries.filter(e => e.event === 'Enter' || e.event === 'Exit').length
      return { name, totalDuration, enterExitPairs, entries }
    })

    return (
      <div className="card shadow-sm">
        <div className="pb-0 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
              <Clock className="h-5 w-5" /> Timesheet Feed
            </div>
            <div className="badge badge-success">
              {filteredTimesheets.length} entries
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by name, geofence, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              className="select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="enter">Enter</option>
              <option value="exit">Exit</option>
            </select>
          </div>
        </div>
        
        <div className="pt-4">
          {/* Summary Stats */}
          {filteredTimesheets.length > 0 && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {employeeStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="font-medium text-sm text-gray-700 dark:text-gray-300">{stat.name}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">{stat.totalDuration}</span>
                    <span className="text-xs text-gray-500">minutes</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.enterExitPairs} activities</div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3 font-semibold">Timestamp</th>
                    <th className="text-left p-3 font-semibold">Associate</th>
                    <th className="text-left p-3 font-semibold">Event</th>
                    <th className="text-left p-3 font-semibold">Geofence</th>
                    <th className="text-left p-3 font-semibold">Duration</th>
                    <th className="text-left p-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.length === 0 ? (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-12 w-12 text-gray-300" />
                          <p>No timesheet entries found for {new Date(selectedDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters or date range</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTimesheets.map((t, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-t hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {fmt(t.timestamp)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                              {t.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium">{t.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            t.event === 'Enter'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {t.event === 'Enter' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {t.event}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {t.geofence}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-blue-600">
                          {t.durationMinutes ? `${t.durationMinutes}m` : '-'}
                        </td>
                        <td className="p-3 text-gray-500 text-xs max-w-xs truncate" title={t.notes}>
                          {t.notes || '-'}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTimesheets.length} of {timesheets.length} total entries
            </div>
            <button className="btn btn-secondary" onClick={() => exportCSV(filteredTimesheets)}>
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    )
  }

  const Content = () => {
    if (activeTop === 'Dashboard') {
      return (
        <div className="p-4 md:p-6">
          <KPIs />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <GeofenceConfig />
              <MapCard />
            </div>
            <div className="space-y-6">
              <Employees />
              <TimesheetFeed />
            </div>
          </div>
        </div>
      )
    }

    if (activeTop === 'Workforce') {
      return (
        <div className="p-4 md:p-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Employees />
          </div>
          <div className="space-y-6">
            {selectedEmployee ? <EmployeeDetailsPanel employee={selectedEmployee} /> : <TimesheetFeed />}
          </div>
        </div>
      )
    }

    if (activeTop === 'Timesheets') {
      return (
        <div className="p-4 md:p-6">
          <TimesheetFeed />
        </div>
      )
    }

    if (activeTop === 'Geofences') {
      return <Geofences />
    }

    if (activeTop === 'Groups') {
      return <Groups />
    }

    if (activeTop === 'Schedules') {
      return <Schedules />
    }

    if (activeTop === 'Alert Config') {
      return <AlertConfiguration />
    }

    if (activeTop === 'Alerts') {
      return <AlertHistory />
    }

    if (activeTop === 'Reports') {
      return (
        <div className="p-4 md:p-6">
          <div className="card shadow-sm">
            <div className="pb-0 mb-4">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                <BarChart3 className="inline mr-2" /> Reports
              </div>
            </div>
            <div className="pt-4">
              <div className="grid md:grid-cols-3 gap-3">
                {['Attendance & Punctuality', 'Utilization by Site', 'Overtime & Compliance'].map((r) => (
                  <div key={r} className="border rounded-xl p-4">
                    <div className="font-medium mb-1">{r}</div>
                    <div className="text-xs text-gray-500 mb-3">Snapshot preview. Hook up analytics to render charts.</div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary">Run</button>
                      <button className="btn btn-sm btn-outline">Schedule</button>
                      <button className="btn btn-sm btn-ghost">Export</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activeTop === 'Admin') {
      return (
        <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Center
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage system settings and preferences
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6 max-w-2xl"
          >
            <div className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:shadow-2xl transition-all duration-300 group"
                 onClick={() => setActiveTop('Settings')}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <SettingsIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Configure preferences</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">USD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Language:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">English</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }

    if (activeTop === 'HR') {
      return <HRManagement />
    }

    if (activeTop === 'Settings') {
      return <Settings />
    }

    if (activeTop === 'Organization') {
      return <OrganizationSettings />
    }

    if (activeTop === 'Links') {
      return <LinkIntegration />
    }

    if (activeTop === 'Help') {
      return <Help />
    }

    return null
  }

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setAuthView('signup')}
            onSwitchToForgotPassword={() => setAuthView('forgot')}
          />
        )}
        {authView === 'signup' && (
          <Signup 
            onSignupSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
        {authView === 'forgot' && (
          <ForgotPassword 
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
        <Toaster position="top-right" />
      </>
    )
  }

  if (showPasswordChange) {
  return (
      <>
        <ChangePassword onSuccess={handlePasswordChangeSuccess} />
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
      </>
    )
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)]"></div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
        }}
      />
      
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Content />
          </div>
        </main>
      </div>

      <EmployeeModal />

      <div className="flex-shrink-0 px-4 py-4 text-xs text-gray-500 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
        Implementation notes: Mapbox/Leaflet for map, mobile SDK for location, point-in-circle evaluation, persist to backend (Salesforce/Node), SSO + RBAC.
      </div>
    </div>
  )
}

