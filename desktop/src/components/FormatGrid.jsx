import React from 'react'
import { useStore } from '../store/useStore'
import { VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS } from '../utils/formats'

const DVD_FORMATS = [
  { id: 'iso_extract', label: 'חלץ מ-ISO', ext: 'mp4', icon: '📀', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'mp4_dvd', label: 'MP4 מ-DVD', ext: 'mp4', icon: '🎬', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'mkv_dvd', label: 'MKV מ-DVD', ext: 'mkv', icon: '🎬', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'avi_dvd', label: 'AVI מ-DVD', ext: 'avi', icon: '🎬', ffmpegArgs: ['-c:v', 'mpeg4', '-c:a', 'mp3'] },
]

const TOOLS_OPTIONS = [
  { id: 'merge', label: 'מיזוג וידאו', ext: 'mp4', icon: '🔗', ffmpegArgs: [] },
  { id: 'extract_audio', label: 'חלץ אודיו', ext: 'mp3', icon: '🎵', ffmpegArgs: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'gif', label: 'וידאו → GIF', ext: 'gif', icon: '🖼️', ffmpegArgs: ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'] },
  { id: 'mute', label: 'הסרת שמע', ext: 'mp4', icon: '🔇', ffmpegArgs: ['-an', '-c:v', 'copy'] },
]

const FORMAT_LISTS = {
  video: VIDEO_FORMATS,
  audio: AUDIO_FORMATS,
  image: IMAGE_FORMATS,
  dvd: DVD_FORMATS,
  tools: TOOLS_OPTIONS,
}

const CATEGORY_LABELS = {
  video: 'המרת וידאו',
  audio: 'המרת אודיו',
  image: 'המרת תמונות',
  dvd: 'DVD / ISO',
  tools: 'כלים',
}

export default function FormatGrid() {
  const { activeCategory, openSetupWindow, openJoinWindow } = useStore()

  if (activeCategory === 'settings') return null

  const formats = FORMAT_LISTS[activeCategory] || []
  const label = CATEGORY_LABELS[activeCategory] || ''

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#fafafa', padding: '8px 12px' }}>
      {/* Section header */}
      <div style={{
        fontSize: 12, fontWeight: 700, color: '#1a3f6f',
        borderBottom: '2px solid #0066cc', paddingBottom: 4, marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>📋</span> {label}
        <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>— בחר פורמט יעד</span>
      </div>

      {/* Format buttons grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {formats.map(fmt => (
          <button
            key={fmt.id}
            onClick={() => fmt.id === 'merge' ? openJoinWindow() : openSetupWindow(fmt, activeCategory)}
            style={{
              width: 110, height: 62,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: 'pointer',
              background: '#fff', border: '1px solid #c8d8e8', borderRadius: 4,
              color: '#222', transition: 'all 0.12s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e8f0fc'
              e.currentTarget.style.borderColor = '#0066cc'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,102,204,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.borderColor = '#c8d8e8'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            <span style={{ fontSize: 10, color: '#0066cc', fontWeight: 600 }}>המר ל-</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.5 }}>
              {fmt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <div style={{
        marginTop: 16, padding: '10px 14px',
        background: '#f0f7ff', border: '1px dashed #99c0e8', borderRadius: 4,
        fontSize: 11, color: '#4477aa', textAlign: 'center',
      }}>
        💡 ניתן גם לגרור קבצים לכאן — התוכנה תזהה את הסוג אוטומטית
      </div>
    </div>
  )
}
