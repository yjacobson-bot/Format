import React from 'react'
import { useStore } from '../store/useStore'

const CAT_COLORS = {
  video: '#dc2626', audio: '#16a34a', image: '#1d4ed8',
  dvd: '#7c3aed', tools: '#64748b', settings: '#60a5fa',
}

const CAT_LABELS = {
  video: 'המרת וידאו', audio: 'המרת אודיו', image: 'המרת תמונות',
  dvd: 'DVD / ISO', tools: 'כלים', settings: 'הגדרות',
}

export default function Header({ onStartAll, onClearAll }) {
  const { activeCategory, getStats } = useStore()
  const stats = getStats()
  const color = CAT_COLORS[activeCategory] || '#1a5fa8'
  const label = CAT_LABELS[activeCategory] || 'Format Factory'

  return (
    <header className="ff-header shrink-0 flex items-center justify-between px-3 py-0" style={{ height: 44 }}>
      {/* Left: Logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 3, padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <span style={{ fontSize: 16 }}>🔄</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>Format Factory</div>
            <div style={{ color: '#9ec8f0', fontSize: 9, lineHeight: 1 }}>ממיר מולטימדיה חינמי</div>
          </div>
        </div>

        {/* Category breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>›</div>
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 2, padding: '2px 8px',
            display: 'flex', alignItems: 'center', gap: 5,
            borderLeft: `3px solid ${color}`,
          }}>
            <span style={{ color: '#dde', fontSize: 11, fontWeight: 500 }}>{label}</span>
          </div>
        </div>
      </div>

      {/* Right: Stats + buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {stats.total > 0 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {stats.running > 0 && (
              <span style={{ background: '#2563eb', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                ⚙ {stats.running}
              </span>
            )}
            {stats.done > 0 && (
              <span style={{ background: '#16a34a', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                ✓ {stats.done}
              </span>
            )}
            {stats.error > 0 && (
              <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                ✕ {stats.error}
              </span>
            )}
          </div>
        )}

        {stats.pending > 0 && (
          <button
            onClick={onStartAll}
            style={{
              background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: '#fff',
              border: '1px solid #15803d', borderRadius: 2, padding: '3px 10px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ▶ התחל הכל ({stats.pending})
          </button>
        )}

        {stats.total > 0 && (
          <button
            onClick={onClearAll}
            style={{
              background: 'rgba(255,255,255,0.1)', color: '#dde',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2,
              padding: '3px 8px', fontSize: 11, cursor: 'pointer',
            }}
          >
            נקה
          </button>
        )}

        {/* Offline badge */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', color: '#6ee7b7',
          border: '1px solid rgba(110,231,183,0.3)', borderRadius: 2,
          padding: '2px 6px', fontSize: 9, fontWeight: 600,
        }}>
          ● אופליין
        </div>
      </div>
    </header>
  )
}
