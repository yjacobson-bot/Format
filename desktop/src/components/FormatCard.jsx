import React from 'react'
import { useStore } from '../store/useStore'

const CAT_BORDER = {
  video: '#dc2626', audio: '#16a34a', image: '#1d4ed8',
  dvd: '#7c3aed', tools: '#64748b',
}
const CAT_HOVER_BG = {
  video: '#fee2e2', audio: '#dcfce7', image: '#dbeafe',
  dvd: '#ede9fe', tools: '#f1f5f9',
}
const CAT_ACTIVE_BG = {
  video: '#fca5a5', audio: '#86efac', image: '#93c5fd',
  dvd: '#c4b5fd', tools: '#cbd5e1',
}

export default function FormatCard({ format, category, onSelect }) {
  const { activeOutputFormat } = useStore()
  const isActive = activeOutputFormat?.id === format.id
  const borderColor = CAT_BORDER[category] || '#1a5fa8'
  const activeBg = CAT_ACTIVE_BG[category] || '#dbeafe'
  const hoverBg = CAT_HOVER_BG[category] || '#e8f0fb'

  return (
    <button
      onClick={() => onSelect(format)}
      title={format.description}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 96, height: 82,
        background: isActive ? activeBg : '#ffffff',
        border: `1px solid ${isActive ? borderColor : '#c8c8c8'}`,
        borderTop: `3px solid ${borderColor}`,
        borderRadius: 2,
        cursor: 'pointer',
        padding: '6px 4px 4px',
        boxShadow: isActive
          ? `0 2px 6px ${borderColor}44, inset 0 0 0 1px ${borderColor}44`
          : '0 1px 2px rgba(0,0,0,0.12)',
        transition: 'all 0.1s',
        gap: 2,
        position: 'relative',
        outline: isActive ? `2px solid ${borderColor}` : 'none',
        outlineOffset: -2,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = hoverBg
          e.currentTarget.style.borderColor = borderColor
          e.currentTarget.style.boxShadow = `0 2px 6px ${borderColor}33`
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = '#ffffff'
          e.currentTarget.style.borderColor = '#c8c8c8'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Format icon - large */}
      <span style={{ fontSize: 26, lineHeight: 1 }}>{format.icon}</span>

      {/* "All to" label */}
      <span style={{ fontSize: 9, color: '#888', lineHeight: 1, marginTop: 2 }}>המר ל</span>

      {/* Format name - bold */}
      <span style={{
        fontSize: 12, fontWeight: 700, lineHeight: 1,
        color: isActive ? borderColor : '#222',
        marginTop: 1,
      }}>
        {format.label}
      </span>

      {/* Active checkmark */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 3, right: 4,
          width: 14, height: 14, borderRadius: '50%',
          background: borderColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700,
        }}>✓</div>
      )}
    </button>
  )
}
