import React, { useEffect, useCallback, useState, Component } from 'react'
import { useStore } from './store/useStore'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, fontFamily: 'Segoe UI, Arial, sans-serif', direction: 'rtl', color: '#333' }}>
        <h2 style={{ color: '#c00' }}>שגיאה בטעינת התוכנה</h2>
        <pre style={{ background: '#f5f5f5', padding: 12, fontSize: 11, borderRadius: 4, color: '#555', whiteSpace: 'pre-wrap' }}>
          {this.state.error?.message}
        </pre>
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: '6px 18px', cursor: 'pointer' }}>
          נסה שוב
        </button>
      </div>
    )
    return this.props.children
  }
}
// Direct store access for completion callbacks
const { getState: getStoreState } = useStore
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import FormatGrid from './components/FormatGrid'
import Queue from './components/Queue'
import ConversionSetup from './components/ConversionSetup'
import JoinWindow from './components/JoinWindow'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import DocumentsPage from './pages/DocumentsPage'
import {
  VIDEO_INPUT_EXTENSIONS, AUDIO_INPUT_EXTENSIONS, IMAGE_INPUT_EXTENSIONS,
  VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS,
} from './utils/formats'

const ALL_MEDIA_EXTENSIONS = [...new Set([...VIDEO_INPUT_EXTENSIONS, ...AUDIO_INPUT_EXTENSIONS, ...IMAGE_INPUT_EXTENSIONS])]

function detectCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (VIDEO_INPUT_EXTENSIONS.includes(ext)) return 'video'
  if (AUDIO_INPUT_EXTENSIONS.includes(ext)) return 'audio'
  if (IMAGE_INPUT_EXTENSIONS.includes(ext)) return 'image'
  return null
}

