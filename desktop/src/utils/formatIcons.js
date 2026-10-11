// SVG icon generator — Format Factory style
function svgUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function videoIcon(ext, c1 = '#2080d0', c2 = '#0a4a8a') {
  const fs = ext.length <= 3 ? 17 : ext.length <= 4 ? 14 : ext.length <= 5 ? 11 : 9
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="6" fill="url(#g)"/>
  <rect x="4" y="4" width="56" height="38" rx="3" fill="rgba(0,0,0,0.18)"/>
  <rect x="4" y="4" width="8" height="38" rx="0" fill="rgba(0,0,0,0.3)"/>
  <rect x="52" y="4" width="8" height="38" rx="0" fill="rgba(0,0,0,0.3)"/>
  <rect x="8" y="10" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <rect x="8" y="19" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <rect x="8" y="28" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <rect x="53" y="10" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <rect x="53" y="19" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <rect x="53" y="28" width="3" height="5" rx="1" fill="rgba(255,255,255,0.7)"/>
  <polygon points="22,11 22,35 44,23" fill="rgba(255,255,255,0.9)"/>
  <rect x="0" y="44" width="64" height="20" fill="rgba(0,0,0,0.38)"/>
  <text x="32" y="59" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="${fs}" font-weight="900" fill="white" letter-spacing="0.5">${ext.toUpperCase()}</text>
</svg>`)
}

function audioIcon(ext, c1 = '#1a9644', c2 = '#0a5c28') {
  const fs = ext.length <= 3 ? 17 : ext.length <= 4 ? 14 : 11
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="6" fill="url(#g)"/>
  <ellipse cx="28" cy="16" rx="7" ry="8" fill="rgba(255,255,255,0.85)"/>
  <rect x="21" y="20" width="14" height="10" fill="rgba(255,255,255,0.85)"/>
  <polygon points="35,20 44,14 44,30 35,30" fill="rgba(255,255,255,0.85)"/>
  <rect x="22" y="30" width="12" height="12" rx="2" fill="rgba(255,255,255,0.85)"/>
  <path d="M46,16 Q54,23 46,30" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M49,11 Q61,23 49,35" stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <rect x="0" y="44" width="64" height="20" fill="rgba(0,0,0,0.38)"/>
  <text x="32" y="59" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="${fs}" font-weight="900" fill="white">${ext.toUpperCase()}</text>
</svg>`)
}

function imageIcon(ext, c1 = '#8a30b8', c2 = '#521070') {
  const fs = ext.length <= 3 ? 17 : ext.length <= 4 ? 14 : 11
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#87ceeb"/><stop offset="100%" stop-color="#d0eeff"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="6" fill="url(#g)"/>
  <rect x="6" y="5" width="52" height="36" rx="4" fill="url(#sky)"/>
  <circle cx="18" cy="15" r="5" fill="#ffd700"/>
  <polygon points="6,41 22,24 32,32 42,20 58,41" fill="#4a9a50"/>
  <polygon points="32,32 42,20 58,41" fill="#3a7a40"/>
  <rect x="0" y="44" width="64" height="20" fill="rgba(0,0,0,0.38)"/>
  <text x="32" y="59" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="${fs}" font-weight="900" fill="white">${ext.toUpperCase()}</text>
</svg>`)
}

function toolIcon(label, icon = '⚙', c1 = '#d06010', c2 = '#8a3c00') {
  const fs = label.length <= 5 ? 9 : label.length <= 8 ? 8 : 7
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="6" fill="url(#g)"/>
  <text x="32" y="36" text-anchor="middle" font-size="28" fill="rgba(255,255,255,0.9)">${icon}</text>
  <rect x="0" y="44" width="64" height="20" fill="rgba(0,0,0,0.38)"/>
  <text x="32" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs}" font-weight="700" fill="white">${label}</text>
</svg>`)
}

