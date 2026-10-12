import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import {
  VIDEO_CODECS, AUDIO_CODECS, RESOLUTIONS, VIDEO_BITRATES,
  AUDIO_BITRATES, FRAMERATES, SAMPLE_RATES, AUDIO_CHANNELS,
} from '../utils/formats'

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtSize(b) {
  if (!b) return '—'
  if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB'
  return (b / 1e3).toFixed(0) + ' KB'
}
function fmtDur(s) {
  if (!s) return '—'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}
function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

function Sel({ label, value, onChange, options, small }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label && <label style={{ fontSize: 10, color: '#555' }}>{label}</label>}
      <select value={value ?? ''} onChange={e => onChange(e.target.value || null)}
        style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff', minWidth: small ? 80 : 110 }}>
        {options.map(o => <option key={String(o.value ?? '__null__')} value={o.value ?? ''}>{o.label}</option>)}
      </select>
    </div>
  )
}

const DEVICE_PRESETS = [
  { id: 'iphone',    label: 'iPhone / iPad',     icon: '📱', ext: 'mp4',  settings: { resolution: '1920:1080', videoBitrate: '2000k', audioBitrate: '128k', fps: '30' } },
  { id: 'android',   label: 'Android',            icon: '📱', ext: 'mp4',  settings: { resolution: '1280:720',  videoBitrate: '1500k', audioBitrate: '128k', fps: '30' } },
  { id: 'psp',       label: 'PSP',                icon: '🎮', ext: 'mp4',  settings: { resolution: '480:272',   videoBitrate: '768k',  audioBitrate: '128k', fps: '29.97' } },
  { id: 'ps4',       label: 'PS4 / PS5',          icon: '🎮', ext: 'mp4',  settings: { resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '60' } },
  { id: 'xbox',      label: 'Xbox',               icon: '🎮', ext: 'mp4',  settings: { resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '60' } },
  { id: 'youtube',   label: 'YouTube 1080p',      icon: '▶️', ext: 'mp4',  settings: { resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '30' } },
  { id: 'youtube4k', label: 'YouTube 4K',         icon: '▶️', ext: 'mp4',  settings: { resolution: '3840:2160', videoBitrate: '35000k',audioBitrate: '192k', fps: '60' } },
  { id: 'instagram', label: 'Instagram',          icon: '📸', ext: 'mp4',  settings: { resolution: '1080:1080', videoBitrate: '3500k', audioBitrate: '128k', fps: '30' } },
  { id: 'twitter',   label: 'Twitter / X',        icon: '🐦', ext: 'mp4',  settings: { resolution: '1280:720',  videoBitrate: '2500k', audioBitrate: '128k', fps: '30' } },
  { id: 'dvd',       label: 'DVD',                icon: '📀', ext: 'mpg',  settings: { resolution: '720:480',   videoBitrate: '4000k', audioBitrate: '192k', fps: '29.97' } },
  { id: 'hd720',     label: 'HD 720p',            icon: '📺', ext: 'mp4',  settings: { resolution: '1280:720',  videoBitrate: '2000k', audioBitrate: '128k', fps: '30' } },
  { id: 'hd1080',    label: 'HD 1080p',           icon: '📺', ext: 'mp4',  settings: { resolution: '1920:1080', videoBitrate: '5000k', audioBitrate: '192k', fps: '30' } },
]

