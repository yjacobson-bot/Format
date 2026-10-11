import React from 'react'
import { useStore } from '../store/useStore'

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()

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
            { key: 'deleteSourceAfter', label: 'מחק קובץ מקור לאחר המרה מוצלחת', danger: true },
            { key: 'showNotifications', label: 'הצג התראות שולחן עבודה עם סיום המרות', danger: false },
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

        {/* About */}
        <div style={{
          background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 2, padding: 10,
          borderLeft: '3px solid #1d4ed8',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>אודות פורמט נקי</div>
          <div style={{ fontSize: 11, color: '#3730a3', lineHeight: 1.6 }}>
            ממיר מדיה קוד פתוח המופעל על ידי <strong>FFmpeg</strong>.<br />
            תומך בהמרת קבצי וידאו, אודיו ותמונות לעשרות פורמטים.<br />
            100% אופליין — ללא טלמטריה, ללא פרסומות, ללא העלאות לענן.
          </div>
        </div>
      </div>
    </div>
  )
}
