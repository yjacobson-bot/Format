import React from 'react'
import { useStore } from '../store/useStore'

export default function Toolbar({ onStart, onStop, onAddFiles }) {
  const { settings, updateSettings, getStats } = useStore()
  const stats = getStats()
  const hasRunning = stats.running > 0
  const hasPending = stats.pending > 0

  async function handleAddFile() {
    const files = await window.electronAPI?.openFiles({ multiple: true })
    if (files?.length) onAddFiles(files)
  }

  async function handleAddFolder() {
    const dir = await window.electronAPI?.openFolderForScan()
    if (!dir) return
    const { VIDEO_INPUT_EXTENSIONS, AUDIO_INPUT_EXTENSIONS, IMAGE_INPUT_EXTENSIONS } = await import('../utils/formats.js')
    const exts = [...new Set([...VIDEO_INPUT_EXTENSIONS, ...AUDIO_INPUT_EXTENSIONS, ...IMAGE_INPUT_EXTENSIONS])]
    const found = await window.electronAPI?.scanDirectory(dir, exts)
    if (found?.length) onAddFiles(found)
  }

  async function handleOutputFolder() {
    const folder = await window.electronAPI?.openFolder()
    if (folder) updateSettings({ outputDir: folder })
  }

  const BIG_BTN = (extra) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 3, padding: '4px 14px', cursor: 'pointer', border: '1px solid',
    borderRadius: 3, minWidth: 62, height: 52, fontSize: 10, fontWeight: 600,
    fontFamily: 'inherit', transition: 'filter 0.1s',
    ...extra,
  })

  return (
    <div style={{
      background: 'linear-gradient(180deg,#eef0f5,#d8dce8)',
      borderBottom: '2px solid #a8aec0',
      display: 'flex', alignItems: 'center',
      padding: '4px 8px', gap: 2, flexShrink: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        paddingRight: 12, marginRight: 8, borderRight: '1px solid #b0b5c8',
      }}>
        <span style={{ fontSize: 26 }}>🔄</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1a3a7a', lineHeight: 1.1 }}>פורמט נקי</div>
          <div style={{ fontSize: 8, color: '#7080a0', lineHeight: 1 }}>ממיר מדיה חינמי</div>
        </div>
      </div>

      <div style={{ width: 1, height: 44, background: '#b0b5c8', margin: '0 6px' }} />

      {/* Start */}
      <button
        style={BIG_BTN({
          background: hasPending
            ? 'linear-gradient(180deg,#5cb85c,#3d8b3d)'
            : 'linear-gradient(180deg,#c8d8c8,#b0c8b0)',
          borderColor: hasPending ? '#2d6a2d' : '#90a890',
          color: hasPending ? '#fff' : '#889088',
          cursor: hasPending ? 'pointer' : 'default',
        })}
        onClick={onStart}
        disabled={!hasPending}
        title="התחל המרה"
      >
        <span style={{ fontSize: 20 }}>▶</span>
        <span>התחל{hasPending ? ` (${stats.pending})` : ''}</span>
      </button>

      {/* Stop */}
      <button
        style={BIG_BTN({
          background: hasRunning
            ? 'linear-gradient(180deg,#d9534f,#a02020)'
            : 'linear-gradient(180deg,#e0c8c8,#d0b8b8)',
          borderColor: hasRunning ? '#801818' : '#c0a0a0',
          color: hasRunning ? '#fff' : '#a08080',
          cursor: hasRunning ? 'pointer' : 'default',
        })}
        onClick={onStop}
        disabled={!hasRunning}
        title="עצור הכל"
      >
        <span style={{ fontSize: 20 }}>■</span>
        <span>עצור</span>
      </button>

      <div style={{ width: 1, height: 44, background: '#b0b5c8', margin: '0 4px' }} />

      {/* Add File */}
      <button
        style={BIG_BTN({
          background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)',
          borderColor: '#a0a8bc', color: '#334',
        })}
        onClick={handleAddFile}
        title="הוסף קובץ"
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.93)'}
        onMouseLeave={e => e.currentTarget.style.filter = ''}
      >
        <span style={{ fontSize: 20 }}>📂</span>
        <span>הוסף קובץ</span>
      </button>

      {/* Add Folder */}
      <button
        style={BIG_BTN({
          background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)',
          borderColor: '#a0a8bc', color: '#334',
        })}
        onClick={handleAddFolder}
        title="הוסף תיקייה"
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.93)'}
        onMouseLeave={e => e.currentTarget.style.filter = ''}
      >
        <span style={{ fontSize: 20 }}>📁</span>
        <span>הוסף תיקייה</span>
      </button>

      {/* Output folder */}
      <button
        style={BIG_BTN({
          background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)',
          borderColor: '#a0a8bc', color: '#334',
        })}
        onClick={handleOutputFolder}
        title="בחר תיקיית פלט"
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.93)'}
        onMouseLeave={e => e.currentTarget.style.filter = ''}
      >
        <span style={{ fontSize: 20 }}>📤</span>
        <span>תיקיית פלט</span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Stats chips */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {stats.running > 0 && (
          <span style={{
            background: '#1565c0', color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 12, border: '1px solid #0d47a1',
          }}>⚙ {stats.running} ממיר</span>
        )}
        {stats.done > 0 && (
          <span style={{
            background: '#2e7d32', color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 12,
          }}>✓ {stats.done}</span>
        )}
        {stats.error > 0 && (
          <span style={{
            background: '#c62828', color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 12,
          }}>✕ {stats.error}</span>
        )}
      </div>

      <div style={{ width: 1, height: 44, background: '#b0b5c8', margin: '0 6px' }} />

      <div style={{
        fontSize: 9, color: '#4ade80', background: '#0a1a0a',
        border: '1px solid #2a4a2a', borderRadius: 3,
        padding: '3px 7px', fontWeight: 700,
      }}>● OFFLINE</div>
    </div>
  )
}
