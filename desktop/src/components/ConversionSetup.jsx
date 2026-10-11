import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS,
  VIDEO_CODECS, AUDIO_CODECS, RESOLUTIONS, VIDEO_BITRATES,
  AUDIO_BITRATES, FRAMERATES, SAMPLE_RATES, AUDIO_CHANNELS } from '../utils/formats'

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <label style={{ fontSize: 10, color: '#555' }}>{label}</label>
      <select value={value ?? ''} onChange={e => onChange(e.target.value || null)}
        style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
        {options.map(o => <option key={o.value ?? '__null__'} value={o.value ?? ''}>{o.label}</option>)}
      </select>
    </div>
  )
}

function AudioSettings({ settings, onChange }) {
  const s = settings || {}
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <Sel label="קודק אודיו" value={s.audioCodec} onChange={v => onChange({ ...s, audioCodec: v })} options={AUDIO_CODECS} />
      <Sel label="קצב סיביות" value={s.audioBitrate} onChange={v => onChange({ ...s, audioBitrate: v })} options={AUDIO_BITRATES} />
      <Sel label="תדר דגימה" value={s.sampleRate} onChange={v => onChange({ ...s, sampleRate: v })} options={SAMPLE_RATES} />
      <Sel label="ערוצים" value={s.channels} onChange={v => onChange({ ...s, channels: v })} options={AUDIO_CHANNELS} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <input type="checkbox" id="norm" checked={!!s.normalize} onChange={e => onChange({ ...s, normalize: e.target.checked })} />
        <label htmlFor="norm" style={{ fontSize: 11, color: '#333' }}>נרמול עוצמת שמע</label>
      </div>
    </div>
  )
}

