import React, { useState, useRef } from 'react'

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

const SEGMENT_COLORS = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2']

function fmtTime(sec) {
  const s = Math.max(0, parseInt(sec) || 0)
  return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}

function SegmentSlider({ seg, index, dur, onUpdate, onRemove, canRemove, playerRef }) {
  const timelineRef = useRef(null)
  const drag = useRef(null)
  const start = parseFloat(seg.start) || 0
  const end = parseFloat(seg.end) || 0
  const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length]

  function startDrag(which, e) {
    e.preventDefault()
    drag.current = which
    const onMove = (ev) => {
      const rect = timelineRef.current?.getBoundingClientRect()
      if (!rect) return
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const t = ratio * dur
      if (which === 'start') {
        const ns = Math.min(t, end - 0.5)
        onUpdate(index, 'start', Math.max(0, ns).toFixed(1))
        if (playerRef.current) playerRef.current.currentTime = Math.max(0, ns)
      } else {
        const ne = Math.max(t, start + 0.5)
        onUpdate(index, 'end', Math.min(dur, ne).toFixed(1))
        if (playerRef.current) playerRef.current.currentTime = Math.min(dur, ne)
      }
    }
    const onUp = () => { drag.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleClick(e) {
    if (drag.current) return
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * dur
    if (playerRef.current) playerRef.current.currentTime = t
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
        <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 20 }}>#{index+1}</span>
        <input type="number" min={0} max={dur} step={0.1} value={seg.start}
          onChange={e => onUpdate(index, 'start', e.target.value)}
          placeholder="התחלה" style={{ ...inputStyle, width: 70, flex: 'none' }} />
        <span style={{ fontSize: 10, color: '#888' }}>—</span>
        <input type="number" min={0} max={dur} step={0.1} value={seg.end}
          onChange={e => onUpdate(index, 'end', e.target.value)}
          placeholder="סוף" style={{ ...inputStyle, width: 70, flex: 'none' }} />
        {start !== '' && end !== '' && end > start && (
          <span style={{ fontSize: 9, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {fmtTime(start)} – {fmtTime(end)} ({fmtTime(end - start)})
          </span>
        )}
        {canRemove && (
          <button onClick={() => onRemove(index)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13, marginRight: 'auto' }}>✕</button>
        )}
      </div>
      {dur > 0 && (
        <div ref={timelineRef} onClick={handleClick}
          style={{ position: 'relative', height: 18, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer', userSelect: 'none' }}>
          <div style={{
            position: 'absolute', top: 0, height: '100%',
            left: `${(start / dur) * 100}%`,
            width: `${Math.max(0, (end - start) / dur) * 100}%`,
            background: color + '55', borderLeft: `2px solid ${color}`, borderRight: `2px solid ${color}`,
          }} />
          {/* start handle */}
          <div onMouseDown={e => startDrag('start', e)} style={{
            position: 'absolute', top: -2, width: 10, height: 22,
            left: `calc(${(start / dur) * 100}% - 5px)`,
            background: color, borderRadius: 2, cursor: 'ew-resize', zIndex: 2,
          }} />
          {/* end handle */}
          <div onMouseDown={e => startDrag('end', e)} style={{
            position: 'absolute', top: -2, width: 10, height: 22,
            left: `calc(${(end / dur) * 100}% - 5px)`,
            background: color, borderRadius: 2, cursor: 'ew-resize', zIndex: 2,
          }} />
        </div>
      )}
    </div>
  )
}

export function MultiTrimPanel({ onClose, filePath: extFile, duration: extDur }) {
  const [inputFile, setInputFile] = useState(extFile || '')
  const [duration, setDuration] = useState(extDur || 0)
  const [outputPath, setOutputPath] = useState('')
  const [segments, setSegments] = useState([{ start: '0', end: '' }])
  const [exportMode, setExportMode] = useState('single')
  const [status, setStatus] = useState('')
  const [isAudio, setIsAudio] = useState(false)
  const playerRef = useRef(null)

  const pickFile = async () => {
    const paths = await window.electronAPI?.openFiles({
      filters: [{ name: 'מדיה', extensions: ['mp4','avi','mkv','mov','mp3','wav','aac','m4a','flac'] }]
    })
    if (!paths?.[0]) return
    const f = paths[0]
    setInputFile(f)
    setStatus('')
    setIsAudio(/\.(mp3|wav|aac|m4a|flac|ogg)$/i.test(f))
    const probe = await window.electronAPI?.probeFile(f)
    if (probe?.success) {
      const d = parseFloat(probe.data?.format?.duration || 0)
      setDuration(d)
      setSegments([{ start: '0', end: d.toFixed(1) }])
    }
  }

  const addSegment = () => {
    const last = segments[segments.length - 1]
    const lastEnd = parseFloat(last?.end) || 0
    setSegments(s => [...s, { start: lastEnd.toFixed(1), end: Math.min(duration, lastEnd + 30).toFixed(1) }])
  }
  const removeSegment = (i) => setSegments(s => s.filter((_, j) => j !== i))
  const updateSegment = (i, field, val) => setSegments(s => s.map((seg, j) => j === i ? { ...seg, [field]: val } : seg))

  const handleRun = async () => {
    if (!inputFile) { alert('יש לבחור קובץ.'); return }
    if (!outputPath) { alert('יש לבחור נתיב פלט.'); return }
    const parsed = segments.map(s => ({ start: parseFloat(s.start) || 0, end: parseFloat(s.end) || 0 }))
    if (parsed.some(s => s.end <= s.start)) { alert('כל קטע חייב שהסוף יהיה אחרי ההתחלה.'); return }
    setStatus('מעבד...')
    const res = await window.electronAPI?.trimMultiple({ inputPath: inputFile, outputPath, segments: parsed, exportMode })
    setStatus(res?.success ? '✅ הושלם!' : `❌ ${res?.error}`)
  }

  const ext = inputFile ? inputFile.split('.').pop() : 'mp4'
  const fileUrl = inputFile ? `file:///${inputFile.replace(/\\/g, '/')}` : null

  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>✂️ חיתוך מרובה</span>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888' }}>✕</button>}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>
        בחר קטעים <strong>לשמור</strong> — גרור את הידיות על הציר או הזן שניות ידנית.
      </div>

      {/* File picker */}
      {!extFile && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input type="text" value={inputFile ? inputFile.split(/[\\/]/).pop() : ''} readOnly
            placeholder="בחר קובץ מדיה..." style={{ ...inputStyle, background: '#f5f5f5' }} />
          <button onClick={pickFile} style={browseStyle}>עיון</button>
        </div>
      )}

      {/* Player */}
      {fileUrl && (
        <div style={{ marginBottom: 8 }}>
          {isAudio
            ? <audio ref={playerRef} src={fileUrl} controls style={{ width: '100%' }} onLoadedMetadata={e => { if (!extDur) setDuration(e.target.duration) }} />
            : <video ref={playerRef} src={fileUrl} controls style={{ width: '100%', maxHeight: 140, background: '#000', borderRadius: 2 }} onLoadedMetadata={e => { if (!extDur) setDuration(e.target.duration) }} />
          }
        </div>
      )}

      {/* Segments */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 4 }}>קטעים לשמור:</div>
        {segments.map((seg, i) => (
          <SegmentSlider key={i} seg={seg} index={i} dur={duration} onUpdate={updateSegment} onRemove={removeSegment} canRemove={segments.length > 1} playerRef={playerRef} />
        ))}
        <button onClick={addSegment}
          style={{ fontSize: 10, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          + הוסף קטע
        </button>
      </div>

      {/* Output */}
      {!extFile && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input type="text" value={outputPath} onChange={e => setOutputPath(e.target.value)}
            placeholder="נתיב קובץ פלט..." style={inputStyle} />
          <button onClick={async () => {
            const p = await window.electronAPI?.saveFile({ filters: [{ name: 'Output', extensions: [ext] }] })
            if (p) setOutputPath(p)
          }} style={browseStyle}>עיון</button>
        </div>
      )}

      {/* Export mode */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[{ value: 'single', label: 'קובץ אחד מחובר' }, { value: 'multiple', label: 'קבצים נפרדים' }].map(opt => (
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
          כל קטע יישמר עם מספר לפני סיומת הקובץ (למשל output_1.mp3, output_2.mp3…)
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
