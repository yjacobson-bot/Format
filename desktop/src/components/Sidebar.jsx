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
  {
    id: 'video', label: 'וידאו', sublabel: 'Video',
    icon: '🎬', color: '#1a6bbf', color2: '#0d4a8a',
    formats: VIDEO_FORMATS,
    bgIcon: '▶',
  },
  {
    id: 'audio', label: 'אודיו', sublabel: 'Audio',
    icon: '🎵', color: '#1e8a3c', color2: '#0f5c27',
    formats: AUDIO_FORMATS,
    bgIcon: '♫',
  },
  {
    id: 'image', label: 'תמונה', sublabel: 'Picture',
    icon: '🖼️', color: '#7b2fa0', color2: '#511a6e',
    formats: IMAGE_FORMATS,
    bgIcon: '◼',
  },
  {
    id: 'dvd', label: 'DVD / ISO', sublabel: 'DVD / CD',
    icon: '📀', color: '#b81c1c', color2: '#7a0f0f',
    formats: DVD_FORMATS,
    bgIcon: '◎',
  },
  {
    id: 'tools', label: 'כלים', sublabel: 'Tools',
    icon: '🔧', color: '#c15f0a', color2: '#864008',
    formats: TOOLS_FORMATS,
    bgIcon: '⚙',
  },
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
      openSetupWindow(fmt, catId)
    }
  }

  return (
    <aside style={{
      width: 190, flexShrink: 0,
      background: 'linear-gradient(180deg,#e8eaf2,#d8dce8)',
      borderLeft: '1px solid #a0a8c0',
      display: 'flex', flexDirection: 'column',
      userSelect: 'none', overflowY: 'auto',
    }}>
      {CATEGORIES.map(cat => {
        const isOpen = expanded === cat.id
        const isActive = activeCategory === cat.id

        return (
          <div key={cat.id}>
            {/* Category button — Format Factory style: tall, colored when active */}
            <button
              onClick={() => handleCatClick(cat.id)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 0,
                padding: 0, cursor: 'pointer', border: 'none',
                borderBottom: isActive ? `2px solid ${cat.color2}` : '1px solid #b0b8cc',
                background: isActive
                  ? `linear-gradient(180deg, ${cat.color} 0%, ${cat.color2} 100%)`
                  : isOpen
                    ? `linear-gradient(180deg,#dce0ee,#cdd1e0)`
                    : `linear-gradient(180deg,#e8eaf2,#d8dce8)`,
                textAlign: 'right',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 52,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `linear-gradient(180deg,${cat.color}30,${cat.color}50)` }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isOpen ? `linear-gradient(180deg,#dce0ee,#cdd1e0)` : `linear-gradient(180deg,#e8eaf2,#d8dce8)` }}
            >
              {/* Left accent bar */}
              <div style={{
                width: 4, alignSelf: 'stretch', flexShrink: 0,
                background: isActive ? 'rgba(255,255,255,0.35)' : cat.color,
                opacity: isActive ? 1 : 0.6,
              }} />

              {/* Icon area */}
              <div style={{
                width: 42, height: 52, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {cat.icon}
              </div>

              {/* Label */}
              <div style={{ flex: 1, padding: '6px 6px 6px 0', textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : '#1a2a4a', lineHeight: 1.2 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 9.5, color: isActive ? 'rgba(255,255,255,0.75)' : '#8090aa', marginTop: 1 }}>
                  {cat.sublabel}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                paddingLeft: 8, paddingRight: 4, fontSize: 9,
                color: isActive ? 'rgba(255,255,255,0.7)' : '#8090aa',
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}>▼</div>
            </button>

            {/* Expanded sub-tiles */}
            {isOpen && (
              <div style={{
                background: '#fff',
                borderBottom: '1px solid #b8bfd0',
                borderTop: '1px solid #d0d5e0',
                padding: '6px 5px',
                display: 'flex', flexWrap: 'wrap', gap: 4,
              }}>
                {cat.formats.map(fmt => {
                  const extText = fmt.ext ? fmt.ext.toUpperCase() : ''
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => handleFmtClick(fmt, cat.id)}
                      title={fmt.label}
                      style={{
                        width: 52, height: 48,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 0, cursor: 'pointer', border: '1px solid #ccd0dc',
                        background: 'linear-gradient(180deg,#f8f9fc,#eceef5)',
                        borderRadius: 3, padding: 0, overflow: 'hidden',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `linear-gradient(180deg,${cat.color}22,${cat.color}44)`
                        e.currentTarget.style.borderColor = cat.color
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(180deg,#f8f9fc,#eceef5)'
                        e.currentTarget.style.borderColor = '#ccd0dc'
                      }}
                    >
                      {extText ? (
                        <>
                          <div style={{
                            width: '100%', height: 26,
                            background: `linear-gradient(180deg,${cat.color}cc,${cat.color2}cc)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: extText.length <= 3 ? 11 : 9.5,
                            fontWeight: 900, color: '#fff', letterSpacing: 0,
                            fontFamily: 'Arial Black, Arial, sans-serif',
                          }}>
                            {extText}
                          </div>
                          <div style={{ fontSize: 8, color: '#444', padding: '2px 2px 0', textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', maxWidth: 50 }}>
                            {fmt.label}
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 15, lineHeight: 1 }}>{fmt.icon || '📄'}</span>
                          <span style={{ fontSize: 7.5, textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', maxWidth: 50, color: '#333' }}>
                            {fmt.label}
                          </span>
                        </>
                      )}
                    </button>
                  )
                })}
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
          display: 'flex', alignItems: 'center', gap: 0,
          padding: 0, cursor: 'pointer', border: 'none',
          borderTop: '2px solid #9098b0',
          background: activeCategory === 'settings'
            ? 'linear-gradient(180deg,#455a64,#263238)'
            : 'linear-gradient(180deg,#e8eaf2,#d8dce8)',
          color: activeCategory === 'settings' ? '#fff' : '#555',
          width: '100%', minHeight: 46,
        }}
      >
        <div style={{ width: 4, alignSelf: 'stretch', background: '#607d8b', opacity: 0.7 }} />
        <div style={{ width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚙️</div>
        <div style={{ flex: 1, textAlign: 'right', paddingRight: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>הגדרות</div>
          <div style={{ fontSize: 9, opacity: 0.65, marginTop: 1 }}>Settings</div>
        </div>
      </button>
    </aside>
  )
}
