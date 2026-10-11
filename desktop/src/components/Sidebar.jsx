import React from 'react'
import { useStore } from '../store/useStore'

const CATEGORIES = [
  { id: 'video',    label: 'Video',    emoji: '🎬', color: '#dc2626', bg: '#fee2e2' },
  { id: 'audio',    label: 'Audio',    emoji: '🎵', color: '#16a34a', bg: '#dcfce7' },
  { id: 'image',    label: 'Picture',  emoji: '🖼️', color: '#1d4ed8', bg: '#dbeafe' },
  { id: 'dvd',      label: 'DVD/ISO',  emoji: '📀', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'tools',    label: 'Tools',    emoji: '🔧', color: '#64748b', bg: '#f1f5f9' },
]

export default function Sidebar() {
  const { activeCategory, setActiveCategory } = useStore()

  return (
    <aside
      className="shrink-0 flex flex-col"
      style={{ width: 80, background: '#333333', boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.35)' }}
    >
      {/* Logo */}
      <div style={{ background: '#1a1a1a', padding: '10px 4px 8px', textAlign: 'center', borderBottom: '1px solid #555' }}>
        <div style={{ fontSize: 22 }}>🔄</div>
        <div style={{ color: '#aaa', fontSize: 8, fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>FORMAT</div>
        <div style={{ color: '#666', fontSize: 8, letterSpacing: 1 }}>FACTORY</div>
      </div>

      {/* Category buttons */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 4 }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px 8px', gap: 4, cursor: 'pointer', border: 'none',
                borderLeft: `3px solid ${isActive ? cat.color : 'transparent'}`,
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#fff' : '#bbb',
                transition: 'all 0.1s',
                width: '100%',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#444'; e.currentTarget.style.color = '#fff' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#bbb' }}}
            >
              {/* Colored icon circle */}
              <div style={{
                width: 36, height: 36, borderRadius: 4,
                background: isActive ? cat.color : '#4a4a4a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, transition: 'background 0.1s',
                boxShadow: isActive ? `0 0 8px ${cat.color}88` : 'none',
              }}>
                {cat.emoji}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, lineHeight: 1 }}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Settings at bottom */}
      <div style={{ borderTop: '1px solid #555', paddingBottom: 4 }}>
        <button
          onClick={() => setActiveCategory('settings')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '8px 4px', gap: 3, cursor: 'pointer', border: 'none',
            borderLeft: `3px solid ${activeCategory === 'settings' ? '#60a5fa' : 'transparent'}`,
            background: activeCategory === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeCategory === 'settings' ? '#fff' : '#999',
            width: '100%', transition: 'all 0.1s',
          }}
        >
          <span style={{ fontSize: 16 }}>⚙️</span>
          <span style={{ fontSize: 9 }}>Settings</span>
        </button>
      </div>
    </aside>
  )
}
