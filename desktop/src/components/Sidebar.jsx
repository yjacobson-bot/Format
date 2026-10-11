import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS } from '../utils/formats'

const DVD_FORMATS = [
  { id: 'iso_extract', label: 'חלץ מ-ISO', icon: '📀' },
  { id: 'mp4_dvd',     label: 'MP4 מ-DVD', icon: '🎬' },
  { id: 'mkv_dvd',     label: 'MKV מ-DVD', icon: '🎬' },
  { id: 'avi_dvd',     label: 'AVI מ-DVD', icon: '🎬' },
]

const TOOLS_FORMATS = [
  { id: 'merge',         label: 'מיזוג וידאו',    icon: '🔗' },
  { id: 'merge_audio',   label: 'מיזוג אודיו',    icon: '🎵' },
  { id: 'extract_audio', label: 'חלץ אודיו',      icon: '🎤' },
  { id: 'mute',          label: 'הסרת שמע',        icon: '🔇' },
  { id: 'gif',           label: 'וידאו → GIF',    icon: '🖼️' },
  { id: 'rotate90',      label: 'סיבוב 90°',      icon: '🔄' },
  { id: 'rotate180',     label: 'סיבוב 180°',     icon: '🔃' },
  { id: 'flip_h',        label: 'היפוך אופקי',    icon: '↔️' },
  { id: 'flip_v',        label: 'היפוך אנכי',     icon: '↕️' },
  { id: 'speed2x',       label: 'מהירות ×2',      icon: '⏩' },
  { id: 'speed05x',      label: 'האטה ×0.5',      icon: '⏪' },
  { id: 'normalize',     label: 'נרמול שמע',      icon: '🔊' },
  { id: 'fadein',        label: 'Fade In',         icon: '📈' },
  { id: 'fadeout',       label: 'Fade Out',        icon: '📉' },
]

const CATEGORIES = [
  { id: 'video',  label: 'וידאו',    icon: '🎬', color: '#1565c0', formats: VIDEO_FORMATS },
  { id: 'audio',  label: 'אודיו',   icon: '🎵', color: '#2e7d32', formats: AUDIO_FORMATS },
  { id: 'image',  label: 'תמונה',   icon: '🖼️', color: '#6a1b9a', formats: IMAGE_FORMATS },
  { id: 'dvd',    label: 'DVD / ISO', icon: '📀', color: '#c62828', formats: DVD_FORMATS },
  { id: 'tools',  label: 'כלים',    icon: '🔧', color: '#e65100', formats: TOOLS_FORMATS },
]

const MERGE_IDS = new Set(['merge', 'merge_audio'])

export default function Sidebar() {
  const { activeCategory, setActiveCategory, openSetupWindow, openJoinWindow } = useStore()
  const [expanded, setExpanded] = useState(activeCategory || 'video')

  function handleCatClick(catId) {
    setActiveCategory(catId)
    setExpanded(prev => prev === catId ? null : catId)
  }

  function handleFmtClick(fmt, catId) {
    if (MERGE_IDS.has(fmt.id)) {
      openJoinWindow([], fmt.id === 'merge_audio' ? 'audio' : 'video')
    } else {
      // Map tools to their functional category
      const cat = catId === 'tools' || catId === 'dvd' ? catId : catId
      openSetupWindow(fmt, cat)
    }
  }

  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: '#f0f1f5',
      borderLeft: '1px solid #b8bcc8',
      display: 'flex', flexDirection: 'column',
      userSelect: 'none', overflowY: 'auto',
      boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.06)',
    }}>
      {CATEGORIES.map(cat => {
        const isOpen = expanded === cat.id
        const isActive = activeCategory === cat.id

        return (
          <div key={cat.id}>
            {/* Category header */}
            <button
              onClick={() => handleCatClick(cat.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', cursor: 'pointer', border: 'none',
                borderBottom: '1px solid #c8cdd8',
                background: isActive
                  ? `linear-gradient(135deg, ${cat.color}cc, ${cat.color})`
                  : isOpen
                    ? '#e0e4ef'
                    : 'linear-gradient(180deg,#f5f6fa,#e8e9f0)',
                color: isActive ? '#fff' : '#222',
                textAlign: 'right',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#dce5f5' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isOpen ? '#e0e4ef' : 'linear-gradient(180deg,#f5f6fa,#e8e9f0)' }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.icon}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{cat.label}</span>
              <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded format tiles */}
            {isOpen && (
              <div style={{
                background: '#fff',
                borderBottom: '1px solid #c8cdd8',
                padding: '6px 6px',
                display: 'flex', flexWrap: 'wrap', gap: 4,
              }}>
                {cat.formats.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => handleFmtClick(fmt, cat.id)}
                    title={fmt.label}
                    style={{
                      width: 56, height: 52,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 2, cursor: 'pointer', border: '1px solid #d0d5e0',
                      background: 'linear-gradient(180deg,#ffffff,#f0f3f8)',
                      borderRadius: 4, fontSize: 9, fontWeight: 600, color: '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      padding: '2px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `linear-gradient(180deg,${cat.color}22,${cat.color}44)`
                      e.currentTarget.style.borderColor = cat.color
                      e.currentTarget.style.color = cat.color
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(180deg,#ffffff,#f0f3f8)'
                      e.currentTarget.style.borderColor = '#d0d5e0'
                      e.currentTarget.style.color = '#333'
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{fmt.icon || '📄'}</span>
                    <span style={{ fontSize: 8.5, textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', maxWidth: 52, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {fmt.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <button
        onClick={() => setActiveCategory('settings')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', cursor: 'pointer', border: 'none',
          borderTop: '2px solid #b8bcc8',
          background: activeCategory === 'settings'
            ? 'linear-gradient(135deg,#455a64,#263238)'
            : 'linear-gradient(180deg,#f5f6fa,#e8e9f0)',
          color: activeCategory === 'settings' ? '#fff' : '#555',
          width: '100%',
        }}
      >
        <span style={{ fontSize: 16 }}>⚙️</span>
        <span style={{ fontSize: 11, fontWeight: 600 }}>הגדרות</span>
      </button>
    </aside>
  )
}
