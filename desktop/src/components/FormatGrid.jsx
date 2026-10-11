import React from 'react'
import { useStore } from '../store/useStore'
import { VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS } from '../utils/formats'
import { getFormatIcon } from '../utils/formatIcons'

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
  video: { label: 'המרת וידאו',  color: '#1a6bbf', color2: '#0d4a8a', accent: '#4da6ff', icon: '🎬' },
  audio: { label: 'המרת אודיו',  color: '#1e8a3c', color2: '#0f5c27', accent: '#5dd97a', icon: '🎵' },
  image: { label: 'המרת תמונות', color: '#7b2fa0', color2: '#511a6e', accent: '#c47ee8', icon: '🖼️' },
  dvd:   { label: 'DVD / ISO',   color: '#b81c1c', color2: '#7a0f0f', accent: '#f07070', icon: '📀' },
  tools: { label: 'כלים',        color: '#c15f0a', color2: '#864008', accent: '#f0a050', icon: '🔧' },
}

// Format icon tile — Format Factory style with real SVG icons
function FormatTile({ fmt, meta, category, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  const iconUri = getFormatIcon(fmt, category)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`המר ל-${fmt.label}`}
      style={{
        width: 96, height: 90,
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer', padding: 0,
        border: hovered ? `2px solid ${meta.color}` : '2px solid #c0c6d4',
        borderRadius: 5,
        background: hovered ? `${meta.color}12` : '#f5f6fa',
        boxShadow: hovered
          ? `0 4px 14px ${meta.color}44, 0 1px 3px rgba(0,0,0,0.15)`
          : '0 1px 4px rgba(0,0,0,0.13)',
        overflow: 'hidden',
        transition: 'all 0.1s',
        fontFamily: 'inherit',
      }}
    >
      {/* SVG Icon */}
      <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 4px 0' }}>
        <img src={iconUri} alt={fmt.label} style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} draggable={false} />
      </div>

      {/* Label */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px 3px',
        borderTop: hovered ? `1px solid ${meta.color}33` : '1px solid #e0e4ec',
        background: hovered ? `${meta.color}10` : '#eef0f6',
      }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700,
          color: hovered ? meta.color : '#1a2a4a',
          textAlign: 'center', lineHeight: 1.3,
          overflow: 'hidden', maxWidth: 88,
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          המר ל-{fmt.label}
        </span>
      </div>
    </button>
  )
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
    <div style={{ flex: 1, overflow: 'auto', background: '#eef0f5', display: 'flex', flexDirection: 'column' }}>
      {/* Section header — Windows XP style */}
      <div style={{
        background: `linear-gradient(180deg, ${meta.color}f0 0%, ${meta.color2} 100%)`,
        color: '#fff',
        padding: '7px 14px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        borderBottom: `2px solid ${meta.color2}`,
      }}>
        <span style={{ fontSize: 22 }}>{meta.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>{meta.label}</div>
          <div style={{ fontSize: 9.5, opacity: 0.82, marginTop: 1 }}>לחץ על פורמט לבחירה · גרור קבצים לחלון</div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 10, background: 'rgba(0,0,0,0.25)', padding: '2px 10px',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {formats.length} פורמטים
        </span>
      </div>

      {/* Format tiles grid */}
      <div style={{ padding: '12px 14px 4px', display: 'flex', flexWrap: 'wrap', gap: 7, alignContent: 'flex-start' }}>
        {formats.map(fmt => (
          <FormatTile key={fmt.id} fmt={fmt} meta={meta} category={activeCategory} onClick={() => handleClick(fmt)} />
        ))}
      </div>

      {/* Drag hint */}
      <div style={{
        margin: '8px 14px 12px',
        padding: '8px 16px',
        background: '#e8ecf8',
        border: '1px dashed #8899cc',
        borderRadius: 3,
        fontSize: 10.5, color: '#3355aa', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span>גרור קבצים או תיקיות לחלון — התוכנה תזהה אוטומטית ותציג אפשרויות המרה</span>
      </div>
    </div>
  )
}
