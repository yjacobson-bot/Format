import React, { useState } from 'react'
import { AUDIO_FORMATS, AUDIO_INPUT_EXTENSIONS, VIDEO_INPUT_EXTENSIONS } from '../utils/formats'
import { getDefaultAudioSettings } from '../utils/presets'
import { useStore } from '../store/useStore'
import FormatCard from '../components/FormatCard'
import OutputSettingsModal from '../components/OutputSettingsModal'

export default function AudioPage() {
  const { setActiveOutputFormat, activeOutputFormat, addTasks, settings } = useStore()
  const [showSettings, setShowSettings] = useState(false)
  const [convSettings, setConvSettings] = useState(getDefaultAudioSettings())
  const [outputDir, setOutputDir] = useState('')
  const [extractFromVideo, setExtractFromVideo] = useState(false)

  const handleFormatSelect = (fmt) => {
    setActiveOutputFormat(fmt)
    setShowSettings(true)
  }

  const handlePickFiles = async () => {
    if (!activeOutputFormat) { alert('Select a format first'); return }
    if (!window.electronAPI) return
    const extensions = extractFromVideo ? VIDEO_INPUT_EXTENSIONS : AUDIO_INPUT_EXTENSIONS
    const paths = await window.electronAPI.openFiles({
      filters: [{ name: extractFromVideo ? 'Video Files' : 'Audio Files', extensions }],
    })
    if (paths?.length) {
      addTasks(
        paths.map(p => ({ path: p, name: p.split(/[\\/]/).pop(), size: 0 })),
        activeOutputFormat,
        { ...convSettings, extractAudio: extractFromVideo, outputDir: outputDir || settings.outputDir }
      )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#ebebeb' }}>
      {/* Toolbar */}
      <div style={{
        background: '#f8f8f8', borderBottom: '1px solid #ccc',
        padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#16a34a', fontSize: 16 }}>🎵</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>המרת אודיו</span>

        {/* Extract from video toggle */}
        <div style={{
          marginLeft: 16, display: 'flex', alignItems: 'center', gap: 5,
          background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 2, padding: '2px 8px',
        }}>
          <input type="checkbox" id="extractVid" checked={extractFromVideo}
            onChange={e => setExtractFromVideo(e.target.checked)} style={{ cursor: 'pointer' }} />
          <label htmlFor="extractVid" style={{ fontSize: 11, color: '#92400e', cursor: 'pointer', fontWeight: 600 }}>
            🎬→🎵 חלץ אודיו מוידאו
          </label>
        </div>

        <div style={{ flex: 1 }} />

        {activeOutputFormat && (
          <>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 2 }}>
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
        <div style={{ fontSize: 11, color: '#666', marginBottom: 8, fontWeight: 600 }}>
          בחר פורמט אודיו פלט:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {AUDIO_FORMATS.map(fmt => (
            <FormatCard key={fmt.id} format={fmt} category="audio" onSelect={handleFormatSelect} />
          ))}
        </div>

        {/* Drop / click zone */}
        <div
          onClick={handlePickFiles}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            if (!activeOutputFormat) return
            const files = Array.from(e.dataTransfer.files)
            addTasks(
              files.map(f => ({ path: f.path, name: f.name, size: f.size })),
              activeOutputFormat,
              { ...convSettings, outputDir: outputDir || settings.outputDir }
            )
          }}
          style={{
            border: '2px dashed #bbb', borderRadius: 2, background: '#f5f5f5',
            padding: 12, cursor: activeOutputFormat ? 'pointer' : 'default',
            opacity: activeOutputFormat ? 1 : 0.6, textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#777', marginBottom: 3 }}>
            {activeOutputFormat
              ? `הוסף קבצי ${extractFromVideo ? 'וידאו' : 'אודיו'} → ${activeOutputFormat.label}`
              : 'בחר פורמט למעלה תחילה'}
          </div>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            לחץ כאן או גרור קבצים
          </div>
        </div>
      </div>

      {showSettings && activeOutputFormat && (
        <OutputSettingsModal
          category="audio"
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
