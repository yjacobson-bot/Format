import React, { useEffect, useCallback } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ConversionQueue from './components/ConversionQueue'
import VideoPage from './pages/VideoPage'
import AudioPage from './pages/AudioPage'
import ImagePage from './pages/ImagePage'
import DVDPage from './pages/DVDPage'
import ToolsPage from './pages/ToolsPage'
import SettingsPage from './pages/SettingsPage'

const PAGES = {
  video: VideoPage,
  audio: AudioPage,
  image: ImagePage,
  dvd: DVDPage,
  tools: ToolsPage,
  settings: SettingsPage,
}

export default function App() {
  const {
    activeCategory, tasks, settings,
    setTaskProgress, setTaskComplete, setTaskError, setTaskRunning,
    clearAll, getPendingTasks, getRunningTasks,
  } = useStore()

  // Wire up IPC events from Electron main process
  useEffect(() => {
    if (!window.electronAPI) return
    const off1 = window.electronAPI.onProgress(({ taskId, percent }) => setTaskProgress(taskId, percent))
    const off2 = window.electronAPI.onComplete(({ taskId }) => setTaskComplete(taskId))
    const off3 = window.electronAPI.onError(({ taskId, error }) => setTaskError(taskId, error))
    return () => { off1(); off2(); off3() }
  }, [setTaskProgress, setTaskComplete, setTaskError])

  useEffect(() => {
    if (!window.electronAPI) return
    return window.electronAPI.onMenuAction('clearQueue', clearAll)
  }, [clearAll])

  const runTask = useCallback(async (task) => {
    try {
      const outputPath = await window.electronAPI?.buildOutputPath(
        task.inputPath,
        task.settings?.outputDir || settings.outputDir || null,
        task.outputFormat?.ext || 'mp4'
      ) || task.inputPath.replace(/\.[^.]+$/, `.${task.outputFormat?.ext || 'mp4'}`)

      const dir = outputPath.substring(0, Math.max(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('\\')))
      if (dir) await window.electronAPI?.ensureDir(dir)

      setTaskRunning(task.id, outputPath)
      await window.electronAPI?.startConversion({
        taskId: task.id,
        inputPath: task.inputPath,
        outputPath,
        settings: task.settings || {},
        formatArgs: task.outputFormat?.ffmpegArgs || [],
      })
    } catch (err) {
      setTaskError(task.id, err.message)
    }
  }, [settings.outputDir, setTaskRunning, setTaskError])

  const processQueue = useCallback(async () => {
    const running = getRunningTasks()
    const pending = getPendingTasks()
    const slots = (settings.maxConcurrent || 2) - running.length
    if (slots <= 0 || pending.length === 0) return
    pending.slice(0, slots).forEach(runTask)
  }, [getRunningTasks, getPendingTasks, settings.maxConcurrent, runTask])

  // Auto-process queue when tasks change
  useEffect(() => {
    if (getPendingTasks().length > 0 && getRunningTasks().length < (settings.maxConcurrent || 2)) {
      processQueue()
    }
  }, [tasks, processQueue, getPendingTasks, getRunningTasks, settings.maxConcurrent])

  const handleStartAll = () => processQueue()
  const handleClearAll = () => {
    window.electronAPI?.cancelAll()
    clearAll()
  }

  const PageComponent = PAGES[activeCategory] || VideoPage

  return (
    // FF layout: sidebar | [header + main + queue]
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#ebebeb' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Header onStartAll={handleStartAll} onClearAll={handleClearAll} />

        {/* Main content area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PageComponent />
        </div>

        {/* Queue panel at bottom - always visible */}
        <ConversionQueue onStartAll={handleStartAll} />
      </div>
    </div>
  )
}
