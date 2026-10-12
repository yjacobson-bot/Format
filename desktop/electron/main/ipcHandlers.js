import { ipcMain, dialog, shell, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import {
  probeFile,
  startConversion,
  cancelConversion,
  cancelAll,
  buildOutputPath,
  mergeVideos,
  mixAudio,
  splitVideo,
  addWatermark,
  trimMultiple,
  scanDirectory,
  detectHardwareEncoders,
} from './ffmpegService.js'

export function registerHandlers(mainWindow) {
  ipcMain.handle('dialog:openFiles', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      ...options,
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:openFolderForScan', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:saveFile', async (_, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options)
    return result.canceled ? null : result.filePath
  })

  ipcMain.handle('file:probe', async (_, filePath) => {
    try {
      const meta = await probeFile(filePath)
      return { success: true, data: meta }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('file:exists', (_, filePath) => fs.existsSync(filePath))

  ipcMain.handle('file:isDirectory', (_, filePath) => {
    try { return fs.statSync(filePath).isDirectory() } catch { return false }
  })

  ipcMain.handle('file:open', (_, filePath) => shell.openPath(filePath))

  ipcMain.handle('file:showInFolder', (_, filePath) => shell.showItemInFolder(filePath))

  ipcMain.handle('file:buildOutputPath', (_, inputPath, outputDir, ext) => {
    return buildOutputPath(inputPath, outputDir, ext)
  })

  ipcMain.handle('file:scanDirectory', (_, dirPath, extensions) => {
    return scanDirectory(dirPath, extensions)
  })

  ipcMain.handle('convert:start', (_, { taskId, inputPath, outputPath, settings, formatArgs }) => {
    startConversion(
      taskId,
      inputPath,
      outputPath,
      settings,
      formatArgs,
      (id, percent, details) => mainWindow.webContents.send('convert:progress', { taskId: id, percent, ...details }),
      (id) => mainWindow.webContents.send('convert:complete', { taskId: id }),
      (id, error) => mainWindow.webContents.send('convert:error', { taskId: id, error }),
    )
    return { success: true }
  })

  ipcMain.handle('convert:cancel', (_, taskId) => {
    cancelConversion(taskId)
    return { success: true }
  })

  ipcMain.handle('convert:cancelAll', () => {
    cancelAll()
    return { success: true }
  })

  ipcMain.handle('tools:mergeVideos', async (_, { inputPaths, outputPath, settings }) => {
    try {
      if (settings?.mergeMode === 'mix') {
        await mixAudio(inputPaths, outputPath, settings.weights, settings, (percent) => {
          mainWindow.webContents.send('tools:mergeProgress', { percent })
        })
      } else {
        await mergeVideos(inputPaths, outputPath, settings, (percent) => {
          mainWindow.webContents.send('tools:mergeProgress', { percent })
        })
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tools:splitVideo', async (_, { inputPath, outputDir, segmentDuration }) => {
    try {
      await splitVideo(inputPath, outputDir, segmentDuration)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tools:trimMultiple', async (_, { inputPath, outputPath, segments, exportMode }) => {
    try {
      await trimMultiple(inputPath, outputPath, segments, exportMode)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tools:addWatermark', async (_, { videoPath, watermarkPath, outputPath, position }) => {
    try {
      await addWatermark(videoPath, watermarkPath, outputPath, position)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('ffmpeg:detectHW', () => detectHardwareEncoders())

  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('app:getOutputDir', () => {
    return path.join(app.getPath('videos'), 'FormatFactory')
  })

  ipcMain.handle('fs:ensureDir', (_, dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true })
    return true
  })

  // Shutdown the computer after queue completes
  ipcMain.handle('system:shutdown', () => {
    if (process.platform === 'win32') {
      exec('shutdown /s /t 30 /c "פורמט נקי: ההמרות הושלמו. המחשב יכבה בעוד 30 שניות."')
    } else if (process.platform === 'darwin') {
      exec('osascript -e \'tell app "System Events" to shut down\'')
    } else {
      exec('shutdown -h +1')
    }
    return { success: true }
  })

  ipcMain.handle('system:cancelShutdown', () => {
    if (process.platform === 'win32') {
      exec('shutdown /a')
    }
    return { success: true }
  })

  ipcMain.on('app:confirm-close', () => {
    mainWindow._forceClose = true
    mainWindow.close()
  })

  ipcMain.on('app:cancel-close', () => {
    // nothing — window stays open
  })
}
