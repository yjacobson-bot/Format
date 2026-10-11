import React from 'react'
import { useStore } from '../store/useStore'

const CATEGORIES = [
  { id: 'video',  label: 'וידאו',   emoji: '🎬' },
  { id: 'audio',  label: 'אודיו',   emoji: '🎵' },
  { id: 'image',  label: 'תמונה',  emoji: '🖼️' },
  { id: 'dvd',    label: 'DVD/ISO', emoji: '📀' },
  { id: 'tools',  label: 'כלים',   emoji: '🔧' },
]

export default function Sidebar() {
  const { activeCategory, setActiveCategory } = useStore()

  return (
    <aside style={{
      width: 90, flexShrink: 0,
      background: '#f0f0f0',
      borderLeft: '1px solid #c0c0c0',
      display: 'flex', flexDirection: 'column',
      userSelect: 'none',
    }}>
      {CATEGORIES.map(cat => {
        const active = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 4px 8px', gap: 4,
              cursor: 'pointer', border: 'none', borderBottom: '1px solid #ddd',
              background: active ? '#0066cc' : 'transparent',
              color: active ? '#fff' : '#333',
              width: '100%', transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#dce9f8' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 22 }}>{cat.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, lineHeight: 1 }}>{cat.label}</span>
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <button
        onClick={() => setActiveCategory('settings')}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 4px', gap: 3, cursor: 'pointer', border: 'none',
          borderTop: '1px solid #ddd',
          background: activeCategory === 'settings' ? '#0066cc' : 'transparent',
          color: activeCategory === 'settings' ? '#fff' : '#666',
          width: '100%',
        }}
      >
        <span style={{ fontSize: 18 }}>⚙️</span>
        <span style={{ fontSize: 9 }}>הגדרות</span>
      </button>
    </aside>
  )
}
