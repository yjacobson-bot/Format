import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: (options) => ipcRenderer.invoke('dialog:openFiles', options),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openFolderForScan: () => ipcRenderer.invoke('dialog:openFolderForScan'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  probeFile: (filePath) => ipcRenderer.invoke('file:probe', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
  isDirectory: (filePath) => ipcRenderer.invoke('file:isDirectory', filePath),
  openFile: (filePath) => ipcRenderer.invoke('file:open', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('file:showInFolder', filePath),
  buildOutputPath: (inputPath, outputDir, ext) => ipcRenderer.invoke('file:buildOutputPath', inputPath, outputDir, ext),
  scanDirectory: (dirPath, extensions) => ipcRenderer.invoke('file:scanDirectory', dirPath, extensions),

  startConversion: (params) => ipcRenderer.invoke('convert:start', params),
  cancelConversion: (taskId) => ipcRenderer.invoke('convert:cancel', taskId),
  cancelAll: () => ipcRenderer.invoke('convert:cancelAll'),

  mergeVideos: (params) => ipcRenderer.invoke('tools:mergeVideos', params),
  splitVideo: (params) => ipcRenderer.invoke('tools:splitVideo', params),
  addWatermark: (params) => ipcRenderer.invoke('tools:addWatermark', params),

  detectHardwareEncoders: () => ipcRenderer.invoke('ffmpeg:detectHW'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getDefaultOutputDir: () => ipcRenderer.invoke('app:getOutputDir'),
  ensureDir: (dirPath) => ipcRenderer.invoke('fs:ensureDir', dirPath),

  shutdown: () => ipcRenderer.invoke('system:shutdown'),
  cancelShutdown: () => ipcRenderer.invoke('system:cancelShutdown'),

  onProgress: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('convert:progress', handler)
    return () => ipcRenderer.removeListener('convert:progress', handler)
  },
  onComplete: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('convert:complete', handler)
    return () => ipcRenderer.removeListener('convert:complete', handler)
  },
  onError: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('convert:error', handler)
    return () => ipcRenderer.removeListener('convert:error', handler)
  },
  onMergeProgress: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('tools:mergeProgress', handler)
    return () => ipcRenderer.removeListener('tools:mergeProgress', handler)
  },
  onMenuAction: (action, callback) => {
    const handler = (_, ...args) => callback(...args)
    ipcRenderer.on(`menu:${action}`, handler)
    return () => ipcRenderer.removeListener(`menu:${action}`, handler)
  },
})
