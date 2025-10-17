export const GEOFENCE_TYPES = [
  {
    id: 'factory',
    label: 'Factory',
    icon: '🏭',
    color: '#ef4444',
    defaultRadius: 100,
    shape: 'polygon',
  },
  {
    id: 'school',
    label: 'School',
    icon: '🏫',
    color: '#3b82f6',
    defaultRadius: 50,
    shape: 'polygon',
  },
  {
    id: 'construction',
    label: 'Construction',
    icon: '🚧',
    color: '#f59e0b',
    defaultRadius: 200,
    shape: 'polygon',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '📍',
    color: '#8b5cf6',
    defaultRadius: 100,
    shape: 'polygon',
  },
]

// Default polygon shapes for different geofence types
export const DEFAULT_POLYGONS = {
  factory: [
    { latitude: 37.7749, longitude: -122.4194 },
    { latitude: 37.7759, longitude: -122.4194 },
    { latitude: 37.7759, longitude: -122.4184 },
    { latitude: 37.7749, longitude: -122.4184 },
  ],
  school: [
    { latitude: 37.7849, longitude: -122.4094 },
    { latitude: 37.7859, longitude: -122.4094 },
    { latitude: 37.7859, longitude: -122.4084 },
    { latitude: 37.7849, longitude: -122.4084 },
  ],
  construction: [
    { latitude: 37.7649, longitude: -122.4294 },
    { latitude: 37.7669, longitude: -122.4294 },
    { latitude: 37.7669, longitude: -122.4274 },
    { latitude: 37.7649, longitude: -122.4274 },
  ],
  custom: [
    { latitude: 37.7549, longitude: -122.4394 },
    { latitude: 37.7559, longitude: -122.4394 },
    { latitude: 37.7559, longitude: -122.4384 },
    { latitude: 37.7549, longitude: -122.4384 },
  ],
}

// User roles and types
export const USER_ROLES = [
  {
    id: 'admin',
    label: 'Administrator',
    icon: '👑',
    color: '#dc2626',
    permissions: ['manage_users', 'manage_geofences', 'view_all_alerts', 'manage_settings'],
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    icon: '👨‍💼',
    color: '#2563eb',
    permissions: ['manage_geofences', 'view_all_alerts', 'manage_assigned_users'],
  },
  {
    id: 'employee',
    label: 'Employee',
    icon: '👷',
    color: '#16a34a',
    permissions: ['view_own_alerts'],
  },
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    color: '#7c3aed',
    permissions: ['view_own_alerts'],
  },
  {
    id: 'visitor',
    label: 'Visitor',
    icon: '👤',
    color: '#ea580c',
    permissions: ['view_own_alerts'],
  },
]

export const USER_DEPARTMENTS = [
  { id: 'production', label: 'Production', icon: '🏭' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'hr', label: 'Human Resources', icon: '👥' },
  { id: 'it', label: 'IT', icon: '💻' },
  { id: 'management', label: 'Management', icon: '📊' },
  { id: 'security', label: 'Security', icon: '🚨' },
  { id: 'other', label: 'Other', icon: '📋' },
]
