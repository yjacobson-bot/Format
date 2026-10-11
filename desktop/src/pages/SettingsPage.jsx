import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

// Minimal inline SVG icons
function Icon({ d, size = 15, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  folder:   'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  cpu:      'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.18-1a8.003 8.003 0 0 0 0-2l2.11-1.64c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.87 7.87 0 0 0-1.73-1l-.37-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42L9.14 5.07a7.87 7.87 0 0 0-1.73 1L4.92 5.07a.5.5 0 0 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.54 11a8.003 8.003 0 0 0 0 2L2.43 14.64c-.19.15-.24.42-.12.64l2 3.46c.13.22.39.3.61.22l2.49-1a7.87 7.87 0 0 0 1.73 1l.37 2.65c.05.27.29.47.56.47h4c.27 0 .51-.2.56-.47l.37-2.65a7.87 7.87 0 0 0 1.73-1l2.49 1c.22.08.48 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L20.18 14z',
  bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  trash:    'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3-3h8a1 1 0 0 1 1 1v1H5V4a1 1 0 0 1 1-1z',
  power:    'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10',
  check:    'M20 6L9 17l-5-5',
  info:     'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-7v-4m0-4h.01',
  sliders:  'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
}

const HW_CARDS = [
  { value: '',      label: 'CPU בלבד',       sub: 'ברירת מחדל, תואם לכל מחשב', color: '#64748b' },
  { value: 'nvenc', label: 'NVIDIA NVENC',   sub: 'כרטיסי GeForce / Quadro',     color: '#76b900' },
  { value: 'qsv',   label: 'Intel QuickSync', sub: 'מעבדי Intel Core עם גרפיקה', color: '#0071c5' },
  { value: 'amf',   label: 'AMD AMF',        sub: 'כרטיסי Radeon RX / Vega',     color: '#ed1c24' },
]

function SectionHeader({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
      <Icon d={icon} size={14} color="#475569" />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '14px 16px', marginBottom: 10, ...style }}>
      {children}
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [availableHW, setAvailableHW] = useState([])
  const cpuCount = navigator.hardwareConcurrency || 4

  useEffect(() => {
    window.electronAPI?.detectHardwareEncoders?.().then(hw => {
      const list = hw || []
      setAvailableHW(list)
      if (list.length > 0 && !settings.defaultHwAccel) {
        const best = ['nvenc', 'amf', 'qsv'].find(p => list.includes(p))
        if (best) updateSettings({ defaultHwAccel: best })
      }
    }).catch(() => {})
  }, [])

  const threadMode = settings.threadMode || 'optimal'
  const threadCount = settings.threadCount || Math.max(1, Math.floor(cpuCount / 2))

  const threadPreviewLabel = {
    max:        `${cpuCount} שרשורים (כל הליבות)`,
    optimal:    `~${Math.max(1, Math.floor(cpuCount / (settings.maxConcurrent || 2)))} שרשורים לכל המרה`,
    manual:     `${threadCount} שרשורים (בחירה ידנית)`,
    background: `${Math.max(1, Math.floor(cpuCount / 2))} שרשורים + עדיפות נמוכה — שאר התוכנות לא יתקעו`,
  }[threadMode] || ''

  const SEL = { fontSize: 11, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg,#f1f5f9,#e8edf5)',
        borderBottom: '1px solid #cbd5e1',
        padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon d={ICONS.settings} size={14} color="#475569" />
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>הגדרות</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>

        {/* ── General ── */}
        <Card>
          <SectionHeader icon={ICONS.folder} label="כללי" />

          {/* Output dir */}
          <Row label="תיקיית פלט ברירת מחדל" hint="ריק = זהה לתיקיית הקובץ המקורי">
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                value={settings.outputDir}
                onChange={e => updateSettings({ outputDir: e.target.value })}
                placeholder="זהה לקובץ המקור"
                style={{ ...SEL, width: 170 }}
              />
              <button
                onClick={async () => {
                  const dir = await window.electronAPI?.openFolder()
                  if (dir) updateSettings({ outputDir: dir })
                }}
                style={{ ...SEL, padding: '4px 10px', background: '#f1f5f9', fontWeight: 600 }}
              >
                עיון
              </button>
            </div>
          </Row>

          {/* Concurrent */}
          <Row label="המרות במקביל" hint="מספר קבצים שיעובדו בו-זמנית">
            <select value={settings.maxConcurrent} onChange={e => updateSettings({ maxConcurrent: parseInt(e.target.value) })} style={SEL}>
              {[1, 2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} קבצים</option>)}
            </select>
          </Row>

          {/* Checkboxes */}
          <div style={{ marginTop: 4 }}>
            {[
              { key: 'showNotifications',  label: 'הצג התראות שולחן עבודה עם סיום',   icon: ICONS.bell,  danger: false },
              { key: 'playSoundOnComplete', label: 'השמע צליל בסיום כל ההמרות',         icon: ICONS.bell,  danger: false },
              { key: 'shutdownOnComplete',  label: 'כבה מחשב לאחר השלמת כל ההמרות',   icon: ICONS.power, danger: true  },
              { key: 'deleteSourceAfter',   label: 'מחק קובץ מקור לאחר המרה מוצלחת',  icon: ICONS.trash, danger: true  },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!settings[opt.key]}
                  onChange={e => updateSettings({ [opt.key]: e.target.checked })}
                  style={{ cursor: 'pointer', accentColor: opt.danger ? '#dc2626' : '#2563eb' }}
                />
                <Icon d={opt.icon} size={13} color={opt.danger ? '#dc2626' : '#64748b'} />
                <span style={{ fontSize: 11, color: opt.danger ? '#dc2626' : '#374151' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* ── CPU Threads ── */}
        <Card>
          <SectionHeader icon={ICONS.cpu} label="ליבות מעבד (CPU Threads)" />
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 12 }}>
            מחשב זה: <strong>{cpuCount} ליבות</strong> זמינות לFFmpeg
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { value: 'optimal',    label: 'אופטימלי',  sub: 'מאזן בין מהירות לזמינות' },
              { value: 'max',        label: 'מקסימלי',   sub: 'כל הליבות לכל המרה' },
              { value: 'manual',     label: 'ידני',      sub: 'בחירת מספר ספציפי' },
              { value: 'background', label: 'רקע',       sub: 'מחשב נשאר רספונסיבי' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ threadMode: opt.value })}
                style={{
                  flex: '1 1 calc(50% - 6px)', minWidth: 90, padding: '8px 6px', border: '1px solid',
                  borderColor: threadMode === opt.value ? (opt.value === 'background' ? '#16a34a' : '#2563eb') : '#d1d5db',
                  borderRadius: 5, background: threadMode === opt.value ? (opt.value === 'background' ? '#f0fdf4' : '#eff6ff') : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: threadMode === opt.value ? (opt.value === 'background' ? '#15803d' : '#1d4ed8') : '#374151' }}>{opt.label}</div>
                <div style={{ fontSize: 9, color: threadMode === opt.value ? (opt.value === 'background' ? '#16a34a' : '#3b82f6') : '#9ca3af', marginTop: 2 }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          {threadMode === 'manual' && (
            <Row label={`מספר שרשורים: ${threadCount}`} hint="ערך גבוה = מהיר יותר, אך מחשב יאט">
              <input
                type="range"
                min={1} max={cpuCount}
                value={threadCount}
                onChange={e => updateSettings({ threadCount: parseInt(e.target.value) })}
                style={{ width: 120 }}
              />
            </Row>
          )}

          <div style={{
            background: threadMode === 'background' ? '#f0fdf4' : '#f0f9ff',
            border: `1px solid ${threadMode === 'background' ? '#bbf7d0' : '#bae6fd'}`,
            borderRadius: 4, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon d={ICONS.info} size={12} color={threadMode === 'background' ? '#16a34a' : '#0284c7'} />
            <span style={{ fontSize: 10, color: threadMode === 'background' ? '#15803d' : '#0369a1' }}>{threadPreviewLabel}</span>
          </div>
        </Card>

        {/* ── GPU Acceleration ── */}
        <Card>
          <SectionHeader icon={ICONS.zap} label="האצת חומרה — GPU" />

          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 10 }}>
            {availableHW.length === 0
              ? 'לא זוהה GPU תואם. ניתן לבחור ידנית — אם יהיה שגיאה, המרה תפול ל-CPU אוטומטית.'
              : <>זוהה: {availableHW.map(h => <strong key={h} style={{ marginRight: 4 }}>{h.toUpperCase()}</strong>)}</>}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {HW_CARDS.map(card => {
              const avail = !card.value || availableHW.includes(card.value)
              const active = (settings.defaultHwAccel || '') === card.value
              return (
                <button
                  key={card.value}
                  onClick={() => updateSettings({ defaultHwAccel: card.value || null })}
                  style={{
                    flex: '1 1 calc(50% - 6px)', minWidth: 120, padding: '9px 10px',
                    border: '1.5px solid', borderRadius: 6, cursor: 'pointer', textAlign: 'right',
                    borderColor: active ? card.color : '#e2e8f0',
                    background: active ? `${card.color}12` : '#fafafa',
                    opacity: avail ? 1 : 0.45,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {active && <Icon d={ICONS.check} size={12} color={card.color} strokeWidth={2.5} />}
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? card.color : '#374151' }}>{card.label}</span>
                    {!avail && <span style={{ fontSize: 9, color: '#9ca3af', marginRight: 'auto' }}>לא זמין</span>}
                  </div>
                  <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{card.sub}</div>
                </button>
              )
            })}
          </div>

          {settings.defaultHwAccel && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '6px 10px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.zap} size={12} color="#16a34a" />
              <span style={{ fontSize: 10, color: '#15803d' }}>המרות וידאו יפעלו על ה-GPU — מהיר פי 5–20× לעומת CPU. אם יהיה כשל, תהיה נסיגה אוטומטית ל-CPU.</span>
            </div>
          )}
        </Card>

        {/* ── About ── */}
        <Card style={{ background: '#f0f4ff', borderColor: '#c7d2fe', borderRight: '3px solid #3b82f6', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>פורמט נקי v2.0</div>
          <div style={{ fontSize: 11, color: '#3730a3', lineHeight: 1.8 }}>
            נבנה ופותח על ידי <strong>yj05485</strong> ממתמחים טופ.<br />
            מבוסס FFmpeg — ממיר מדיה חינמי, 100% אופליין, ללא פרסומות.<br />
            <a
              href="https://mitmachim.top/post/1262183"
              onClick={e => { e.preventDefault(); window.open('https://mitmachim.top/post/1262183') }}
              style={{ color: '#1d4ed8', fontWeight: 600 }}
            >
              mitmachim.top/post/1262183
            </a>
          </div>
        </Card>

      </div>
    </div>
  )
}
