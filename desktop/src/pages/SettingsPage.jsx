import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

const HW_OPTIONS = [
  { value: '',      label: 'CPU בלבד (ברירת מחדל)' },
  { value: 'nvenc', label: '⚡ NVIDIA NVENC' },
  { value: 'qsv',   label: '⚡ Intel QuickSync' },
  { value: 'amf',   label: '⚡ AMD AMF' },
]

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [availableHW, setAvailableHW] = useState([])

  useEffect(() => {
    window.electronAPI?.detectHardwareEncoders?.().then(hw => {
      const list = hw || []
      setAvailableHW(list)
      // Auto-select best GPU if none chosen yet
      if (list.length > 0 && !settings.defaultHwAccel) {
        const priority = ['nvenc', 'amf', 'qsv']
        const best = priority.find(p => list.includes(p))
        if (best) updateSettings({ defaultHwAccel: best })
      }
    }).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#ebebeb' }}>
      {/* Toolbar */}
      <div style={{
        background: '#f8f8f8', borderBottom: '1px solid #ccc',
        padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#64748b', fontSize: 16 }}>⚙️</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>הגדרות</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {/* Main settings box */}
        <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 5 }}>
            אפשרויות כלליות
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>תיקיית פלט ברירת מחדל</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                value={settings.outputDir}
                onChange={e => updateSettings({ outputDir: e.target.value })}
                placeholder="זהה לקובץ המקור"
                style={{ flex: 1, fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff' }}
              />
              <button
                onClick={async () => {
                  const dir = await window.electronAPI?.openFolder()
                  if (dir) updateSettings({ outputDir: dir })
                }}
                style={{
                  background: '#e0e0e0', color: '#555', border: '1px solid #bbb', borderRadius: 2,
                  padding: '3px 10px', fontSize: 11, cursor: 'pointer',
                }}
              >
                עיון
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>מקסימום המרות במקביל</div>
            <select
              value={settings.maxConcurrent}
              onChange={e => updateSettings({ maxConcurrent: parseInt(e.target.value) })}
              style={{ fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff', width: 80 }}
            >
              {[1, 2, 3, 4, 6, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>קבצים בו-זמנית</span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>אפשרויות</div>
          {[
            { key: 'showNotifications', label: 'הצג התראות שולחן עבודה עם סיום המרות', danger: false },
            { key: 'playSoundOnComplete', label: 'השמע צליל בסיום כל ההמרות', danger: false },
            { key: 'shutdownOnComplete', label: 'כבה מחשב כאשר כל ההמרות מסתיימות', danger: true },
            { key: 'deleteSourceAfter', label: 'מחק קובץ מקור לאחר המרה מוצלחת', danger: true },
          ].map(opt => (
            <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <input
                type="checkbox"
                id={opt.key}
                checked={!!settings[opt.key]}
                onChange={e => updateSettings({ [opt.key]: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor={opt.key} style={{
                fontSize: 11, cursor: 'pointer',
                color: opt.danger ? '#dc2626' : '#555',
              }}>
                {opt.danger && '⚠️ '}{opt.label}
              </label>
            </div>
          ))}
        </div>

        {/* GPU Acceleration */}
        <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 5 }}>
            ⚡ האצת חומרה (GPU) — ברירת מחדל להמרות וידאו
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={settings.defaultHwAccel || ''}
              onChange={e => updateSettings({ defaultHwAccel: e.target.value || null })}
              style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #bbb', borderRadius: 2, background: '#fff', minWidth: 180 }}
            >
              {HW_OPTIONS.map(o => {
                const avail = !o.value || availableHW.includes(o.value)
                return (
                  <option key={o.value} value={o.value} disabled={o.value && !avail}>
                    {o.label}{o.value && !avail ? ' (לא זמין)' : ''}
                  </option>
                )
              })}
            </select>
            <div style={{ fontSize: 10, color: '#666' }}>
              {availableHW.length === 0
                ? '🔍 לא זוהה GPU תואם במחשב זה'
                : `✅ זוהה: ${availableHW.map(h => h.toUpperCase()).join(', ')}`}
            </div>
          </div>
          {settings.defaultHwAccel && (
            <div style={{ fontSize: 10, color: '#0a7', marginTop: 6 }}>⚡ המרות וידאו ירוצו אוטומטית על ה-GPU — מהיר פי 5–20. אם יש שגיאה, יהיה fallback ל-CPU.</div>
          )}
        </div>

        {/* About */}
        <div style={{
          background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 2, padding: 12,
          borderRight: '3px solid #1d4ed8',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>אודות פורמט נקי v2.0</div>
          <div style={{ fontSize: 11, color: '#3730a3', lineHeight: 1.8 }}>
            נבנה ופותח על ידי <strong>yj05485</strong> ממתמחים טופ.<br />
            מבוסס FFmpeg — ממיר מדיה חינמי, 100% אופליין, ללא פרסומות.<br />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              לדף העדכונים:{' '}
              <a
                href="https://mitmachim.top/post/1262183"
                onClick={e => { e.preventDefault(); window.open('https://mitmachim.top/post/1262183') }}
                style={{ color: '#1d4ed8', fontWeight: 600 }}
              >
                mitmachim.top/post/1262183
              </a>
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