const VIDEO_TOOLS = [
  { id: 'extract_audio', label: 'חלץ אודיו', icon: '🎤', ext: 'mp3', ffmpegArgs: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'gif', label: 'וידאו → GIF', icon: '🖼️', ext: 'gif', ffmpegArgs: ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'] },
  { id: 'mute', label: 'הסרת שמע', icon: '🔇', ext: 'mp4', ffmpegArgs: ['-an', '-c:v', 'copy'] },
  { id: 'rotate90', label: 'סיבוב 90°', icon: '🔄', ext: 'mp4', ffmpegArgs: ['-vf', 'transpose=1', '-c:a', 'copy'] },
  { id: 'rotate180', label: 'סיבוב 180°', icon: '🔃', ext: 'mp4', ffmpegArgs: ['-vf', 'transpose=1,transpose=1', '-c:a', 'copy'] },
  { id: 'flip_h', label: 'היפוך אופקי', icon: '↔️', ext: 'mp4', ffmpegArgs: ['-vf', 'hflip', '-c:a', 'copy'] },
  { id: 'flip_v', label: 'היפוך אנכי', icon: '↕️', ext: 'mp4', ffmpegArgs: ['-vf', 'vflip', '-c:a', 'copy'] },
  { id: 'speed2x', label: 'מהירות ×2', icon: '⏩', ext: 'mp4', ffmpegArgs: ['-vf', 'setpts=0.5*PTS', '-af', 'atempo=2.0'] },
  { id: 'speed05x', label: 'האטה ×0.5', icon: '⏪', ext: 'mp4', ffmpegArgs: ['-vf', 'setpts=2.0*PTS', '-af', 'atempo=0.5'] },
]

const AUDIO_TOOLS = [
  { id: 'normalize', label: 'נרמול עוצמה', icon: '🔊', ext: 'mp3', ffmpegArgs: ['-af', 'dynaudnorm', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'mono', label: 'סטריאו → מונו', icon: '🎙️', ext: 'mp3', ffmpegArgs: ['-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'stereo', label: 'מונו → סטריאו', icon: '🎧', ext: 'mp3', ffmpegArgs: ['-ac', '2', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'fadein', label: 'Fade In', icon: '📈', ext: 'mp3', ffmpegArgs: ['-af', 'afade=t=in:st=0:d=3', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'fadeout', label: 'Fade Out', icon: '📉', ext: 'mp3', ffmpegArgs: ['-af', 'afade=t=out:st=0:d=3', '-c:a', 'libmp3lame', '-q:a', '2'] },
]

function FormatPicker({ category, files, onPick, onCancel, onJoin }) {
  const sections = []

  if (category === 'video') {
    sections.push({ label: '🎬 פורמטי וידאו', cat: 'video', formats: VIDEO_FORMATS })
    sections.push({ label: '🎵 אודיו (חילוץ)', cat: 'audio', formats: AUDIO_FORMATS })
    sections.push({ label: '🛠 כלי וידאו', cat: 'tools', formats: VIDEO_TOOLS })
  } else if (category === 'audio') {
    sections.push({ label: '🎵 פורמטי אודיו', cat: 'audio', formats: AUDIO_FORMATS })
    sections.push({ label: '🛠 כלי אודיו', cat: 'tools', formats: AUDIO_TOOLS })
  } else if (category === 'image') {
    sections.push({ label: '🖼️ פורמטי תמונה', cat: 'image', formats: IMAGE_FORMATS })
  }

  const catLabel = category === 'video' ? 'וידאו' : category === 'audio' ? 'אודיו' : 'תמונות'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900,
    }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div style={{
        background: '#f5f5f5', border: '1px solid #888', borderRadius: 4,
        width: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        <div style={{
          background: 'linear-gradient(180deg,#1a5fa8,#0d3d7a)',
          color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 700,
          borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>🔄 {files.length} קובץ/ים ({catLabel}) — המר ל-?</span>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 2, padding: '1px 7px', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: 12, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Merge shortcut for video/audio */}
          {(category === 'video' || category === 'audio') && files.length >= 2 && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#666' }}>רוצה לחבר {files.length} קבצים ביחד?</span>
              <button onClick={() => onJoin(category, files)} style={{ fontSize: 11, padding: '2px 12px', cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 2, fontWeight: 700 }}>
                {category === 'audio' ? '🎵 מזג אודיו' : '🔗 מזג וידאו'}
              </button>
            </div>
          )}

          {sections.map(sec => (
            <div key={sec.cat}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1a3f6f', borderBottom: '1px solid #dde', paddingBottom: 3, marginBottom: 6 }}>
                {sec.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {sec.formats.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => onPick({ ...fmt, _pickedCategory: sec.cat === 'tools' ? category : sec.cat })}
                    style={{
                      width: 84, height: 48, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 1,
                      cursor: 'pointer', background: '#fff', border: '1px solid #c8d8e8',
                      borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#222',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fc'; e.currentTarget.style.borderColor = '#0066cc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#c8d8e8' }}
                  >
                    {fmt.icon && <span style={{ fontSize: 13 }}>{fmt.icon}</span>}
                    <span style={{ fontSize: 10, color: '#0066cc' }}>→ {fmt.label}</span>
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
    openJoinWindow,
    setTaskProgress, setTaskComplete, setTaskError, setTaskRunning,
    clearAll, getPendingTasks, getRunningTasks,
  } = useStore()

  const [formatPicker, setFormatPicker] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [availableHW, setAvailableHW] = useState([])

  useEffect(() => {
    window.electronAPI?.detectHardwareEncoders?.().then(hw => setAvailableHW(hw || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!window.electronAPI) return
    const off1 = window.electronAPI.onProgress(({ taskId, percent, speed, remainingSec, bitrate }) =>
      setTaskProgress(taskId, percent, { speed, remainingSec, bitrate }))
    const off2 = window.electronAPI.onComplete(({ taskId }) => {
      setTaskComplete(taskId)
      // Check if all tasks are done and shutdown is requested
      const { tasks, settings } = getStoreState()
      const stillRunning = tasks.filter(t => t.id !== taskId && (t.status === 'pending' || t.status === 'running'))
      if (stillRunning.length === 0) {
        if (settings.playSoundOnComplete) {
          try {
            const ctx = new AudioContext()
            const t = ctx.currentTime
            ;[
              { freq: 660, start: 0,   dur: 0.18 },
              { freq: 880, start: 0.2, dur: 0.18 },
              { freq: 1100, start: 0.4, dur: 0.28 },
            ].forEach(({ freq, start, dur }) => {
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain); gain.connect(ctx.destination)
              osc.frequency.value = freq
              gain.gain.setValueAtTime(0.25, t + start)
              gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur)
              osc.start(t + start); osc.stop(t + start + dur)
            })
          } catch {}
        }
        if (settings.showNotifications) try {
          if (Notification.permission === 'granted') {
            new Notification('פורמט נקי', { body: 'כל ההמרות הושלמו בהצלחה ✓', silent: true })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => {
              if (p === 'granted') new Notification('פורמט נקי', { body: 'כל ההמרות הושלמו בהצלחה ✓', silent: true })
            })
          }
        } catch {}
        if (settings.shutdownOnComplete) {
          window.electronAPI.shutdown()
        }
      }
    })
    const off3 = window.electronAPI.onError(({ taskId, error }) => setTaskError(taskId, error))
    return () => { off1(); off2(); off3() }
  }, [setTaskProgress, setTaskComplete, setTaskError])

  useEffect(() => {
    if (!window.electronAPI) return
    return window.electronAPI.onMenuAction('clearQueue', clearAll)
  }, [clearAll])

  const [closeConfirmVisible, setCloseConfirmVisible] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.onCheckClose) return
    return window.electronAPI.onCheckClose(() => {
      const { tasks } = useStore.getState()
      const active = tasks.filter(t => t.status === 'pending' || t.status === 'running')
      if (active.length === 0) {
        window.electronAPI.confirmClose()
      } else {
        setCloseConfirmVisible(true)
      }
    })
  }, [])

  const runTask = useCallback(async (task) => {
    try {
      setTaskRunning(task.id, '')  // Mark running immediately to prevent double-start

      // Merge/join tasks use a different IPC path
      if (task.outputFormat?.id === 'merge') {
        const joinFiles = task.settings?.joinFiles || []
        const outputPath = await window.electronAPI?.buildOutputPath(
          joinFiles[0] || task.inputPath,
          task.settings?.outputDir || settings.outputDir || null,
          task.outputFormat?.ext || 'mp4'
        ) || task.inputPath.replace(/\.[^.]+$/, `.${task.outputFormat?.ext || 'mp4'}`)

        const dir = outputPath.substring(0, Math.max(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('\\')))
        if (dir) await window.electronAPI?.ensureDir(dir)

        setTaskRunning(task.id, outputPath)
        const res = await window.electronAPI?.mergeVideos({
          inputPaths: joinFiles,
          outputPath,
          settings: task.settings || {},
        })
        if (res?.success) {
          const { setTaskComplete: stc } = useStore.getState()
          stc(task.id)
        } else {
          const { setTaskError: ste } = useStore.getState()
          ste(task.id, res?.error || 'שגיאה במיזוג')
        }
        return
      }

      const outputPath = await window.electronAPI?.buildOutputPath(
        task.inputPath,
        task.settings?.outputDir || settings.outputDir || null,
        task.outputFormat?.ext || 'mp4'
      ) || task.inputPath.replace(/\.[^.]+$/, `.${task.outputFormat?.ext || 'mp4'}`)

      const dir = outputPath.substring(0, Math.max(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('\\')))
      if (dir) await window.electronAPI?.ensureDir(dir)

      setTaskRunning(task.id, outputPath)  // Update with real path
      const globalSettings = useStore.getState().settings
      await window.electronAPI?.startConversion({
        taskId: task.id,
        inputPath: task.inputPath,
        outputPath,
        settings: {
          ...task.settings || {},
          threadMode: globalSettings.threadMode || 'optimal',
          threadCount: globalSettings.threadCount || null,
        },
        formatArgs: task.outputFormat?.ffmpegArgs || [],
      })
    } catch (err) {
      setTaskError(task.id, err.message)
    }
  }, [settings.outputDir, setTaskRunning, setTaskError])

  const processQueue = useCallback(async () => {
    if (useStore.getState().paused) return
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

  function handleFiles(rawFiles) {
    const files = rawFiles.map(f => ({ name: f.name, path: f.path, size: f.size }))
    if (!files.length) return

    const cats = files.map(f => detectCategory(f.name)).filter(Boolean)
    const catCount = {}
    cats.forEach(c => { catCount[c] = (catCount[c] || 0) + 1 })
    const dominant = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0]

    if (!dominant) return

    setActiveCategory(dominant)
    setFormatPicker({ category: dominant, files })
  }

  useEffect(() => {
    function onDragOver(e) { e.preventDefault(); setDragging(true) }
    function onDragLeave(e) { if (!e.relatedTarget) setDragging(false) }
    async function onDrop(e) {
      e.preventDefault()
      setDragging(false)
      const items = Array.from(e.dataTransfer.files)
      if (!items.length) return

      // Detect directories using main-process fs.stat (reliable on Windows)
      const regularFiles = []
      const dirFiles = []
      for (const f of items) {
        const isDir = f.path && await window.electronAPI?.isDirectory(f.path)
        if (isDir) {
          const found = await window.electronAPI?.scanDirectory(f.path, ALL_MEDIA_EXTENSIONS) || []
          dirFiles.push(...found)
        } else {
          regularFiles.push(f)
        }
      }
      const allFiles = [...regularFiles, ...dirFiles]
      if (allFiles.length) handleFiles(allFiles)
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
    <ErrorBoundary>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#d8dce8', position: 'relative', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
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
          ) : activeCategory === 'tools' ? (
            <ToolsPage />
          ) : activeCategory === 'documents' ? (
            <DocumentsPage />
          ) : (
            <FormatGrid />
          )}
          <Queue onStart={processQueue} />
        </div>
      </div>

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
          onJoin={(kind, files) => {
            openJoinWindow(files, kind)
            setFormatPicker(null)
          }}
          onCancel={() => setFormatPicker(null)}
        />
      )}

      <ConversionSetup availableHW={availableHW} />
      <JoinWindow />

      {closeConfirmVisible && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 6, padding: '24px 32px', maxWidth: 380,
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)', textAlign: 'center', direction: 'rtl',
            fontFamily: 'Segoe UI, Arial, sans-serif',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 8 }}>
              יש משימות פעילות בתור!
            </div>
            <div style={{ fontSize: 12, color: '#556', marginBottom: 22 }}>
              סגירה עכשיו תבטל את כל ההמרות שרצות.<br />האם לסגור בכל זאת?
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => { setCloseConfirmVisible(false); window.electronAPI?.confirmClose() }}
                style={{
                  padding: '7px 22px', cursor: 'pointer', borderRadius: 4,
                  background: 'linear-gradient(180deg,#d9534f,#a02020)',
                  border: '1px solid #801818', color: '#fff', fontWeight: 700, fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >כן, סגור</button>
              <button
                onClick={() => { setCloseConfirmVisible(false); window.electronAPI?.cancelClose() }}
                style={{
                  padding: '7px 22px', cursor: 'pointer', borderRadius: 4,
                  background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)',
                  border: '1px solid #a0a8bc', color: '#334', fontWeight: 700, fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  )
}
