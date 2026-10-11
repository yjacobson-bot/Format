import React from 'react'
import { useStore } from '../store/useStore'

const BTN = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', fontSize: 12, cursor: 'pointer',
  border: '1px solid #aaa', borderRadius: 2, background: '#f5f5f5',
  color: '#222', fontFamily: 'inherit',
}
const BTN_PRIMARY = {
  ...BTN, background: 'linear-gradient(180deg,#4caf78,#2e8b57)',
  color: '#fff', border: '1px solid #1a6b3a', fontWeight: 700,
}
const BTN_STOP = {
  ...BTN, background: 'linear-gradient(180deg,#e05555,#b22222)',
  color: '#fff', border: '1px solid #8b0000',
}
const SEP = { width: 1, height: 22, background: '#bbb', margin: '0 4px' }

export default function Toolbar({ onStart, onStop, onAddFiles }) {
  const { settings, setOutputDir, getStats } = useStore()
  const stats = getStats()
  const hasRunning = stats.running > 0
  const hasPending = stats.pending > 0

  async function handleAddFile() {
    const files = await window.electronAPI?.openFiles({ multiple: true })
    if (files?.length) onAddFiles(files)
  }

  async function handleOutputFolder() {
    const folder = await window.electronAPI?.openFolder()
    if (folder) setOutputDir(folder)
  }

  return (
    <div style={{
      height: 38, background: 'linear-gradient(180deg,#f0f0f0,#dcdcdc)',
      borderBottom: '1px solid #aaa', display: 'flex', alignItems: 'center',
      padding: '0 6px', gap: 4, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingRight: 10, borderLeft: '1px solid #bbb', marginLeft: 4 }}>
        <span style={{ fontSize: 18 }}>🔄</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3f6f', lineHeight: 1.2 }}>פורמט נקי</div>
          <div style={{ fontSize: 8, color: '#888', lineHeight: 1 }}>ממיר מדיה</div>
        </div>
      </div>

      <div style={SEP} />

      <button style={BTN} onClick={handleAddFile}>
        📂 הוסף קובץ
      </button>

      <button style={BTN} onClick={handleOutputFolder}>
        📁 תיקיית פלט
      </button>

      <div style={{ fontSize: 11, color: '#555', padding: '2px 6px', background: '#fff',
        border: '1px solid #ccc', borderRadius: 2, maxWidth: 200, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 80 }}>
        {settings.outputDir || 'זהה לקובץ המקורי'}
      </div>

      <div style={SEP} />

      <button style={BTN_PRIMARY} onClick={onStart} disabled={!hasPending}>
        ▶ התחל
        {hasPending ? ` (${stats.pending})` : ''}
      </button>

      <button style={BTN_STOP} onClick={onStop} disabled={!hasRunning}>
        ■ עצור
      </button>

      <div style={{ flex: 1 }} />

      {/* Stats badges */}
      {stats.running > 0 && (
        <span style={{ background: '#2563eb', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>
          ⚙ {stats.running} רץ
        </span>
      )}
      {stats.done > 0 && (
        <span style={{ background: '#16a34a', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>
          ✓ {stats.done}
        </span>
      )}
      {stats.error > 0 && (
        <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>
          ✕ {stats.error}
        </span>
      )}

      <div style={SEP} />

      <div style={{ fontSize: 9, color: '#4ade80', background: 'rgba(0,0,0,0.08)',
        border: '1px solid #aaa', borderRadius: 2, padding: '2px 5px' }}>
        ● אופליין
      </div>
    </div>
  )
}
