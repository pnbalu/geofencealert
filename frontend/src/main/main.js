import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    app.quit()
  })
}

// IPC handlers for geofence operations
const dataPath = join(app.getPath('userData'), 'geofence-data.json')
const userDataPath = join(app.getPath('userData'), 'user-data.json')
const orgDataPath = join(app.getPath('userData'), 'organization-data.json')
const employeeDataPath = join(app.getPath('userData'), 'employee-data.json')
const timesheetDataPath = join(app.getPath('userData'), 'timesheet-data.json')
const groupDataPath = join(app.getPath('userData'), 'group-data.json')
const scheduleDataPath = join(app.getPath('userData'), 'schedule-data.json')

// Simple password hashing function
const hashPasswordSync = (password) => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// Initialize default admin user if not exists
const initializeDefaultUser = () => {
  if (!existsSync(userDataPath)) {
    const defaultPassword = 'Admin@123' // Default password for first login
    const hashedPassword = hashPasswordSync(defaultPassword)
    
    const defaultUser = {
      users: [{
        id: 'admin-default-001',
        name: 'Admin User',
        email: 'admin@geofencealert.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        department: 'management',
        phone: '',
        isActive: true,
        isFirstLogin: true,
        createdAt: new Date().toISOString(),
      }],
      currentUser: null
    }
    
    writeFileSync(userDataPath, JSON.stringify(defaultUser, null, 2))
    console.log('Default admin user created:')
    console.log('Username: admin')
    console.log('Password: Admin@123')
  }
}

app.whenReady().then(() => {
  // Initialize default user on first run
  initializeDefaultUser()
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('get-geofences', () => {
  try {
    if (existsSync(dataPath)) {
      const data = readFileSync(dataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { geofences: [], alerts: [] }
  } catch (error) {
    console.error('Error reading geofence data:', error)
    return { geofences: [], alerts: [] }
  }
})

ipcMain.handle('save-geofences', (_, data) => {
  try {
    writeFileSync(dataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving geofence data:', error)
    return false
  }
})

ipcMain.handle('show-notification', (_, title, body) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: join(__dirname, '../assets/icon.png'),
    }).show()
  }
})

ipcMain.handle('request-location-permission', async () => {
  try {
    // In a real app, you'd request location permission from the system
    // For now, we'll simulate it
    return true
  } catch (error) {
    console.error('Error requesting location permission:', error)
    return false
  }
})

ipcMain.handle('get-current-location', async () => {
  try {
    // In a real app, you'd use the system's geolocation API
    // For demo purposes, we'll return a mock location
    return {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      accuracy: 10,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Error getting current location:', error)
    return null
  }
})

// IPC handlers for user operations
ipcMain.handle('get-users', () => {
  try {
    if (existsSync(userDataPath)) {
      const data = readFileSync(userDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { users: [], currentUser: null }
  } catch (error) {
    console.error('Error reading user data:', error)
    return { users: [], currentUser: null }
  }
})

ipcMain.handle('save-users', (_, data) => {
  try {
    writeFileSync(userDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    return false
  }
})

// IPC handlers for organization operations
ipcMain.handle('get-organizations', () => {
  try {
    if (existsSync(orgDataPath)) {
      const data = readFileSync(orgDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { organizations: [], currentOrganization: null }
  } catch (error) {
    console.error('Error reading organization data:', error)
    return { organizations: [], currentOrganization: null }
  }
})

ipcMain.handle('save-organizations', (_, data) => {
  try {
    writeFileSync(orgDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving organization data:', error)
    return false
  }
})

// IPC handler for updating user password
ipcMain.handle('update-user-password', (_, userId, hashedPassword) => {
  try {
    if (existsSync(userDataPath)) {
      const data = readFileSync(userDataPath, 'utf-8')
      const userData = JSON.parse(data)
      
      // Find and update the user
      const userIndex = userData.users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        userData.users[userIndex].password = hashedPassword
        userData.users[userIndex].isFirstLogin = false
        
        writeFileSync(userDataPath, JSON.stringify(userData, null, 2))
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error updating user password:', error)
    return false
  }
})

// IPC handlers for employee operations
ipcMain.handle('get-employees', () => {
  try {
    if (existsSync(employeeDataPath)) {
      const data = readFileSync(employeeDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { employees: [] }
  } catch (error) {
    console.error('Error reading employee data:', error)
    return { employees: [] }
  }
})

ipcMain.handle('save-employees', (_, data) => {
  try {
    writeFileSync(employeeDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving employee data:', error)
    return false
  }
})

// IPC handlers for timesheet operations
ipcMain.handle('get-timesheets', () => {
  try {
    if (existsSync(timesheetDataPath)) {
      const data = readFileSync(timesheetDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { timesheets: [] }
  } catch (error) {
    console.error('Error reading timesheet data:', error)
    return { timesheets: [] }
  }
})

ipcMain.handle('save-timesheets', (_, data) => {
  try {
    writeFileSync(timesheetDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving timesheet data:', error)
    return false
  }
})

// IPC handlers for group operations
ipcMain.handle('get-groups', () => {
  try {
    if (existsSync(groupDataPath)) {
      const data = readFileSync(groupDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { groups: [] }
  } catch (error) {
    console.error('Error reading group data:', error)
    return { groups: [] }
  }
})

ipcMain.handle('save-groups', (_, data) => {
  try {
    writeFileSync(groupDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving group data:', error)
    return false
  }
})

// IPC handlers for schedule operations
ipcMain.handle('get-schedules', () => {
  try {
    if (existsSync(scheduleDataPath)) {
      const data = readFileSync(scheduleDataPath, 'utf-8')
      return JSON.parse(data)
    }
    return { schedules: [] }
  } catch (error) {
    console.error('Error reading schedule data:', error)
    return { schedules: [] }
  }
})

ipcMain.handle('save-schedules', (_, data) => {
  try {
    writeFileSync(scheduleDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving schedule data:', error)
    return false
  }
})