// ─── Real Trim Editor ────────────────────────────────────────────────────────
function TrimEditor({ filePath, duration, trim, onChange, category }) {
  const videoRef = useRef(null)
  const timelineRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const dur = duration || 300
  const start = trim?.start ?? 0
  const end = trim?.end ?? dur

  const fileUrl = filePath ? `file:///${filePath.replace(/\\/g, '/')}` : null

  function seekTo(t) { if (videoRef.current) videoRef.current.currentTime = t }

  const drag = useRef(null)
  function startDrag(which, e) {
    e.preventDefault()
    drag.current = which
    const onMove = (ev) => {
      const rect = timelineRef.current?.getBoundingClientRect()
      if (!rect) return
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const t = ratio * dur
      if (which === 'start') {
        const newStart = Math.min(t, end - 0.5)
        onChange({ start: Math.max(0, newStart), end })
        seekTo(Math.max(0, newStart))
      } else {
        const newEnd = Math.max(t, start + 0.5)
        onChange({ start, end: Math.min(dur, newEnd) })
        seekTo(Math.min(dur, newEnd))
      }
    }
    const onUp = () => {
      drag.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleTimelineClick(e) {
    if (drag.current) return
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = (e.clientX - rect.left) / rect.width
    seekTo(ratio * dur)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Video / Audio preview */}
      {fileUrl && (
        category === 'video' ? (
          <video ref={videoRef} src={fileUrl}
            style={{ width: '100%', maxHeight: 160, background: '#000', borderRadius: 2 }}
            onLoadedMetadata={() => setLoaded(true)}
            onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
            controls
          />
        ) : (
          <audio ref={videoRef} src={fileUrl}
            style={{ width: '100%' }}
            onLoadedMetadata={() => setLoaded(true)}
            onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
            controls
          />
        )
      )}

      {/* Timeline */}
      <div style={{ position: 'relative', userSelect: 'none' }}>
        <div ref={timelineRef}
          onClick={handleTimelineClick}
          style={{
            height: 28, background: '#ddd', borderRadius: 3, cursor: 'pointer',
            position: 'relative', border: '1px solid #bbb', overflow: 'visible',
          }}>
          {/* Selected region */}
          <div style={{
            position: 'absolute', top: 0, height: '100%',
            left: `${(start / dur) * 100}%`,
            width: `${((end - start) / dur) * 100}%`,
            background: 'rgba(0,102,204,0.35)',
            borderLeft: '2px solid #0066cc', borderRight: '2px solid #0066cc',
          }} />

          {/* Playhead */}
          <div style={{
            position: 'absolute', top: -3, height: 34, width: 2,
            background: '#e44', left: `${(currentTime / dur) * 100}%`,
            pointerEvents: 'none',
          }} />

          {/* Start handle */}
          <div
            onMouseDown={e => startDrag('start', e)}
            style={{
              position: 'absolute', top: -4, width: 12, height: 36,
              left: `calc(${(start / dur) * 100}% - 6px)`,
              background: '#0066cc', borderRadius: 3, cursor: 'ew-resize',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}>
            <div style={{ width: 2, height: 14, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
          </div>

          {/* End handle */}
          <div
            onMouseDown={e => startDrag('end', e)}
            style={{
              position: 'absolute', top: -4, width: 12, height: 36,
              left: `calc(${(end / dur) * 100}% - 6px)`,
              background: '#0066cc', borderRadius: 3, cursor: 'ew-resize',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}>
            <div style={{ width: 2, height: 14, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
          </div>
        </div>

        {/* Time labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#888', marginTop: 2 }}>
          <span>0:00</span>
          <span>{fmtTime(dur / 2)}</span>
          <span>{fmtTime(dur)}</span>
        </div>
      </div>

      {/* Time inputs */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#555' }}>התחלה:</span>
          <input type="number" min="0" max={end} step="0.1" value={start.toFixed(1)}
            onChange={e => onChange({ start: parseFloat(e.target.value) || 0, end })}
            style={{ width: 60, fontSize: 11, padding: '1px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
          <span style={{ color: '#888' }}>שניות</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#555' }}>סיום:</span>
          <input type="number" min={start} max={dur} step="0.1" value={end.toFixed(1)}
            onChange={e => onChange({ start, end: parseFloat(e.target.value) || dur })}
            style={{ width: 60, fontSize: 11, padding: '1px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
          <span style={{ color: '#888' }}>שניות</span>
        </div>
        <span style={{ color: '#0066cc', fontWeight: 600 }}>
          ⏱ {fmtTime(end - start)}
        </span>
        <button onClick={() => onChange(null)} style={{
          fontSize: 10, padding: '1px 8px', cursor: 'pointer',
          background: '#f5f5f5', border: '1px solid #bbb', borderRadius: 2,
        }}>איפוס</button>
      </div>
    </div>
  )
}

// ─── Settings panels ─────────────────────────────────────────────────────────
function AudioSettings({ settings, onChange, filePath, duration, category }) {
  const s = settings || {}
  const [activeTab, setActiveTab] = useState('audio')
  const tabs = [{ id: 'audio', label: 'אודיו' }, { id: 'trim', label: '✂ חיתוך' }]
  return (
    <div>
      <div style={{ display: 'flex', gap: 1, marginBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '3px 12px', fontSize: 11, cursor: 'pointer', border: '1px solid #bbb',
            background: activeTab === t.id ? '#0066cc' : '#f0f0f0',
            color: activeTab === t.id ? '#fff' : '#333',
            borderRadius: t.id === 'audio' ? '3px 0 0 3px' : '0 3px 3px 0',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'audio' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Sel label="קודק" value={s.audioCodec} onChange={v => onChange({ ...s, audioCodec: v })} options={AUDIO_CODECS} />
          <Sel label="קצב סיביות" value={s.audioBitrate} onChange={v => onChange({ ...s, audioBitrate: v })} options={AUDIO_BITRATES} />
          <Sel label="תדר דגימה" value={s.sampleRate} onChange={v => onChange({ ...s, sampleRate: v })} options={SAMPLE_RATES} />
          <Sel label="ערוצים" value={s.channels} onChange={v => onChange({ ...s, channels: v })} options={AUDIO_CHANNELS} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
              <input type="checkbox" checked={!!s.normalize} onChange={e => onChange({ ...s, normalize: e.target.checked })} />
              נרמול עוצמה
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: '#555' }}>fade in (שנ):</span>
              <input type="number" min="0" max="10" step="0.5" value={s.fadeIn || ''} placeholder="0"
                onChange={e => onChange({ ...s, fadeIn: e.target.value || null })}
                style={{ width: 50, fontSize: 11, padding: '1px 3px', border: '1px solid #bbb', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: '#555' }}>fade out (שנ):</span>
              <input type="number" min="0" max="10" step="0.5" value={s.fadeOut || ''} placeholder="0"
                onChange={e => onChange({ ...s, fadeOut: e.target.value || null })}
                style={{ width: 50, fontSize: 11, padding: '1px 3px', border: '1px solid #bbb', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trim' && (
        <TrimEditor
          filePath={filePath}
          duration={duration}
          trim={s.trim}
          onChange={trim => onChange({ ...s, trim })}
          category={category}
        />
      )}
    </div>
  )
}

const HW_ACCEL_OPTIONS = [
  { value: null,    label: 'CPU בלבד (ברירת מחדל)' },
  { value: 'nvenc', label: '⚡ NVIDIA NVENC' },
  { value: 'qsv',   label: '⚡ Intel QuickSync' },
  { value: 'amf',   label: '⚡ AMD AMF' },
]

function VideoSettings({ settings, onChange, filePath, duration, availableHW }) {
  const s = settings || {}
  const [tab, setTab] = useState('video')
  const tabs = [
    { id: 'video', label: 'וידאו' },
    { id: 'audio', label: 'אודיו' },
    { id: 'trim',  label: '✂ חיתוך' },
    { id: 'presets', label: '📱 מכשירים' },
    { id: 'advanced', label: 'מתקדם' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 1, marginBottom: 8, flexWrap: 'wrap' }}>
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '3px 10px', fontSize: 11, cursor: 'pointer', border: '1px solid #bbb',
            background: tab === t.id ? '#0066cc' : '#f0f0f0',
            color: tab === t.id ? '#fff' : '#333',
            borderRadius: i === 0 ? '3px 0 0 3px' : i === tabs.length - 1 ? '0 3px 3px 0' : '0',
            borderRight: i < tabs.length - 1 ? 'none' : '1px solid #bbb',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'video' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Sel label="רזולוציה" value={s.resolution} onChange={v => onChange({ ...s, resolution: v })} options={RESOLUTIONS} />
          <Sel label="קודק וידאו" value={s.videoCodec} onChange={v => onChange({ ...s, videoCodec: v })} options={VIDEO_CODECS} />
          <Sel label="קצב סיביות" value={s.videoBitrate} onChange={v => onChange({ ...s, videoBitrate: v })} options={VIDEO_BITRATES} />
          <Sel label="קצב פריימים" value={s.fps} onChange={v => onChange({ ...s, fps: v })} options={FRAMERATES} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, color: '#555' }}>האצת חומרה (GPU)</label>
            <select value={s.hwAccel ?? ''} onChange={e => onChange({ ...s, hwAccel: e.target.value || null })}
              style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff', minWidth: 160 }}>
              {HW_ACCEL_OPTIONS.map(o => {
                const isAvailable = !o.value || availableHW?.includes(o.value)
                return (
                  <option key={String(o.value)} value={o.value ?? ''} disabled={o.value && !isAvailable}>
                    {o.label}{o.value && !isAvailable ? ' (לא זמין)' : ''}
                  </option>
                )
              })}
            </select>
            {s.hwAccel && <span style={{ fontSize: 9, color: '#0a7', marginTop: 1 }}>⚡ מהיר פי 5–20, fallback אוטומטי ל-CPU</span>}
          </div>
        </div>
      )}

      {tab === 'audio' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Sel label="קודק אודיו" value={s.audioCodec} onChange={v => onChange({ ...s, audioCodec: v })} options={AUDIO_CODECS} />
          <Sel label="קצב סיביות" value={s.audioBitrate} onChange={v => onChange({ ...s, audioBitrate: v })} options={AUDIO_BITRATES} />
          <Sel label="תדר דגימה" value={s.sampleRate} onChange={v => onChange({ ...s, sampleRate: v })} options={SAMPLE_RATES} />
          <Sel label="ערוצים" value={s.channels} onChange={v => onChange({ ...s, channels: v })} options={AUDIO_CHANNELS} />
          <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11, marginTop: 12 }}>
            <input type="checkbox" checked={!!s.noAudio} onChange={e => onChange({ ...s, noAudio: e.target.checked })} />
            ללא אודיו (וידאו בלבד)
          </label>
        </div>
      )}

      {tab === 'trim' && (
        <TrimEditor
          filePath={filePath}
          duration={duration}
          trim={s.trim}
          onChange={trim => onChange({ ...s, trim })}
          category="video"
        />
      )}

      {tab === 'presets' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DEVICE_PRESETS.map(p => (
            <button key={p.id}
              onClick={() => onChange({ ...s, ...p.settings })}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: 90, padding: '6px 4px', gap: 3, cursor: 'pointer',
                background: '#fff', border: '1px solid #c8d8e8', borderRadius: 4,
                fontSize: 10, transition: 'all 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fc'; e.currentTarget.style.borderColor = '#0066cc' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#c8d8e8' }}
            >
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'advanced' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, color: '#555' }}>סיבוב</label>
            <select value={s.rotate ?? ''} onChange={e => onChange({ ...s, rotate: e.target.value || null })}
              style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
              <option value="">ללא סיבוב</option>
              <option value="90">90° ימינה</option>
              <option value="180">180°</option>
              <option value="270">90° שמאלה</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, color: '#555' }}>היפוך</label>
            <select value={s.flip ?? ''} onChange={e => onChange({ ...s, flip: e.target.value || null })}
              style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
              <option value="">ללא</option>
              <option value="horizontal">אופקי</option>
              <option value="vertical">אנכי</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, color: '#555' }}>כתוביות (.srt)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input value={s.subtitleFile || ''} readOnly placeholder="בחר קובץ..."
                style={{ fontSize: 10, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, width: 120 }} />
              <button onClick={async () => {
                const f = await window.electronAPI?.openFiles({ multiple: false })
                if (f?.[0]) onChange({ ...s, subtitleFile: f[0] })
              }} style={{ fontSize: 10, padding: '1px 6px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #bbb', borderRadius: 2 }}>
                📂
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, color: '#555' }}>לוגו / ווטרמארק</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input value={s.watermarkPath ? s.watermarkPath.split(/[\\/]/).pop() : ''} readOnly placeholder="בחר תמונה..."
                style={{ fontSize: 10, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, width: 120 }} />
              <button onClick={async () => {
                const f = await window.electronAPI?.openFiles({ multiple: false })
                if (f?.[0]) onChange({ ...s, watermarkPath: f[0], watermarkPosition: s.watermarkPosition || 'bottomright' })
              }} style={{ fontSize: 10, padding: '1px 6px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #bbb', borderRadius: 2 }}>📂</button>
              {s.watermarkPath && <button onClick={() => onChange({ ...s, watermarkPath: null })} style={{ fontSize: 10, padding: '1px 6px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #bbb', borderRadius: 2 }}>✕</button>}
            </div>
            {s.watermarkPath && (
              <select value={s.watermarkPosition || 'bottomright'} onChange={e => onChange({ ...s, watermarkPosition: e.target.value })}
                style={{ fontSize: 10, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff', marginTop: 2 }}>
                <option value="topleft">שמאל עליון</option>
                <option value="topright">ימין עליון</option>
                <option value="bottomleft">שמאל תחתון</option>
                <option value="bottomright">ימין תחתון</option>
                <option value="center">מרכז</option>
              </select>
            )}
          </div>
          <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11, marginTop: 12 }}>
            <input type="checkbox" checked={!!s.grayscale} onChange={e => onChange({ ...s, grayscale: e.target.checked })} />
            גווני אפור
          </label>
        </div>
      )}
    </div>
  )
}

