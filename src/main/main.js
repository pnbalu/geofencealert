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
      preload: join(__dirname, 'preload.js'),
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

app.whenReady().then(() => {
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

// IPC handlers for geofence operations
const dataPath = join(app.getPath('userData'), 'geofence-data.json')

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
