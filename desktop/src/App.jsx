import React, { useEffect, useCallback, useState } from 'react'
import { useStore } from './store/useStore'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import FormatGrid from './components/FormatGrid'
import Queue from './components/Queue'
import ConversionSetup from './components/ConversionSetup'
import JoinWindow from './components/JoinWindow'
import SettingsPage from './pages/SettingsPage'
import {
  VIDEO_INPUT_EXTENSIONS, AUDIO_INPUT_EXTENSIONS, IMAGE_INPUT_EXTENSIONS,
  VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS,
} from './utils/formats'

function detectCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (VIDEO_INPUT_EXTENSIONS.includes(ext)) return 'video'
  if (AUDIO_INPUT_EXTENSIONS.includes(ext)) return 'audio'
  if (IMAGE_INPUT_EXTENSIONS.includes(ext)) return 'image'
  return null
}

// When files are dropped/added without a specific format chosen,
// show a quick format picker overlay
function FormatPicker({ category, files, onPick, onCancel }) {
  const LABELS = { video: 'וידאו', audio: 'אודיו', image: 'תמונות' }

  // For video files, also offer audio output formats (extract audio)
  const sections = category === 'video'
    ? [
        { label: 'וידאו', cat: 'video', formats: VIDEO_FORMATS },
        { label: 'אודיו (חילוץ)', cat: 'audio', formats: AUDIO_FORMATS },
      ]
    : [{ label: LABELS[category] || category, cat: category, formats: category === 'audio' ? AUDIO_FORMATS : IMAGE_FORMATS }]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900,
    }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div style={{
        background: '#f5f5f5', border: '1px solid #888', borderRadius: 4,
        width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        <div style={{
          background: 'linear-gradient(180deg,#1a5fa8,#0d3d7a)',
          color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 700,
          borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between',
        }}>
          <span>🔄 {files.length} קובץ/ים — המר ל-?</span>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 2, padding: '1px 7px' }}>✕</button>
        </div>
        <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
            זוהו קבצי <strong>{LABELS[category] || category}</strong>. בחר פורמט יעד:
          </div>
          {sections.map(sec => (
            <div key={sec.cat} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1a3f6f', borderBottom: '1px solid #dde', paddingBottom: 3, marginBottom: 6 }}>
                {sec.cat === 'audio' ? '🎵' : '🎬'} {sec.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sec.formats.map(fmt => (
                  <button key={fmt.id} onClick={() => onPick({ ...fmt, _pickedCategory: sec.cat })} style={{
                    width: 90, height: 50, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 2,
                    cursor: 'pointer', background: '#fff', border: '1px solid #c8d8e8',
                    borderRadius: 4, fontSize: 11, fontWeight: 700,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fc'; e.currentTarget.style.borderColor = '#0066cc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#c8d8e8' }}
                  >
                    <span style={{ color: '#0066cc', fontSize: 13 }}>→</span>
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '6px 12px', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ fontSize: 11, padding: '3px 14px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2 }}>ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const {
    activeCategory, setActiveCategory, tasks, settings,
    setupWindow, openSetupWindow, updateSetupFiles,
    setTaskProgress, setTaskComplete, setTaskError, setTaskRunning,
    clearAll, getPendingTasks, getRunningTasks,
  } = useStore()

  const [formatPicker, setFormatPicker] = useState(null) // { category, files }
  const [dragging, setDragging] = useState(false)

  // Wire IPC events
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

  useEffect(() => {
    if (getPendingTasks().length > 0 && getRunningTasks().length < (settings.maxConcurrent || 2)) {
      processQueue()
    }
  }, [tasks, processQueue, getPendingTasks, getRunningTasks, settings.maxConcurrent])

  const handleStop = () => window.electronAPI?.cancelAll()

  // Handle files dropped/added without clicking a specific format
  function handleFiles(rawFiles) {
    const files = rawFiles.map(f => ({ name: f.name, path: f.path, size: f.size }))
    if (!files.length) return

    // Detect predominant category
    const cats = files.map(f => detectCategory(f.name)).filter(Boolean)
    const catCount = {}
    cats.forEach(c => { catCount[c] = (catCount[c] || 0) + 1 })
    const dominant = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0]

    if (!dominant) return // unknown file types

    setActiveCategory(dominant)

    // If a format is currently "selected" via the active category, show format picker
    setFormatPicker({ category: dominant, files })
  }

  // Global drag & drop on window
  useEffect(() => {
    function onDragOver(e) { e.preventDefault(); setDragging(true) }
    function onDragLeave(e) { if (!e.relatedTarget) setDragging(false) }
    function onDrop(e) {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) handleFiles(files)
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#ebebeb', position: 'relative' }}>
      <Toolbar
        onStart={processQueue}
        onStop={handleStop}
        onAddFiles={handleFiles}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeCategory === 'settings' ? (
            <div style={{ flex: 1, overflow: 'auto' }}><SettingsPage /></div>
          ) : (
            <FormatGrid />
          )}
          <Queue onStart={processQueue} />
        </div>
      </div>

      {/* Drag overlay */}
      {dragging && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,102,204,0.15)',
          border: '3px dashed #0066cc', zIndex: 800, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '20px 40px',
            fontSize: 16, fontWeight: 700, color: '#0066cc', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            📂 שחרר קבצים לפה
          </div>
        </div>
      )}

      {/* Format picker (after drop without specific format) */}
      {formatPicker && (
        <FormatPicker
          category={formatPicker.category}
          files={formatPicker.files}
          onPick={(fmt) => {
            const cat = fmt._pickedCategory || formatPicker.category
            const { _pickedCategory, ...cleanFmt } = fmt
            openSetupWindow(cleanFmt, cat, formatPicker.files)
            setFormatPicker(null)
          }}
          onCancel={() => setFormatPicker(null)}
        />
      )}

      {/* Conversion setup window */}
      <ConversionSetup />

      {/* Join window */}
      <JoinWindow />
    </div>
  )
}
