import React from 'react'
import { useStore } from '../store/useStore'
import { VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS } from '../utils/formats'

const DVD_FORMATS = [
  { id: 'iso_extract', label: 'חלץ מ-ISO',  ext: 'mp4', icon: '📀', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'mp4_dvd',     label: 'MP4 מ-DVD',  ext: 'mp4', icon: '🎬', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'mkv_dvd',     label: 'MKV מ-DVD',  ext: 'mkv', icon: '🎬', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'avi_dvd',     label: 'AVI מ-DVD',  ext: 'avi', icon: '🎬', ffmpegArgs: ['-c:v', 'mpeg4',   '-c:a', 'mp3'] },
]

const TOOLS_OPTIONS = [
  { id: 'merge',         label: 'מיזוג וידאו',   ext: 'mp4', icon: '🔗', ffmpegArgs: [] },
  { id: 'merge_audio',   label: 'מיזוג אודיו',   ext: 'mp3', icon: '🎵', ffmpegArgs: [] },
  { id: 'extract_audio', label: 'חלץ אודיו',     ext: 'mp3', icon: '🎤', ffmpegArgs: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'mute',          label: 'הסרת שמע',      ext: 'mp4', icon: '🔇', ffmpegArgs: ['-an', '-c:v', 'copy'] },
  { id: 'gif',           label: 'וידאו → GIF',   ext: 'gif', icon: '🖼️', ffmpegArgs: ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'] },
  { id: 'rotate90',      label: 'סיבוב 90°',     ext: 'mp4', icon: '🔄', ffmpegArgs: ['-vf', 'transpose=1', '-c:a', 'copy'] },
  { id: 'rotate180',     label: 'סיבוב 180°',    ext: 'mp4', icon: '🔃', ffmpegArgs: ['-vf', 'transpose=1,transpose=1', '-c:a', 'copy'] },
  { id: 'flip_h',        label: 'היפוך אופקי',   ext: 'mp4', icon: '↔️', ffmpegArgs: ['-vf', 'hflip', '-c:a', 'copy'] },
  { id: 'flip_v',        label: 'היפוך אנכי',    ext: 'mp4', icon: '↕️', ffmpegArgs: ['-vf', 'vflip', '-c:a', 'copy'] },
  { id: 'speed2x',       label: 'מהירות ×2',     ext: 'mp4', icon: '⏩', ffmpegArgs: ['-vf', 'setpts=0.5*PTS', '-af', 'atempo=2.0'] },
  { id: 'speed05x',      label: 'האטה ×0.5',     ext: 'mp4', icon: '⏪', ffmpegArgs: ['-vf', 'setpts=2.0*PTS', '-af', 'atempo=0.5'] },
  { id: 'normalize',     label: 'נרמול שמע',     ext: 'mp3', icon: '🔊', ffmpegArgs: ['-af', 'dynaudnorm', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'mono',          label: 'סטריאו → מונו', ext: 'mp3', icon: '🎙️', ffmpegArgs: ['-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'fadein',        label: 'Fade In (3s)',   ext: 'mp3', icon: '📈', ffmpegArgs: ['-af', 'afade=t=in:st=0:d=3', '-c:a', 'libmp3lame', '-q:a', '2'] },
  { id: 'fadeout',       label: 'Fade Out (3s)',  ext: 'mp3', icon: '📉', ffmpegArgs: ['-af', 'afade=t=out:st=0:d=3', '-c:a', 'libmp3lame', '-q:a', '2'] },
]

const FORMAT_LISTS = {
  video: VIDEO_FORMATS,
  audio: AUDIO_FORMATS,
  image: IMAGE_FORMATS,
  dvd:   DVD_FORMATS,
  tools: TOOLS_OPTIONS,
}

const CAT_META = {
  video: { label: 'המרת וידאו',  color: '#1565c0', bg: '#e3f2fd', icon: '🎬' },
  audio: { label: 'המרת אודיו',  color: '#2e7d32', bg: '#e8f5e9', icon: '🎵' },
  image: { label: 'המרת תמונות', color: '#6a1b9a', bg: '#f3e5f5', icon: '🖼️' },
  dvd:   { label: 'DVD / ISO',   color: '#c62828', bg: '#ffebee', icon: '📀' },
  tools: { label: 'כלים',        color: '#e65100', bg: '#fff3e0', icon: '🔧' },
}

const MERGE_IDS = new Set(['merge', 'merge_audio'])

export default function FormatGrid() {
  const { activeCategory, openSetupWindow, openJoinWindow } = useStore()

  if (activeCategory === 'settings') return null

  const formats = FORMAT_LISTS[activeCategory] || []
  const meta = CAT_META[activeCategory] || CAT_META.video

  function handleClick(fmt) {
    if (MERGE_IDS.has(fmt.id)) {
      openJoinWindow([], fmt.id === 'merge_audio' ? 'audio' : 'video')
    } else {
      openSetupWindow(fmt, activeCategory)
    }
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#f8f9fc', display: 'flex', flexDirection: 'column' }}>
      {/* Section header */}
      <div style={{
        background: `linear-gradient(135deg, ${meta.color}dd, ${meta.color})`,
        color: '#fff', padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontSize: 20 }}>{meta.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{meta.label}</div>
          <div style={{ fontSize: 10, opacity: 0.85 }}>בחר פורמט יעד — לחץ על אריח להמרה</div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 10 }}>
          {formats.length} פורמטים
        </span>
      </div>

      {/* Format tiles */}
      <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
        {formats.map(fmt => (
          <button
            key={fmt.id}
            onClick={() => handleClick(fmt)}
            style={{
              width: 100, height: 80,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 5, cursor: 'pointer',
              background: 'linear-gradient(180deg,#ffffff,#f0f3f8)',
              border: `1px solid #c8d0e0`,
              borderRadius: 6, color: '#222',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              transition: 'all 0.12s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `linear-gradient(180deg,${meta.bg},${meta.color}22)`
              e.currentTarget.style.borderColor = meta.color
              e.currentTarget.style.boxShadow = `0 4px 12px ${meta.color}44, inset 0 1px 0 rgba(255,255,255,0.8)`
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(180deg,#ffffff,#f0f3f8)'
              e.currentTarget.style.borderColor = '#c8d0e0'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
              e.currentTarget.style.transform = ''
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(0px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          >
            <span style={{ fontSize: 26, lineHeight: 1 }}>{fmt.icon || '📄'}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1a2a4a', lineHeight: 1.2, textAlign: 'center', wordBreak: 'keep-all', hyphens: 'none', maxWidth: 86 }}>
              {fmt.label}
            </span>
            {fmt.ext && <span style={{ fontSize: 9, color: meta.color, fontWeight: 600 }}>.{fmt.ext}</span>}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <div style={{
        margin: '0 16px 14px', padding: '12px 20px',
        background: '#f0f4ff', border: '1px dashed #99aee8', borderRadius: 4,
        fontSize: 11, color: '#4466aa', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span>גרור קבצים או תיקיות לחלון — התוכנה תזהה אוטומטית ותציג את כל אפשרויות ההמרה</span>
      </div>
    </div>
  )
}