function VideoSettings({ settings, onChange }) {
  const s = settings || {}
  const [tab, setTab] = useState('video')
  const tabs = [{ id: 'video', label: 'וידאו' }, { id: 'audio', label: 'אודיו' }, { id: 'advanced', label: 'מתקדם' }]
  return (
    <div>
      <div style={{ display: 'flex', gap: 1, marginBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '3px 12px', fontSize: 11, cursor: 'pointer', border: '1px solid #bbb',
            background: tab === t.id ? '#0066cc' : '#f0f0f0',
            color: tab === t.id ? '#fff' : '#333',
            borderRadius: t.id === 'video' ? '3px 0 0 3px' : t.id === 'advanced' ? '0 3px 3px 0' : '0',
          }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'video' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Sel label="רזולוציה" value={s.resolution} onChange={v => onChange({ ...s, resolution: v })} options={RESOLUTIONS} />
          <Sel label="קודק וידאו" value={s.videoCodec} onChange={v => onChange({ ...s, videoCodec: v })} options={VIDEO_CODECS} />
          <Sel label="קצב סיביות" value={s.videoBitrate} onChange={v => onChange({ ...s, videoBitrate: v })} options={VIDEO_BITRATES} />
          <Sel label="קצב פריימים" value={s.fps} onChange={v => onChange({ ...s, fps: v })} options={FRAMERATES} />
        </div>
      )}
      {tab === 'audio' && <AudioSettings settings={s} onChange={onChange} />}
      {tab === 'advanced' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <input type="checkbox" id="noaudio" checked={!!s.noAudio} onChange={e => onChange({ ...s, noAudio: e.target.checked })} />
            <label htmlFor="noaudio" style={{ fontSize: 11, color: '#333' }}>ללא אודיו (וידאו בלבד)</label>
          </div>
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
        <label style={{ fontSize: 10, color: '#555' }}>איכות (1-100)</label>
        <input type="number" min="1" max="100" value={s.quality || 85} onChange={e => onChange({ ...s, quality: +e.target.value })}
          style={{ width: 60, fontSize: 11, padding: '2px 4px', border: '1px solid #bbb', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <input type="checkbox" id="keepAspect" checked={s.keepAspect !== false} onChange={e => onChange({ ...s, keepAspect: e.target.checked })} />
        <label htmlFor="keepAspect" style={{ fontSize: 11 }}>שמור פרופורציות</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <input type="checkbox" id="grayscale" checked={!!s.grayscale} onChange={e => onChange({ ...s, grayscale: e.target.checked })} />
        <label htmlFor="grayscale" style={{ fontSize: 11 }}>גווני אפור</label>
      </div>
    </div>
  )
}

export default function ConversionSetup() {
  const { setupWindow, closeSetupWindow, updateSetupSettings, updateSetupFiles, addTasks, settings } = useStore()
  const fileInputRef = useRef(null)

  if (!setupWindow) return null
  const { targetFormat, category, files, convSettings } = setupWindow

  async function handleAddFiles() {
    const accept = category === 'video' ? ['mp4','avi','mkv','mov','wmv','flv','webm','3gp','mpg','ts','vob','rmvb','m4v']
      : category === 'audio' ? ['mp3','aac','wav','flac','ogg','wma','m4a','opus','ac3','aiff','ape']
      : ['jpg','jpeg','png','bmp','gif','webp','tiff','ico']
    const picked = await window.electronAPI?.openFiles({ multiple: true })
    if (picked?.length) updateSetupFiles([...files, ...picked])
  }

  function handleRemoveFile(idx) {
    updateSetupFiles(files.filter((_, i) => i !== idx))
  }

  async function handleDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, path: f.path, size: f.size }))
    updateSetupFiles([...files, ...dropped])
  }

  function handleOk() {
    if (!files.length) return
    addTasks(files, targetFormat, convSettings)
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
        background: '#f5f5f5', border: '1px solid #888',
        borderRadius: 4, width: 640, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        {/* Title bar */}
        <div style={{
          background: 'linear-gradient(180deg,#1a5fa8,#0d3d7a)',
          color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 700,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderRadius: '4px 4px 0 0',
        }}>
          <span>🔄 {title}</span>
          <button onClick={closeSetupWindow} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            cursor: 'pointer', borderRadius: 2, padding: '1px 7px', fontSize: 14,
          }}>✕</button>
        </div>

        {/* File list area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 10, gap: 8 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAddFiles} style={{
              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
              background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2,
            }}>📂 הוסף קובץ</button>
            <button onClick={() => updateSetupFiles([])} style={{
              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
              background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2,
            }}>🗑 נקה רשימה</button>
            <span style={{ fontSize: 10, color: '#888', alignSelf: 'center' }}>
              {files.length} קבצים
            </span>
          </div>

          {/* File list */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              flex: 1, minHeight: 120, maxHeight: 200, overflow: 'auto',
              border: '1px solid #ccc', borderRadius: 2, background: '#fff',
            }}
          >
            {files.length === 0 ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: '#aaa',
                fontSize: 11, gap: 6, padding: 20,
              }}>
                <span style={{ fontSize: 28 }}>📂</span>
                גרור קבצים לכאן או לחץ "הוסף קובץ"
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#e8e8e8', borderBottom: '1px solid #ccc' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>שם קובץ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600, width: 80 }}>גודל</th>
                    <th style={{ padding: '4px 6px', width: 24 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '3px 8px', color: '#333' }}>
                        <span title={f.path}>{f.name}</span>
                      </td>
                      <td style={{ padding: '3px 8px', color: '#888' }}>{formatSize(f.size)}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                        <button onClick={() => handleRemoveFile(i)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#cc4444', fontSize: 12,
                        }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Settings */}
          <div style={{
            border: '1px solid #ccc', borderRadius: 2, background: '#fff', padding: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3f6f', marginBottom: 8,
              borderBottom: '1px solid #e0e0e0', paddingBottom: 4 }}>
              ⚙ הגדרות פלט
            </div>
            {category === 'video'  && <VideoSettings settings={convSettings} onChange={updateSetupSettings} />}
            {category === 'audio'  && <AudioSettings settings={convSettings} onChange={updateSetupSettings} />}
            {category === 'image'  && <ImageSettings settings={convSettings} onChange={updateSetupSettings} />}
            {(category === 'dvd' || category === 'tools') && (
              <div style={{ fontSize: 11, color: '#888' }}>ברירות מחדל — ללא הגדרות נוספות</div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          padding: '8px 12px', background: '#e8e8e8',
          borderTop: '1px solid #ccc', borderRadius: '0 0 4px 4px',
          display: 'flex', justifyContent: 'flex-start', gap: 8,
        }}>
          <button
            onClick={handleOk}
            disabled={files.length === 0}
            style={{
              padding: '5px 24px', fontSize: 12, fontWeight: 700, cursor: files.length ? 'pointer' : 'not-allowed',
              background: files.length ? 'linear-gradient(180deg,#4caf78,#2e8b57)' : '#ccc',
              color: '#fff', border: '1px solid #1a6b3a', borderRadius: 3,
            }}
          >
            אישור
          </button>
          <button onClick={closeSetupWindow} style={{
            padding: '5px 18px', fontSize: 12, cursor: 'pointer',
            background: '#f5f5f5', border: '1px solid #aaa', borderRadius: 3,
          }}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