function ImageSettings({ settings, onChange }) {
  const s = settings || {}
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <label style={{ fontSize: 10, color: '#555' }}>רוחב (פיקסל)</label>
        <input type="number" value={s.width || ''} onChange={e => onChange({ ...s, width: e.target.value || null })}
          placeholder="אוטומטי" style={{ width: 80, fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <label style={{ fontSize: 10, color: '#555' }}>גובה (פיקסל)</label>
        <input type="number" value={s.height || ''} onChange={e => onChange({ ...s, height: e.target.value || null })}
          placeholder="אוטומטי" style={{ width: 80, fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <label style={{ fontSize: 10, color: '#555' }}>איכות (1–100)</label>
        <input type="number" min="1" max="100" value={s.quality || 85}
          onChange={e => onChange({ ...s, quality: +e.target.value })}
          style={{ width: 60, fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
      </div>
      <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11, marginTop: 14 }}>
        <input type="checkbox" checked={s.keepAspect !== false} onChange={e => onChange({ ...s, keepAspect: e.target.checked })} />
        שמור פרופורציות
      </label>
      <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11, marginTop: 14 }}>
        <input type="checkbox" checked={!!s.grayscale} onChange={e => onChange({ ...s, grayscale: e.target.checked })} />
        גווני אפור
      </label>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ConversionSetup({ availableHW = [] }) {
  const { setupWindow, closeSetupWindow, updateSetupSettings, updateSetupFiles, addTasks, settings } = useStore()
  const [probedInfo, setProbedInfo] = useState({}) // path → { duration, resolution, codec, audioCodec }

  // Auto-probe newly added files — must be before any early return
  const files = setupWindow?.files ?? []
  useEffect(() => {
    files.forEach(f => { if (!probedInfo[f.path]) probeAllFiles(f) })
  }, [files]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!setupWindow) return null
  const { targetFormat, category, convSettings } = setupWindow

  // Preview file for trim: first file in list
  const previewFile = files[0]
  const previewDuration = previewFile ? (probedInfo[previewFile.path]?.duration ?? null) : null

  async function probeAllFiles(file) {
    if (probedInfo[file.path]) return
    try {
      const meta = await window.electronAPI?.probeFile(file.path)
      if (!meta) return
      const videoStream = meta.streams?.find(s => s.codec_type === 'video')
      const audioStream = meta.streams?.find(s => s.codec_type === 'audio')
      setProbedInfo(prev => ({
        ...prev,
        [file.path]: {
          duration: meta.format?.duration || null,
          resolution: videoStream ? `${videoStream.width}×${videoStream.height}` : null,
          codec: videoStream?.codec_name || null,
          audioCodec: audioStream?.codec_name || null,
          fps: videoStream?.r_frame_rate ? (() => { const [n, d] = videoStream.r_frame_rate.split('/'); return d ? (Number(n) / Number(d)).toFixed(0) : Number(n).toFixed(0) })() : null,
        }
      }))
    } catch {}
  }

  async function handleAddFiles() {
    const picked = await window.electronAPI?.openFiles({ multiple: true })
    if (picked?.length) {
      const asObjs = picked.map(p => {
        const name = p.replace(/\\/g, '/').split('/').pop()
        return { name, path: p, size: 0 }
      })
      updateSetupFiles([...files, ...asObjs])
      asObjs.forEach(f => probeAllFiles(f))
    }
  }

  async function handleDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, path: f.path, size: f.size }))
    updateSetupFiles([...files, ...dropped])
    dropped.forEach(f => probeAllFiles(f))
  }

  function handleOk() {
    if (!files.length) return
    addTasks(files, targetFormat, convSettings, category)
    closeSetupWindow()
  }

  const title = `המר ל-${targetFormat.label} (.${targetFormat.ext})`

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}
      onClick={e => { if (e.target === e.currentTarget) closeSetupWindow() }}
    >
      <div style={{
        background: '#f5f5f5', border: '1px solid #888', borderRadius: 4,
        width: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        {/* Title bar */}
        <div style={{
          background: 'linear-gradient(180deg,#1a5fa8,#0d3d7a)',
          color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 700,
          borderRadius: '4px 4px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>🔄 {title}</span>
          <button onClick={closeSetupWindow} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            cursor: 'pointer', borderRadius: 2, padding: '1px 7px', fontSize: 14,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* File list toolbar */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={handleAddFiles} style={{
              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
              background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2,
            }}>📂 הוסף קובץ</button>
            <button onClick={() => updateSetupFiles([])} style={{
              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
              background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2,
            }}>🗑 נקה רשימה</button>
            <span style={{ fontSize: 10, color: '#888' }}>{files.length} קבצים</span>
          </div>

          {/* File list */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{ border: '1px solid #ccc', borderRadius: 2, background: '#fff', minHeight: 80, maxHeight: 160, overflow: 'auto' }}
          >
            {files.length === 0 ? (
              <div style={{
                height: 80, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 11, gap: 4,
              }}>
                <span style={{ fontSize: 24 }}>📂</span>
                גרור קבצים לכאן או לחץ "הוסף קובץ"
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#e8e8e8', borderBottom: '1px solid #ccc' }}>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600 }}>שם קובץ</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 70 }}>גודל</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 60 }}>משך</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 90 }}>רזולוציה</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 70 }}>קודק</th>
                    <th style={{ padding: '3px 4px', width: 24 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, i) => {
                    const info = probedInfo[f.path]
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '3px 8px', color: '#333', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span title={f.path}>{f.name}</span>
                        </td>
                        <td style={{ padding: '3px 8px', color: '#888' }}>{fmtSize(f.size)}</td>
                        <td style={{ padding: '3px 8px', color: '#666' }}>{info?.duration ? fmtDur(info.duration) : <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '3px 8px', color: '#666' }}>{info?.resolution || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '3px 8px', color: '#666', fontFamily: 'monospace' }}>{info?.codec || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <button onClick={() => updateSetupFiles(files.filter((_, j) => j !== i))} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0,
                          }}>✕</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick presets for video */}
          {category === 'video' && (
            <div style={{ border: '1px solid #ccc', borderRadius: 2, background: '#fff', padding: '6px 10px' }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 5 }}>⚡ פרופילים מהירים:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {DEVICE_PRESETS.map(p => (
                  <button key={p.id} onClick={() => updateSetupSettings({ ...convSettings, ...p.settings })}
                    style={{ fontSize: 10, padding: '2px 8px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #bbb', borderRadius: 10 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#dce9f8'; e.currentTarget.style.borderColor = '#0066cc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#bbb' }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Output settings */}
          <div style={{ border: '1px solid #ccc', borderRadius: 2, background: '#fff', padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3f6f', marginBottom: 8,
              borderBottom: '1px solid #e0e0e0', paddingBottom: 4 }}>
              ⚙ הגדרות פלט
            </div>
            {category === 'video' && (
              <VideoSettings
                settings={convSettings}
                onChange={updateSetupSettings}
                filePath={previewFile?.path}
                duration={previewDuration}
                availableHW={availableHW}
              />
            )}
            {category === 'audio' && (
              <AudioSettings
                settings={convSettings}
                onChange={updateSetupSettings}
                filePath={previewFile?.path}
                duration={previewDuration}
                category="audio"
              />
            )}
            {category === 'image' && <ImageSettings settings={convSettings} onChange={updateSetupSettings} />}
            {(category === 'dvd' || category === 'tools') && (
              <div style={{ fontSize: 11, color: '#888' }}>ברירות מחדל — ללא הגדרות נוספות</div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          padding: '8px 12px', background: '#e8e8e8',
          borderTop: '1px solid #ccc', borderRadius: '0 0 4px 4px',
          display: 'flex', justifyContent: 'flex-start', gap: 8, alignItems: 'center',
        }}>
          <button
            onClick={handleOk}
            disabled={files.length === 0}
            style={{
              padding: '5px 24px', fontSize: 12, fontWeight: 700,
              cursor: files.length ? 'pointer' : 'not-allowed',
              background: files.length ? 'linear-gradient(180deg,#4caf78,#2e8b57)' : '#ccc',
              color: '#fff', border: '1px solid #1a6b3a', borderRadius: 3,
            }}>
            אישור
          </button>
          <button onClick={closeSetupWindow} style={{
            padding: '5px 18px', fontSize: 12, cursor: 'pointer',
            background: '#f5f5f5', border: '1px solid #aaa', borderRadius: 3,
          }}>ביטול</button>
          {files.length > 0 && (
            <span style={{ fontSize: 10, color: '#888', marginRight: 'auto' }}>
              {files.length} קבצים יתווספו לתור
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
