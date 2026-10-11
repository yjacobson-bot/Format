import React, { useState } from 'react'
import { VIDEO_FORMATS, VIDEO_INPUT_EXTENSIONS } from '../utils/formats'
import { getDefaultVideoSettings } from '../utils/presets'
import { useStore } from '../store/useStore'
import FormatCard from '../components/FormatCard'
import FileDropZone from '../components/FileDropZone'
import OutputSettingsModal from '../components/OutputSettingsModal'

export default function VideoPage() {
  const { setActiveOutputFormat, activeOutputFormat, addTasks, settings } = useStore()
  const [showSettings, setShowSettings] = useState(false)
  const [convSettings, setConvSettings] = useState(getDefaultVideoSettings())
  const [outputDir, setOutputDir] = useState('')

  const filters = [{ name: 'Video Files', extensions: VIDEO_INPUT_EXTENSIONS }]

  const handleFormatSelect = (fmt) => {
    setActiveOutputFormat(fmt)
    setShowSettings(true)
  }

  const handleFiles = (files) => {
    if (!activeOutputFormat) {
      alert('Please select an output format first.')
      return
    }
    const tasks = files.map(f => ({
      path: f.path || f.name,
      name: f.name || f.path?.split(/[\\/]/).pop(),
      size: f.size || 0,
    }))
    addTasks(tasks, activeOutputFormat, { ...convSettings, outputDir: outputDir || settings.outputDir })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#ebebeb' }}>
      {/* Toolbar row - like FF */}
      <div style={{
        background: '#f8f8f8', borderBottom: '1px solid #ccc',
        padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#dc2626', fontSize: 16 }}>🎬</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>המרת וידאו</span>
        <div style={{ flex: 1 }} />
        {activeOutputFormat && (
          <>
            <span style={{ fontSize: 11, color: '#555' }}>נבחר:</span>
            <span style={{
              background: '#dc2626', color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 2,
            }}>
              {activeOutputFormat.label}
            </span>
            <button onClick={() => setShowSettings(true)} style={{
              background: '#1a5fa8', color: '#fff', border: 'none', borderRadius: 2,
              padding: '3px 8px', fontSize: 11, cursor: 'pointer',
            }}>
              ⚙ הגדרות פלט
            </button>
            <button onClick={() => setActiveOutputFormat(null)} style={{
              background: '#e0e0e0', color: '#555', border: '1px solid #bbb', borderRadius: 2,
              padding: '3px 8px', fontSize: 11, cursor: 'pointer',
            }}>
              ✕ נקה
            </button>
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {/* Format grid - FF style */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8, fontWeight: 600 }}>
            בחר פורמט פלט:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VIDEO_FORMATS.map(fmt => (
              <FormatCard key={fmt.id} format={fmt} category="video" onSelect={handleFormatSelect} />
            ))}
          </div>
        </div>

        {/* Drop zone - FF style */}
        <div style={{
          margin: '10px 0',
          border: '2px dashed #bbb', borderRadius: 2,
          background: '#f5f5f5', padding: 12,
          cursor: activeOutputFormat ? 'pointer' : 'default',
          opacity: activeOutputFormat ? 1 : 0.6,
        }}
          onClick={async () => {
            if (!activeOutputFormat) { alert('Select a format first'); return }
            if (window.electronAPI) {
              const paths = await window.electronAPI.openFiles({ filters })
              if (paths?.length) {
                handleFiles(paths.map(p => ({ path: p, name: p.split(/[\\/]/).pop(), size: 0 })))
              }
            }
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            if (!activeOutputFormat) return
            const files = Array.from(e.dataTransfer.files)
            handleFiles(files.map(f => ({ path: f.path, name: f.name, size: f.size })))
          }}
        >
          <div style={{ textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
              {activeOutputFormat ? `הוסף קבצים להמרה → ${activeOutputFormat.label}` : 'בחר פורמט למעלה תחילה'}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>
              לחץ כאן או גרור קבצי וידאו • תומך: {VIDEO_INPUT_EXTENSIONS.slice(0, 8).join(', ')}...
            </div>
          </div>
        </div>
      </div>

      {showSettings && activeOutputFormat && (
        <OutputSettingsModal
          category="video"
          format={activeOutputFormat}
          settings={convSettings}
          onChange={setConvSettings}
          outputDir={outputDir}
          onOutputDirChange={setOutputDir}
          onClose={() => setShowSettings(false)}
          onApply={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
