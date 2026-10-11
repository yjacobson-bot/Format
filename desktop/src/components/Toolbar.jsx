import React from 'react'
import { useStore } from '../store/useStore'

export default function Toolbar({ onStart, onStop, onAddFiles }) {
  const { settings, updateSettings, getStats, paused, togglePause } = useStore()
  const stats = getStats()
  const hasRunning = stats.running > 0
  const hasPending = stats.pending > 0
  const hasActive = hasRunning || hasPending

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
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a3a7a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
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

      {/* Pause / Resume */}
      <button
        style={BIG_BTN({
          background: hasActive
            ? paused
              ? 'linear-gradient(180deg,#f59e0b,#d97706)'
              : 'linear-gradient(180deg,#6366f1,#4338ca)'
            : 'linear-gradient(180deg,#e0e0e0,#d0d0d0)',
          borderColor: hasActive ? (paused ? '#b45309' : '#3730a3') : '#b0b0b0',
          color: hasActive ? '#fff' : '#999',
          cursor: hasActive ? 'pointer' : 'default',
        })}
        onClick={togglePause}
        disabled={!hasActive}
        title={paused ? 'המשך' : 'השהה'}
      >
        <span style={{ fontSize: 18, letterSpacing: -1 }}>{paused ? '▶▶' : '❙❙'}</span>
        <span>{paused ? 'המשך' : 'השהה'}</span>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <polyline points="12 11 12 17"/><polyline points="9 14 12 17 15 14"/>
          </svg>
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

    </div>
  )
}
