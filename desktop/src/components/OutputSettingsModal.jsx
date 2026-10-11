import React, { useState, useRef, useCallback } from 'react'
import {
  RESOLUTIONS, VIDEO_BITRATES, AUDIO_BITRATES, FRAMERATES,
  SAMPLE_RATES, AUDIO_CHANNELS, VIDEO_CODECS, AUDIO_CODECS, DEVICE_PRESETS
} from '../utils/formats'
import { PRESETS } from '../utils/presets'

/* ── Trim editor ─────────────────────────────────────────────── */
function TrimEditor({ trim, onChange, totalSec = 300 }) {
  const barRef = useRef(null)
  const start = trim?.start ?? 0
  const end   = trim?.end   ?? totalSec

  const fmtTime = s => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const posFromEvent = (e) => {
    const rect = barRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    return Math.round((x / rect.width) * totalSec)
  }

  const dragHandle = (which) => (e) => {
    e.preventDefault()
    const move = (ev) => {
      const t = posFromEvent(ev)
      if (which === 'start') onChange({ start: Math.min(t, end - 1), end })
      else                   onChange({ start, end: Math.max(t, start + 1) })
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const startPct = (start / totalSec) * 100
  const endPct   = (end   / totalSec) * 100

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#555' }}>
        <span>✂️ חיתוך</span>
        <button onClick={() => onChange({ start: null, end: null })}
          style={{ fontSize: 10, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
          איפוס
        </button>
      </div>

      {/* Waveform bar */}
      <div ref={barRef} style={{
        position: 'relative', height: 48, borderRadius: 4,
        background: 'linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%)',
        border: '1px solid #bbb', cursor: 'crosshair', overflow: 'visible', marginBottom: 8,
      }}>
        {/* Fake waveform lines */}
        {Array.from({ length: 40 }).map((_, i) => {
          const h = 10 + Math.abs(Math.sin(i * 0.7 + 1) * 20 + Math.sin(i * 1.3) * 10)
          return (
            <div key={i} style={{
              position: 'absolute', bottom: '50%', transform: 'translateY(50%)',
              left: `${(i / 40) * 100}%`, width: 2, height: h,
              background: '#aaa', borderRadius: 1,
            }} />
          )
        })}

        {/* Selected region */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${startPct}%`, width: `${endPct - startPct}%`,
          background: 'rgba(37,99,235,0.25)', borderTop: '2px solid #2563eb', borderBottom: '2px solid #2563eb',
          pointerEvents: 'none',
        }} />

        {/* Start handle */}
        <div onMouseDown={dragHandle('start')} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${startPct}%`,
          width: 12, marginLeft: -6, cursor: 'ew-resize', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 12, height: '100%', background: '#2563eb', borderRadius: '3px 0 0 3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ color: '#fff', fontSize: 8, letterSpacing: -1, userSelect: 'none' }}>|||</div>
          </div>
        </div>

        {/* End handle */}
        <div onMouseDown={dragHandle('end')} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${endPct}%`,
          width: 12, marginLeft: -6, cursor: 'ew-resize', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 12, height: '100%', background: '#2563eb', borderRadius: '0 3px 3px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ color: '#fff', fontSize: 8, letterSpacing: -1, userSelect: 'none' }}>|||</div>
          </div>
        </div>
      </div>

      {/* Time inputs */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>התחלה</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input type="number" min={0} max={end - 1} value={start || 0}
              onChange={e => onChange({ start: parseFloat(e.target.value) || 0, end })}
              style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '3px 6px' }} />
            <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{fmtTime(start)}</span>
          </div>
        </div>
        <div style={{ fontSize: 18, color: '#bbb', alignSelf: 'flex-end', paddingBottom: 4 }}>→</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>סיום</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input type="number" min={start + 1} value={end || totalSec}
              onChange={e => onChange({ start, end: parseFloat(e.target.value) || totalSec })}
              style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '3px 6px' }} />
            <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{fmtTime(end)}</span>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-end', paddingBottom: 4, fontSize: 11, color: '#2563eb', fontWeight: 700 }}>
          {fmtTime(end - start)}
        </div>
      </div>
    </div>
  )
}

/* ── Field helpers ───────────────────────────────────────────── */
function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value || null)}
      style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '4px 6px', background: '#fff' }}>
      {options.map(o => <option key={o.value ?? '__auto'} value={o.value ?? ''}>{o.label}</option>)}
    </select>
  )
}

/* ── Audio settings panel ────────────────────────────────────── */
function AudioPanel({ s, onChange, trim, onTrimChange }) {
  return (
    <>
      <Row label="קודק אודיו">
        <Select value={s.audioCodec} onChange={v => onChange({ ...s, audioCodec: v })} options={AUDIO_CODECS} />
      </Row>
      <Row label="קצב סיביות">
        <Select value={s.audioBitrate} onChange={v => onChange({ ...s, audioBitrate: v })} options={AUDIO_BITRATES} />
      </Row>
      <Row label="קצב דגימה">
        <Select value={s.sampleRate} onChange={v => onChange({ ...s, sampleRate: v })} options={SAMPLE_RATES} />
      </Row>
      <Row label="ערוצים">
        <Select value={s.channels} onChange={v => onChange({ ...s, channels: v })} options={AUDIO_CHANNELS} />
      </Row>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <input type="checkbox" id="normalize" checked={!!s.normalize}
          onChange={e => onChange({ ...s, normalize: e.target.checked })} />
        <label htmlFor="normalize" style={{ fontSize: 11, color: '#444', cursor: 'pointer' }}>נרמל עוצמת אודיו</label>
      </div>
      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 12 }}>
        <TrimEditor trim={trim} onChange={onTrimChange} />
      </div>
    </>
  )
}

/* ── Video settings panel ────────────────────────────────────── */
function VideoPanel({ s, onChange, trim, onTrimChange }) {
  const [subTab, setSubTab] = useState('video')
  return (
    <>
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, borderBottom: '1px solid #ddd', paddingBottom: 0 }}>
        {[['video','וידאו'],['audio','אודיו'],['trim','חיתוך'],['presets','פרסטים']].map(([k, lbl]) => (
          <button key={k} onClick={() => setSubTab(k)} style={{
            padding: '5px 12px', fontSize: 11, fontWeight: subTab === k ? 700 : 400,
            color: subTab === k ? '#2563eb' : '#666',
            background: 'none', border: 'none', borderBottom: subTab === k ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>{lbl}</button>
        ))}
      </div>

      {subTab === 'video' && <>
        <Row label="רזולוציה">
          <Select value={s.resolution} onChange={v => onChange({ ...s, resolution: v })} options={RESOLUTIONS} />
        </Row>
        <Row label="קודק וידאו">
          <Select value={s.videoCodec} onChange={v => onChange({ ...s, videoCodec: v })} options={VIDEO_CODECS} />
        </Row>
        <Row label="קצב סיביות וידאו">
          <Select value={s.videoBitrate} onChange={v => onChange({ ...s, videoBitrate: v })} options={VIDEO_BITRATES} />
        </Row>
        <Row label="קצב פריימים">
          <Select value={s.fps} onChange={v => onChange({ ...s, fps: v })} options={FRAMERATES} />
        </Row>
        <Row label="סיבוב">
          <div style={{ display: 'flex', gap: 6 }}>
            {[null, 90, 180, 270].map(r => (
              <button key={r} onClick={() => onChange({ ...s, rotate: r })} style={{
                flex: 1, padding: '5px 0', fontSize: 11, borderRadius: 3, cursor: 'pointer', border: '1px solid',
                background: s.rotate === r ? '#2563eb' : '#fff',
                color: s.rotate === r ? '#fff' : '#555',
                borderColor: s.rotate === r ? '#2563eb' : '#ccc',
              }}>
                {r === null ? 'ללא' : `${r}°`}
              </button>
            ))}
          </div>
        </Row>
      </>}

      {subTab === 'audio' && <>
        <Row label="קודק אודיו">
          <Select value={s.audioCodec} onChange={v => onChange({ ...s, audioCodec: v })} options={AUDIO_CODECS} />
        </Row>
        <Row label="קצב סיביות אודיו">
          <Select value={s.audioBitrate} onChange={v => onChange({ ...s, audioBitrate: v })} options={AUDIO_BITRATES} />
        </Row>
        <Row label="קצב דגימה">
          <Select value={s.sampleRate} onChange={v => onChange({ ...s, sampleRate: v })} options={SAMPLE_RATES} />
        </Row>
        <Row label="ערוצים">
          <Select value={s.channels} onChange={v => onChange({ ...s, channels: v })} options={AUDIO_CHANNELS} />
        </Row>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" id="normalize" checked={!!s.normalize}
            onChange={e => onChange({ ...s, normalize: e.target.checked })} />
          <label htmlFor="normalize" style={{ fontSize: 11, color: '#444', cursor: 'pointer' }}>נרמל עוצמת אודיו</label>
        </div>
      </>}

      {subTab === 'trim' && (
        <TrimEditor trim={trim} onChange={onTrimChange} />
      )}

      {subTab === 'presets' && <>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8 }}>פרסטים למכשירים</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
          {DEVICE_PRESETS.map(p => (
            <button key={p.id} onClick={() => onChange({ ...s, ...p.settings })} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
              border: '1px solid #ddd', borderRadius: 4, background: '#fff',
              cursor: 'pointer', fontSize: 11, color: '#333', textAlign: 'right',
            }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8 }}>פרסטים לאיכות</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {Object.entries(PRESETS.video || {}).map(([id, p]) => (
            <button key={id} onClick={() => onChange({ ...s, ...p })} style={{
              padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4,
              background: '#fff', cursor: 'pointer', fontSize: 11, color: '#333',
            }}>{p.label}</button>
          ))}
        </div>
      </>}
    </>
  )
}

/* ── Image settings panel ────────────────────────────────────── */
function ImagePanel({ s, onChange }) {
  return (
    <>
      <Row label="רוחב (פיקסל)">
        <input type="number" value={s.width || ''} placeholder="אוטומטי"
          onChange={e => onChange({ ...s, width: e.target.value || null })}
          style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '4px 6px' }} />
      </Row>
      <Row label="גובה (פיקסל)">
        <input type="number" value={s.height || ''} placeholder="אוטומטי"
          onChange={e => onChange({ ...s, height: e.target.value || null })}
          style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '4px 6px' }} />
      </Row>
      <Row label="איכות (1-100, JPG/WebP)">
        <input type="number" min={1} max={100} value={s.quality || 85}
          onChange={e => onChange({ ...s, quality: e.target.value })}
          style={{ width: '100%', fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '4px 6px' }} />
      </Row>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#444', cursor: 'pointer' }}>
          <input type="checkbox" checked={s.keepAspect !== false}
            onChange={e => onChange({ ...s, keepAspect: e.target.checked })} />
          שמור יחס גובה-רוחב
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#444', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!s.grayscale}
            onChange={e => onChange({ ...s, grayscale: e.target.checked })} />
          המר לגווני אפור
        </label>
      </div>
    </>
  )
}

/* ── Main modal ──────────────────────────────────────────────── */
export default function OutputSettingsModal({ category, format, settings, onChange, onClose, onApply, outputDir, onOutputDirChange }) {
  const [trim, setTrim] = useState(settings.trim || { start: null, end: null })

  const handleTrimChange = (t) => {
    setTrim(t)
    onChange({ ...settings, trim: t.start == null ? null : t })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        width: 480, maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #e0e0e0',
          background: '#f8f8f8',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>
            הגדרות פלט — <span style={{ color: '#2563eb' }}>{format?.label}</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {category === 'audio' && (
            <AudioPanel s={settings} onChange={onChange} trim={trim} onTrimChange={handleTrimChange} />
          )}
          {category === 'video' && (
            <VideoPanel s={settings} onChange={onChange} trim={trim} onTrimChange={handleTrimChange} />
          )}
          {category === 'image' && (
            <ImagePanel s={settings} onChange={onChange} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e0e0e0', padding: '12px 18px',
          background: '#f8f8f8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', flexShrink: 0 }}>תיקיית פלט:</label>
            <input type="text" value={outputDir} onChange={e => onOutputDirChange(e.target.value)}
              placeholder="זהה לקובץ המקור"
              style={{ flex: 1, fontSize: 11, border: '1px solid #bbb', borderRadius: 3, padding: '4px 6px' }} />
            <button onClick={async () => {
              const dir = await window.electronAPI?.openFolder()
              if (dir) onOutputDirChange(dir)
            }} style={{
              background: '#e0e0e0', border: '1px solid #bbb', borderRadius: 3,
              padding: '4px 8px', fontSize: 11, cursor: 'pointer', flexShrink: 0,
            }}>עיון</button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
            <button onClick={onApply} style={{
              background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4,
              padding: '7px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>החל הגדרות</button>
            <button onClick={onClose} style={{
              background: '#fff', color: '#555', border: '1px solid #ccc', borderRadius: 4,
              padding: '7px 16px', fontSize: 12, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      </div>
    </div>
  )
}
