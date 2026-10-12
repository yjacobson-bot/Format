import React, { useState } from 'react'

const btnStyle = (color) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 2,
  padding: '3px 10px', fontSize: 11, cursor: 'pointer',
})
const inputStyle = { flex: 1, fontSize: 11, border: '1px solid #bbb', borderRadius: 2, padding: '3px 6px', background: '#fff' }
const browseStyle = { background: '#e0e0e0', color: '#555', border: '1px solid #bbb', borderRadius: 2, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }

function MergePanel({ onClose }) {
  const [files, setFiles] = useState([])
  const [outputPath, setOutputPath] = useState('')
  const [status, setStatus] = useState('')

  const addFiles = async () => {
    const paths = await window.electronAPI?.openFiles({
      filters: [{ name: 'Video', extensions: ['mp4', 'avi', 'mkv', 'mov'] }]
    })
    if (paths) setFiles(prev => [...prev, ...paths])
  }

  const handleMerge = async () => {
    if (files.length < 2) { alert('יש להוסיף לפחות 2 קבצים.'); return }
    if (!outputPath) { alert('יש לבחור נתיב פלט.'); return }
    setStatus('ממזג...')
    const res = await window.electronAPI?.mergeVideos({ inputPaths: files, outputPath })
    setStatus(res?.success ? '✅ המיזוג הושלם!' : `❌ שגיאה: ${res?.error}`)
  }

  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>🔗 מיזוג וידאו</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888' }}>✕</button>
      </div>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>
        חבר מספר קבצי וידאו לקובץ אחד. כל הקבצים חייבים להיות באותו קודק ורזולוציה.
      </div>
      <div style={{ border: '1px dashed #bbb', borderRadius: 2, padding: 6, marginBottom: 8, minHeight: 40 }}>
        {files.map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#555', padding: '2px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.split(/[\\/]/).pop()}</span>
            <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 11, flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button onClick={addFiles} style={{ fontSize: 10, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0' }}>+ הוסף קבצים</button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={outputPath} onChange={e => setOutputPath(e.target.value)} placeholder="נתיב קובץ פלט..." style={inputStyle} />
        <button onClick={async () => {
          const p = await window.electronAPI?.saveFile({ filters: [{ name: 'MP4', extensions: ['mp4'] }] })
          if (p) setOutputPath(p)
        }} style={browseStyle}>עיון</button>
      </div>
      <button onClick={handleMerge} style={btnStyle('#2563eb')}>מזג וידאו</button>
      {status && <div style={{ fontSize: 11, marginTop: 6, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{status}</div>}
    </div>
  )
}

function SplitPanel({ onClose }) {
  const [inputFile, setInputFile] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [duration, setDuration] = useState('60')
  const [status, setStatus] = useState('')

  const handleSplit = async () => {
    if (!inputFile) { alert('יש לבחור קובץ.'); return }
    if (!outputDir) { alert('יש לבחור תיקיית פלט.'); return }
    setStatus('מפצל...')
    const res = await window.electronAPI?.splitVideo({
      inputPath: inputFile,
      outputDir,
      segmentDuration: parseFloat(duration) || 60,
    })
    setStatus(res?.success ? '✅ הפיצול הושלם!' : `❌ ${res?.error}`)
  }

  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>✂️ פיצול וידאו</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={inputFile} readOnly placeholder="בחר קובץ וידאו..." style={{ ...inputStyle, background: '#f5f5f5' }} />
        <button onClick={async () => {
          const paths = await window.electronAPI?.openFiles({ filters: [{ name: 'Video', extensions: ['mp4','avi','mkv','mov'] }] })
          if (paths?.[0]) setInputFile(paths[0])
        }} style={browseStyle}>עיון</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 3 }}>משך פלח (שניות)</div>
        <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
          style={{ ...inputStyle, flex: 'none', width: 80 }} />
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={outputDir} readOnly placeholder="תיקיית פלט..." style={{ ...inputStyle, background: '#f5f5f5' }} />
        <button onClick={async () => {
          const dir = await window.electronAPI?.openFolder()
          if (dir) setOutputDir(dir)
        }} style={browseStyle}>עיון</button>
      </div>
      <button onClick={handleSplit} style={btnStyle('#2563eb')}>פצל וידאו</button>
      {status && <div style={{ fontSize: 11, marginTop: 6, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{status}</div>}
    </div>
  )
}

function MultiTrimPanel({ onClose }) {
  const [inputFile, setInputFile] = useState('')
  const [duration, setDuration] = useState(0)
  const [outputPath, setOutputPath] = useState('')
  const [segments, setSegments] = useState([{ start: '', end: '' }])
  const [exportMode, setExportMode] = useState('single') // 'single' | 'multiple'
  const [status, setStatus] = useState('')

  const pickFile = async () => {
    const paths = await window.electronAPI?.openFiles({
      filters: [{ name: 'מדיה', extensions: ['mp4','avi','mkv','mov','mp3','wav','aac','m4a','flac'] }]
    })
    if (!paths?.[0]) return
    setInputFile(paths[0])
    setStatus('')
    const probe = await window.electronAPI?.probeFile(paths[0])
    if (probe?.success) setDuration(Math.floor(probe.data?.format?.duration || 0))
  }

  const addSegment = () => setSegments(s => [...s, { start: '', end: '' }])
  const removeSegment = (i) => setSegments(s => s.filter((_, j) => j !== i))
  const updateSegment = (i, field, val) => setSegments(s => s.map((seg, j) => j === i ? { ...seg, [field]: val } : seg))

  const fmtTime = (sec) => {
    const s = parseInt(sec) || 0
    return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  }

  const handleRun = async () => {
    if (!inputFile) { alert('יש לבחור קובץ.'); return }
    if (!outputPath) { alert('יש לבחור נתיב פלט.'); return }
    const parsed = segments.map(s => ({ start: parseFloat(s.start) || 0, end: parseFloat(s.end) || 0 }))
    if (parsed.some(s => s.end <= s.start)) { alert('כל קטע חייב שהסוף יהיה אחרי ההתחלה.'); return }
    setStatus('מעבד...')
    const res = await window.electronAPI?.trimMultiple({
      inputPath: inputFile,
      outputPath,
      segments: parsed,
      exportMode,
    })
    setStatus(res?.success ? '✅ הושלם!' : `❌ ${res?.error}`)
  }

  const ext = inputFile ? inputFile.split('.').pop() : 'mp4'

  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>✂️ חיתוך מרובה</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888' }}>✕</button>
      </div>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>
        בחר קטעים <strong>לשמור</strong> מתוך הקובץ — הם יחוברו לקובץ פלט אחד לפי הסדר.
      </div>

      {/* File picker */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={inputFile ? inputFile.split(/[\\/]/).pop() : ''} readOnly
          placeholder="בחר קובץ מדיה..." style={{ ...inputStyle, background: '#f5f5f5' }} />
        <button onClick={pickFile} style={browseStyle}>עיון</button>
      </div>
      {duration > 0 && (
        <div style={{ fontSize: 10, color: '#555', marginBottom: 8 }}>
          משך: <strong>{fmtTime(duration)}</strong> ({duration} שניות)
        </div>
      )}

      {/* Segments */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 4 }}>קטעים לשמור:</div>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: '#888', minWidth: 16 }}>#{i+1}</span>
            <input type="number" min={0} max={duration || 99999} step={0.1}
              value={seg.start} onChange={e => updateSegment(i, 'start', e.target.value)}
              placeholder="התחלה (שנ׳)" style={{ ...inputStyle, width: 90, flex: 'none' }} />
            <span style={{ fontSize: 10, color: '#888' }}>—</span>
            <input type="number" min={0} max={duration || 99999} step={0.1}
              value={seg.end} onChange={e => updateSegment(i, 'end', e.target.value)}
              placeholder="סוף (שנ׳)" style={{ ...inputStyle, width: 90, flex: 'none' }} />
            {duration > 0 && seg.start !== '' && seg.end !== '' && (
              <span style={{ fontSize: 9, color: '#6b7280', whiteSpace: 'nowrap' }}>
                {fmtTime(seg.start)} – {fmtTime(seg.end)}
              </span>
            )}
            {segments.length > 1 && (
              <button onClick={() => removeSegment(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13, lineHeight: 1 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addSegment}
          style={{ fontSize: 10, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          + הוסף קטע
        </button>
      </div>

      {/* Output */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={outputPath} onChange={e => setOutputPath(e.target.value)}
          placeholder="נתיב קובץ פלט..." style={inputStyle} />
        <button onClick={async () => {
          const p = await window.electronAPI?.saveFile({ filters: [{ name: 'Output', extensions: [ext] }] })
          if (p) setOutputPath(p)
        }} style={browseStyle}>עיון</button>
      </div>

      {/* Export mode toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[
          { value: 'single',   label: 'קובץ אחד מחובר' },
          { value: 'multiple', label: 'קבצים נפרדים' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setExportMode(opt.value)} style={{
            flex: 1, padding: '5px 6px', border: '1px solid',
            borderColor: exportMode === opt.value ? '#2563eb' : '#d1d5db',
            borderRadius: 4, background: exportMode === opt.value ? '#eff6ff' : '#fff',
            cursor: 'pointer', fontSize: 10, fontWeight: exportMode === opt.value ? 700 : 400,
            color: exportMode === opt.value ? '#1d4ed8' : '#374151',
          }}>{opt.label}</button>
        ))}
      </div>
      {exportMode === 'multiple' && (
        <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 6 }}>
          כל קטע יישמר עם מספר לפני סיומת הקובץ (למשל output_1.mp4, output_2.mp4…)
        </div>
      )}

      <button onClick={handleRun} style={btnStyle('#2563eb')}>בצע חיתוך</button>
      {status && <div style={{ fontSize: 11, marginTop: 6, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{status}</div>}
    </div>
  )
}

function WatermarkPanel({ onClose }) {
  const [videoPath, setVideoPath] = useState('')
  const [wmPath, setWmPath] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [position, setPosition] = useState('topleft')
  const [status, setStatus] = useState('')

  const handleApply = async () => {
    if (!videoPath || !wmPath || !outputPath) { alert('יש למלא את כל השדות.'); return }
    setStatus('מעבד...')
    const res = await window.electronAPI?.addWatermark({ videoPath, watermarkPath: wmPath, outputPath, position })
    setStatus(res?.success ? '✅ הושלם!' : `❌ ${res?.error}`)
  }

  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>💧 הוסף סימן מים</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888' }}>✕</button>
      </div>
      {[
        { label: 'Input Video', value: videoPath, set: setVideoPath, ext: ['mp4','avi','mkv','mov'] },
        { label: 'Watermark Image (PNG)', value: wmPath, set: setWmPath, ext: ['png','jpg'] },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input type="text" value={f.value} readOnly placeholder={f.label + '...'} style={{ ...inputStyle, background: '#f5f5f5' }} />
          <button onClick={async () => {
            const paths = await window.electronAPI?.openFiles({ filters: [{ name: f.label, extensions: f.ext }] })
            if (paths?.[0]) f.set(paths[0])
          }} style={browseStyle}>Browse</button>
        </div>
      ))}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 3 }}>מיקום</div>
        <select value={position} onChange={e => setPosition(e.target.value)} style={{ ...inputStyle, flex: 'none', width: '100%' }}>
          {['topleft','topright','bottomleft','bottomright','center'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" value={outputPath} readOnly placeholder="קובץ פלט..." style={{ ...inputStyle, background: '#f5f5f5' }} />
        <button onClick={async () => {
          const p = await window.electronAPI?.saveFile({ filters: [{ name: 'MP4', extensions: ['mp4'] }] })
          if (p) setOutputPath(p)
        }} style={browseStyle}>עיון</button>
      </div>
      <button onClick={handleApply} style={btnStyle('#2563eb')}>הוסף סימן מים</button>
      {status && <div style={{ fontSize: 11, marginTop: 6, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{status}</div>}
    </div>
  )
}

const TOOLS = [
  { id: 'merge',     icon: '🔗', title: 'מיזוג וידאו',    desc: 'חבר מספר קבצי וידאו לקובץ אחד' },
  { id: 'split',     icon: '✂️', title: 'פיצול וידאו',    desc: 'פצל וידאו ארוך לפלחים קצרים לפי משך' },
  { id: 'multitrim', icon: '🎯', title: 'חיתוך מרובה',    desc: 'בחר כמה קטעים מקובץ אחד — קובץ אחד או קבצים נפרדים' },
  { id: 'watermark', icon: '💧', title: 'הוסף סימן מים',  desc: 'שכב תמונת סימן מים על קובץ וידאו' },
]

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#ebebeb' }}>
      {/* Toolbar */}
      <div style={{
        background: '#f8f8f8', borderBottom: '1px solid #ccc',
        padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#64748b', fontSize: 16 }}>🔧</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>כלים</span>
        {activeTool && (
          <button onClick={() => setActiveTool(null)} style={{
            marginLeft: 8, background: '#e0e0e0', color: '#555', border: '1px solid #bbb', borderRadius: 2,
            padding: '2px 8px', fontSize: 11, cursor: 'pointer',
          }}>← חזרה</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {!activeTool && (
          <>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8, fontWeight: 600 }}>
              כלי עריכה ועיבוד וידאו:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => setActiveTool(t.id)} style={{
                  width: 140, height: 90, background: '#fff', border: '1px solid #ccc',
                  borderTop: '3px solid #64748b', borderRadius: 2, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: 8, textAlign: 'center',
                }}>
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{t.title}</span>
                  <span style={{ fontSize: 9, color: '#999', lineHeight: 1.3 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTool === 'merge'     && <MergePanel     onClose={() => setActiveTool(null)} />}
        {activeTool === 'split'     && <SplitPanel     onClose={() => setActiveTool(null)} />}
        {activeTool === 'multitrim' && <MultiTrimPanel onClose={() => setActiveTool(null)} />}
        {activeTool === 'watermark' && <WatermarkPanel onClose={() => setActiveTool(null)} />}
      </div>
    </div>
  )
}
