import React, { useState } from 'react'
import { IMAGE_FORMATS, IMAGE_INPUT_EXTENSIONS } from '../utils/formats'
import { getDefaultImageSettings } from '../utils/presets'
import { useStore } from '../store/useStore'
import FormatCard from '../components/FormatCard'
import OutputSettingsModal from '../components/OutputSettingsModal'

export default function ImagePage() {
  const { setActiveOutputFormat, activeOutputFormat, addTasks, settings } = useStore()
  const [showSettings, setShowSettings] = useState(false)
  const [convSettings, setConvSettings] = useState(getDefaultImageSettings())
  const [outputDir, setOutputDir] = useState('')

  const handleFormatSelect = (fmt) => {
    setActiveOutputFormat(fmt)
    setShowSettings(true)
  }

  const handlePickFiles = async () => {
    if (!activeOutputFormat) { alert('Select a format first'); return }
    if (!window.electronAPI) return
    const paths = await window.electronAPI.openFiles({
      filters: [{ name: 'Image Files', extensions: IMAGE_INPUT_EXTENSIONS }],
    })
    if (paths?.length) {
      addTasks(
        paths.map(p => ({ path: p, name: p.split(/[\\/]/).pop(), size: 0 })),
        activeOutputFormat,
        { ...convSettings, outputDir: outputDir || settings.outputDir }
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
        <span style={{ color: '#1d4ed8', fontSize: 16 }}>🖼️</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>המרת תמונות</span>
        <div style={{ flex: 1 }} />
        {activeOutputFormat && (
          <>
            <span style={{ background: '#1d4ed8', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 2 }}>
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
          בחר פורמט תמונה פלט:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {IMAGE_FORMATS.map(fmt => (
            <FormatCard key={fmt.id} format={fmt} category="image" onSelect={handleFormatSelect} />
          ))}
        </div>

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
          <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#777', marginBottom: 3 }}>
            {activeOutputFormat ? `הוסף קבצי תמונה → ${activeOutputFormat.label}` : 'בחר פורמט למעלה תחילה'}
          </div>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            לחץ כאן או גרור • תומך: JPG, PNG, BMP, GIF, WebP, TIFF...
          </div>
        </div>
      </div>

      {showSettings && activeOutputFormat && (
        <OutputSettingsModal
          category="image"
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
