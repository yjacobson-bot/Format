import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function DVDPage() {
  const { addTasks, settings } = useStore()
  const [isoPath, setIsoPath] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [outputFormat, setOutputFormat] = useState('mp4')
  const [status, setStatus] = useState('')

  const handleBrowseISO = async () => {
    const files = await window.electronAPI?.openFiles({
      filters: [{ name: 'ISO / Video Files', extensions: ['iso', 'vob', 'img'] }],
    })
    if (files?.length) setIsoPath(files[0])
  }

  const handleAddToQueue = () => {
    if (!isoPath) { alert('Please select an ISO or VOB file first.'); return }
    const fmt = { id: outputFormat, label: outputFormat.toUpperCase(), ext: outputFormat, icon: '📀', ffmpegArgs: [] }
    addTasks(
      [{ path: isoPath, name: isoPath.split(/[\\/]/).pop(), size: 0 }],
      fmt,
      { outputDir: outputDir || settings.outputDir }
    )
    setStatus('נוסף לתור!')
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#ebebeb' }}>
      {/* Toolbar */}
      <div style={{
        background: '#f8f8f8', borderBottom: '1px solid #ccc',
        padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#7c3aed', fontSize: 16 }}>📀</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>ממיר DVD / ISO</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {/* Info banner */}
        <div style={{
          background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 2,
          padding: '8px 10px', marginBottom: 10, borderLeft: '3px solid #7c3aed',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6d28d9', marginBottom: 2 }}>ממיר DVD / ISO</div>
          <div style={{ fontSize: 11, color: '#7c3aed' }}>
            המר תמונות ISO של DVD וקבצי VOB לפורמטי וידאו.
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10, marginBottom: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>קובץ מקור (ISO / VOB)</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text" value={isoPath} readOnly
                placeholder="בחר קובץ ISO או VOB..."
                style={{ flex: 1, fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff' }}
              />
              <button onClick={handleBrowseISO} style={{
                background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 2,
                padding: '3px 10px', fontSize: 11, cursor: 'pointer',
              }}>עיון</button>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>פורמט פלט</div>
            <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} style={{
              fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff', width: '100%',
            }}>
              <option value="mp4">MP4 (H.264)</option>
              <option value="mkv">MKV (H.264)</option>
              <option value="avi">AVI</option>
              <option value="mov">MOV</option>
              <option value="wmv">WMV</option>
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>תיקיית פלט</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text" value={outputDir} onChange={e => setOutputDir(e.target.value)}
                placeholder="זהה לקובץ המקור"
                style={{ flex: 1, fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff' }}
              />
              <button onClick={async () => {
                const dir = await window.electronAPI?.openFolder()
                if (dir) setOutputDir(dir)
              }} style={{
                background: '#e0e0e0', color: '#555', border: '1px solid #bbb', borderRadius: 2,
                padding: '3px 10px', fontSize: 11, cursor: 'pointer',
              }}>עיון</button>
            </div>
          </div>

          <button onClick={handleAddToQueue} style={{
            width: '100%', padding: '6px', background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
            color: '#fff', border: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            ➕ הוסף לתור ההמרות
          </button>

          {status && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: 600 }}>{status}</div>
          )}
        </div>

        {/* Notes */}
        <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: '8px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 4 }}>📋 הערות</div>
          <ul style={{ fontSize: 10, color: '#888', paddingLeft: 14, margin: 0 }}>
            <li style={{ marginBottom: 2 }}>עבור DVD מסחריים מוצפנים, ייתכן שתצטרך להתקין libdvdcss בנפרד</li>
            <li style={{ marginBottom: 2 }}>ניתן להוסיף קבצי VOB ישירות מתיקיית VIDEO_TS של DVD</li>
            <li>קבצי ISO גדולים עשויים לקחת מספר דקות להמרה</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
