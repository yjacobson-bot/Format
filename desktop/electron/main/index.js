import { app, BrowserWindow, Menu, nativeTheme } from 'electron'
import path from 'path'
import { registerHandlers } from './ipcHandlers.js'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f0f0f0',
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../out/renderer/index.html'))
  }

  registerHandlers(mainWindow)

  Menu.setApplicationMenu(createMenu())
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Open Files...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow.webContents.send('menu:openFiles') },
        { type: 'separator' },
        { label: 'Clear Queue', click: () => mainWindow.webContents.send('menu:clearQueue') },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' },
      ],
    },
    {
      label: 'Options',
      submenu: [
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow.webContents.send('menu:openSettings') },
        { type: 'separator' },
        { label: 'Dark Mode', type: 'checkbox', checked: false, click: (item) => {
          nativeTheme.themeSource = item.checked ? 'dark' : 'light'
          mainWindow.webContents.send('menu:toggleTheme', item.checked)
        }},
      ],
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'Merge Videos', click: () => mainWindow.webContents.send('menu:mergeVideos') },
        { label: 'Split Video', click: () => mainWindow.webContents.send('menu:splitVideo') },
        { label: 'Add Watermark', click: () => mainWindow.webContents.send('menu:addWatermark') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: `About Format Factory v${app.getVersion()}`, click: () => mainWindow.webContents.send('menu:about') },
      ],
    },
  ]
  return Menu.buildFromTemplate(template)
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