function gifIcon() {
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2080d0"/><stop offset="100%" stop-color="#0a4a8a"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="6" fill="url(#g)"/>
  <rect x="5" y="5" width="54" height="36" rx="3" fill="rgba(0,0,0,0.18)"/>
  <circle cx="20" cy="18" r="5" fill="#ff6b6b" opacity="0.9"/>
  <circle cx="35" cy="14" r="5" fill="#ffd93d" opacity="0.9"/>
  <circle cx="50" cy="18" r="5" fill="#6bcb77" opacity="0.9"/>
  <path d="M10,35 Q20,22 30,30 Q40,38 54,20" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">ANIMATED</text>
  <rect x="0" y="44" width="64" height="20" fill="rgba(0,0,0,0.38)"/>
  <text x="32" y="59" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="17" font-weight="900" fill="white">GIF</text>
</svg>`)
}

// Map of format id → icon data URI
export const FORMAT_ICONS = {
  // Video
  mp4:     videoIcon('MP4'),
  avi:     videoIcon('AVI'),
  mkv:     videoIcon('MKV'),
  mov:     videoIcon('MOV'),
  wmv:     videoIcon('WMV'),
  flv:     videoIcon('FLV'),
  webm:    videoIcon('WEBM'),
  ts:      videoIcon('TS'),
  m2ts:    videoIcon('M2TS'),
  mpg:     videoIcon('MPG'),
  mpeg:    videoIcon('MPEG'),
  '3gp':   videoIcon('3GP'),
  ogv:     videoIcon('OGV'),
  gif:     gifIcon(),
  h265:    videoIcon('H.265'),
  hevc:    videoIcon('HEVC'),
  iphone:  videoIcon('iPhone', '#2a6db8', '#1a4a80'),
  youtube: videoIcon('YouTube', '#c00', '#800'),
  dvd_mpg: videoIcon('DVD', '#1a6bbf', '#0d4a8a'),
  instagram: videoIcon('INSTA', '#9c27b0', '#6a0080'),

  // DVD
  iso_extract: videoIcon('ISO', '#b81c1c', '#7a0f0f'),
  mp4_dvd:     videoIcon('MP4', '#b81c1c', '#7a0f0f'),
  mkv_dvd:     videoIcon('MKV', '#b81c1c', '#7a0f0f'),
  avi_dvd:     videoIcon('AVI', '#b81c1c', '#7a0f0f'),

  // Audio
  mp3:   audioIcon('MP3'),
  aac:   audioIcon('AAC'),
  flac:  audioIcon('FLAC'),
  wav:   audioIcon('WAV'),
  ogg:   audioIcon('OGG'),
  wma:   audioIcon('WMA', '#1a7a3c', '#0a5228'),
  m4a:   audioIcon('M4A'),
  opus:  audioIcon('OPUS'),
  aiff:  audioIcon('AIFF'),
  ac3:   audioIcon('AC3'),

  // Image
  jpg:  imageIcon('JPG'),
  jpeg: imageIcon('JPEG'),
  png:  imageIcon('PNG'),
  webp: imageIcon('WEBP', '#6a1b9a', '#3d0a6e'),
  bmp:  imageIcon('BMP', '#7b2fa0', '#511a6e'),
  gif_img: imageIcon('GIF', '#8a30b8', '#521070'),
  tiff: imageIcon('TIFF', '#6a2fa0', '#401a6e'),
  ico:  imageIcon('ICO', '#7b2fa0', '#511a6e'),
  svg:  imageIcon('SVG', '#8a30b8', '#521070'),

  // Tools
  merge:         toolIcon('מיזוג וידאו', '🔗', '#1a6bbf', '#0d4a8a'),
  merge_audio:   toolIcon('מיזוג אודיו', '🎵', '#1e8a3c', '#0f5c27'),
  extract_audio: toolIcon('חלץ אודיו', '🎤', '#c15f0a', '#864008'),
  mute:          toolIcon('הסרת שמע', '🔇', '#607d8b', '#37474f'),
  gif:           gifIcon(),
  rotate90:      toolIcon('סיבוב 90°', '🔄', '#c15f0a', '#864008'),
  rotate180:     toolIcon('סיבוב 180°', '🔃', '#c15f0a', '#864008'),
  flip_h:        toolIcon('היפוך אופקי', '↔️', '#c15f0a', '#864008'),
  flip_v:        toolIcon('היפוך אנכי', '↕️', '#c15f0a', '#864008'),
  speed2x:       toolIcon('מהירות ×2', '⏩', '#c15f0a', '#864008'),
  speed05x:      toolIcon('האטה ×0.5', '⏪', '#c15f0a', '#864008'),
  normalize:     toolIcon('נרמול שמע', '🔊', '#1e8a3c', '#0f5c27'),
  mono:          toolIcon('→ מונו', '🎙️', '#1e8a3c', '#0f5c27'),
  fadein:        toolIcon('Fade In', '📈', '#1e8a3c', '#0f5c27'),
  fadeout:       toolIcon('Fade Out', '📉', '#1e8a3c', '#0f5c27'),
}

// Get icon by format id or ext fallback
export function getFormatIcon(fmt, category) {
  const id = fmt.id?.toLowerCase()
  const ext = fmt.ext?.toLowerCase()

  if (FORMAT_ICONS[id]) return FORMAT_ICONS[id]
  if (ext && FORMAT_ICONS[ext]) return FORMAT_ICONS[ext]

  // Fallback by category
  if (category === 'audio') return audioIcon(ext || id || '?')
  if (category === 'image') return imageIcon(ext || id || '?')
  if (category === 'dvd')   return videoIcon(ext || id || '?', '#b81c1c', '#7a0f0f')
  if (category === 'tools') return toolIcon(fmt.label || id || '?', '⚙', '#c15f0a', '#864008')
  return videoIcon(ext || id || '?')
}
