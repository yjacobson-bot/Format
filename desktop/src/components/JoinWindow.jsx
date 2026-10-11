import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

function fmtSize(b) {
  if (!b) return '—'
  if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB'
  return (b / 1e3).toFixed(0) + ' KB'
}
function fmtTime(s) {
  if (!s && s !== 0) return '—'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ─── Trim Preview Panel ───────────────────────────────────────────────────────
function TrimPreview({ file, isAudio, onTrimChange }) {
  const mediaRef = useRef(null)
  const timelineRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [trim, setTrim] = useState({ start: null, end: null })
  const dragRef = useRef(null)

  const dur = duration || 1
  const trimStart = trim.start ?? 0
  const trimEnd = trim.end ?? duration

  const fileUrl = file?.path ? `file:///${file.path.replace(/\\/g, '/')}` : null

  useEffect(() => {
    setTrim({ start: null, end: null })
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
  }, [file?.path])

  function seekTo(t) {
    if (mediaRef.current) mediaRef.current.currentTime = Math.max(0, Math.min(duration, t))
  }

  function startDrag(which, e) {
    e.preventDefault()
    dragRef.current = which
    const onMove = (ev) => {
      const rect = timelineRef.current?.getBoundingClientRect()
      if (!rect) return
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const t = ratio * dur
      setTrim(prev => {
        const s = prev.start ?? 0
        const en = prev.end ?? duration
        if (which === 'start') {
          const ns = Math.min(t, en - 0.1)
          seekTo(ns)
          const next = { start: Math.max(0, ns), end: en }
          onTrimChange?.(next)
          return next
        } else {
          const ne = Math.max(t, s + 0.1)
          seekTo(ne)
          const next = { start: s, end: Math.min(duration, ne) }
          onTrimChange?.(next)
          return next
        }
      })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleTimelineClick(e) {
    if (dragRef.current) return
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = (e.clientX - rect.left) / rect.width
    seekTo(ratio * dur)
  }

  function togglePlay() {
    if (!mediaRef.current) return
    if (playing) { mediaRef.current.pause(); setPlaying(false) }
    else { mediaRef.current.play(); setPlaying(true) }
  }

  function resetTrim() {
    const t = { start: null, end: null }
    setTrim(t)
    onTrimChange?.(t)
  }

  if (!fileUrl) return null

  const startPct = (trimStart / dur) * 100
  const endPct = (trimEnd / dur) * 100
  const playPct = (currentTime / dur) * 100

  return (
    <div style={{ border: '1px solid #b0bcd0', borderRadius: 4, background: '#f0f4fa', padding: 8 }}>
      {/* Header */}
      <div style={{ fontSize: 10, fontWeight: 700, color: '#1a3f6f', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>✂ תצוגה מקדימה וחיתוך:</span>
        <span style={{ fontWeight: 400, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{file?.name}</span>
      </div>

      {/* Media player */}
      {isAudio ? (
        <audio ref={mediaRef} src={fileUrl}
          style={{ width: '100%', height: 32 }}
          onLoadedMetadata={e => setDuration(e.target.duration)}
          onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <video ref={mediaRef} src={fileUrl}
          style={{ width: '100%', maxHeight: 130, background: '#000', borderRadius: 3, display: 'block' }}
          onLoadedMetadata={e => setDuration(e.target.duration)}
          onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
        <button onClick={togglePlay} style={{
          background: '#1565c0', color: '#fff', border: 'none', borderRadius: 3,
          width: 28, height: 22, cursor: 'pointer', fontSize: 11, flexShrink: 0,
        }}>
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{ fontSize: 10, color: '#555', minWidth: 80 }}>
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </span>
        {trim.start != null || trim.end != null ? (
          <span style={{ fontSize: 10, color: '#1565c0', fontWeight: 600 }}>
            ✂ {fmtTime(trimStart)} → {fmtTime(trimEnd)} ({fmtTime(trimEnd - trimStart)})
          </span>
        ) : (
          <span style={{ fontSize: 10, color: '#aaa' }}>גרור ידיות לחיתוך</span>
        )}
        <div style={{ flex: 1 }} />
        {(trim.start != null || trim.end != null) && (
          <button onClick={resetTrim} style={{
            fontSize: 9, padding: '1px 7px', cursor: 'pointer', background: '#f0f0f0',
            border: '1px solid #bbb', borderRadius: 2, color: '#666',
          }}>איפוס</button>
        )}
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 5, position: 'relative', userSelect: 'none' }}>
        <div ref={timelineRef}
          onClick={handleTimelineClick}
          style={{
            height: 24, background: 'linear-gradient(90deg,#c8d8e8,#d8e4f0)',
            borderRadius: 3, cursor: 'pointer', position: 'relative',
            border: '1px solid #a0b4c8', overflow: 'visible',
          }}
        >
          {/* Inactive regions */}
          <div style={{
            position: 'absolute', top: 0, height: '100%', left: 0,
            width: `${startPct}%`, background: 'rgba(0,0,0,0.25)', borderRadius: '3px 0 0 3px',
          }} />
          <div style={{
            position: 'absolute', top: 0, height: '100%', right: 0,
            width: `${100 - endPct}%`, background: 'rgba(0,0,0,0.25)', borderRadius: '0 3px 3px 0',
          }} />

          {/* Active selection */}
          <div style={{
            position: 'absolute', top: 0, height: '100%',
            left: `${startPct}%`, width: `${endPct - startPct}%`,
            background: 'rgba(21,101,192,0.3)',
            borderLeft: '2px solid #1565c0', borderRight: '2px solid #1565c0',
          }} />

          {/* Playhead */}
          <div style={{
            position: 'absolute', top: -2, height: 28, width: 2,
            background: '#e53', left: `${playPct}%`, pointerEvents: 'none', zIndex: 3,
            boxShadow: '0 0 3px rgba(220,50,50,0.6)',
          }} />

          {/* Start handle */}
          <div onMouseDown={e => startDrag('start', e)} style={{
            position: 'absolute', top: -3, width: 11, height: 30,
            left: `calc(${startPct}% - 5px)`,
            background: '#1565c0', borderRadius: 3, cursor: 'ew-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 2, height: 12, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
          </div>

          {/* End handle */}
          <div onMouseDown={e => startDrag('end', e)} style={{
            position: 'absolute', top: -3, width: 11, height: 30,
            left: `calc(${endPct}% - 5px)`,
            background: '#1565c0', borderRadius: 3, cursor: 'ew-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 2, height: 12, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
          </div>
        </div>

        {/* Time labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#889', marginTop: 2 }}>
          <span>0:00</span>
          <span>{fmtTime(dur / 4)}</span>
          <span>{fmtTime(dur / 2)}</span>
          <span>{fmtTime(dur * 3 / 4)}</span>
          <span>{fmtTime(dur)}</span>
        </div>
      </div>

      {/* Manual time inputs */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, fontSize: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#555', whiteSpace: 'nowrap' }}>התחלה:</span>
          <input type="number" min={0} max={trimEnd} step={0.1} value={trimStart.toFixed(1)}
            onChange={e => {
              const v = Math.max(0, Math.min(parseFloat(e.target.value) || 0, trimEnd - 0.1))
              const next = { start: v, end: trimEnd }
              setTrim(next); onTrimChange?.(next); seekTo(v)
            }}
            style={{ width: 55, fontSize: 10, padding: '1px 3px', border: '1px solid #bbb', borderRadius: 2 }}
          />
          <span style={{ color: '#aaa' }}>ש׳</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#555', whiteSpace: 'nowrap' }}>סיום:</span>
          <input type="number" min={trimStart} max={duration || 9999} step={0.1} value={trimEnd.toFixed(1)}
            onChange={e => {
              const v = Math.max(trimStart + 0.1, Math.min(parseFloat(e.target.value) || duration, duration))
              const next = { start: trimStart, end: v }
              setTrim(next); onTrimChange?.(next); seekTo(v)
            }}
            style={{ width: 55, fontSize: 10, padding: '1px 3px', border: '1px solid #bbb', borderRadius: 2 }}
          />
          <span style={{ color: '#aaa' }}>ש׳</span>
        </label>
      </div>
    </div>
  )
}

// ─── Main JoinWindow ──────────────────────────────────────────────────────────
export default function JoinWindow() {
  const { joinWindow, closeJoinWindow, updateJoinFiles, updateJoinSettings, addJoinTask } = useStore()
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [previewIdx, setPreviewIdx] = useState(null)
  const [fileTrimMap, setFileTrimMap] = useState({}) // path → {start, end}

  if (!joinWindow) return null
  const { files, settings, kind = 'video' } = joinWindow
  const isAudio = kind === 'audio'

  async function handleAddFiles() {
    const picked = await window.electronAPI?.openFiles({ multiple: true })
    if (picked?.length) updateJoinFiles([...files, ...picked])
  }

  async function handleDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, path: f.path, size: f.size }))
    updateJoinFiles([...files, ...dropped])
  }

  function onDragStart(e, idx) { setDraggingIdx(idx); e.dataTransfer.effectAllowed = 'move' }
  function onDragEnter(e, idx) { e.preventDefault(); setDragOverIdx(idx) }
  function onDragOver(e) { e.preventDefault() }
  function onDragEnd() {
    if (draggingIdx !== null && dragOverIdx !== null && draggingIdx !== dragOverIdx) {
      const reordered = [...files]
      const [moved] = reordered.splice(draggingIdx, 1)
      reordered.splice(dragOverIdx, 0, moved)
      updateJoinFiles(reordered)
    }
    setDraggingIdx(null); setDragOverIdx(null)
  }

  function handleOk() {
    if (files.length < 2) return
    const s = settings || {}
    // Attach per-file trim info into settings
    addJoinTask(files, s.ext || (isAudio ? 'mp3' : 'mp4'), {
      ...s,
      joinKind: kind,
      fileTrimMap,
    })
    closeJoinWindow()
  }

  const s = settings || {}
  const previewFile = previewIdx !== null ? files[previewIdx] : null

  const ACCENT = isAudio ? '#2e7d32' : '#1565c0'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      direction: 'rtl',
    }} onClick={e => { if (e.target === e.currentTarget) closeJoinWindow() }}>
      <div style={{
        background: '#f5f6fa', border: '1px solid #8090a8', borderRadius: 6,
        width: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Title bar */}
        <div style={{
          background: `linear-gradient(135deg, ${ACCENT}cc, ${ACCENT})`,
          color: '#fff', padding: '8px 14px', fontSize: 13, fontWeight: 800,
          borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{isAudio ? '🎵 מיזוג קטעי אודיו' : '🔗 מיזוג קטעי וידאו'}</span>
          <button onClick={closeJoinWindow} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            cursor: 'pointer', borderRadius: 3, padding: '2px 8px', fontSize: 15, fontWeight: 700,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={handleAddFiles} style={{
              fontSize: 11, padding: '4px 12px', cursor: 'pointer',
              background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)', border: '1px solid #a0a8bc',
              borderRadius: 3, fontWeight: 600,
            }}>📂 הוסף קובץ</button>
            <button onClick={() => { updateJoinFiles([]); setPreviewIdx(null); setFileTrimMap({}) }} style={{
              fontSize: 11, padding: '4px 12px', cursor: 'pointer',
              background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)', border: '1px solid #a0a8bc',
              borderRadius: 3,
            }}>🗑 נקה</button>
            <span style={{ fontSize: 10, color: '#888' }}>{files.length} קבצים — גרור לשינוי סדר</span>
            {previewIdx !== null && (
              <button onClick={() => setPreviewIdx(null)} style={{
                fontSize: 10, padding: '2px 8px', cursor: 'pointer', marginRight: 'auto',
                background: '#fff3e0', border: '1px solid #e65100', borderRadius: 3, color: '#e65100', fontWeight: 600,
              }}>סגור תצוגה מקדימה</button>
            )}
          </div>

          {/* File list */}
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            style={{ border: '1px solid #b0bcd0', borderRadius: 4, background: '#fff', minHeight: 90, maxHeight: 200, overflow: 'auto' }}
          >
            {files.length === 0 ? (
              <div style={{ height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aab', fontSize: 11, gap: 5 }}>
                <span style={{ fontSize: 28 }}>{isAudio ? '🎵' : '🎬'}</span>
                גרור קבצי {isAudio ? 'אודיו' : 'וידאו'} לכאן (לפחות 2)
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(180deg,#eef0f5,#e0e3ec)', borderBottom: '2px solid #b0bcd0' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, width: 30, color: '#445' }}>#</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#445' }}>שם קובץ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, width: 70, color: '#445' }}>גודל</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, width: 80, color: '#445' }}>חיתוך</th>
                    <th style={{ padding: '4px 4px', width: 24 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, i) => {
                    const hasTrim = fileTrimMap[f.path]?.start != null || fileTrimMap[f.path]?.end != null
                    return (
                      <tr key={i}
                        draggable
                        onDragStart={e => onDragStart(e, i)}
                        onDragEnter={e => onDragEnter(e, i)}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                        style={{
                          borderBottom: '1px solid #eef0f5',
                          background: previewIdx === i
                            ? '#e8f0fc'
                            : dragOverIdx === i
                              ? '#dce9f8'
                              : i % 2 === 0 ? '#fff' : '#f8f9fc',
                          cursor: 'grab',
                          opacity: draggingIdx === i ? 0.4 : 1,
                          borderTop: dragOverIdx === i ? `2px solid ${ACCENT}` : undefined,
                        }}
                      >
                        <td style={{ padding: '4px 8px', color: '#999', textAlign: 'center' }}>
                          <span style={{ fontSize: 13, userSelect: 'none' }}>⠿</span> {i + 1}
                        </td>
                        <td style={{ padding: '3px 8px', color: '#333', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span title={f.path}>{f.name}</span>
                        </td>
                        <td style={{ padding: '3px 8px', color: '#888' }}>{fmtSize(f.size)}</td>
                        <td style={{ padding: '3px 6px' }}>
                          <button
                            onClick={() => setPreviewIdx(previewIdx === i ? null : i)}
                            style={{
                              fontSize: 9, padding: '1px 6px', cursor: 'pointer', borderRadius: 3,
                              background: hasTrim ? '#e8f0fc' : '#f0f0f5',
                              border: `1px solid ${hasTrim ? ACCENT : '#c0c8d8'}`,
                              color: hasTrim ? ACCENT : '#666', fontWeight: hasTrim ? 700 : 400,
                            }}
                          >
                            {hasTrim ? '✂ פעיל' : '✂ חתוך'}
                          </button>
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <button onClick={() => {
                            updateJoinFiles(files.filter((_, j) => j !== i))
                            if (previewIdx === i) setPreviewIdx(null)
                          }} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 14, padding: 0,
                          }}
                            onMouseEnter={e => e.currentTarget.style.color = '#e53'}
                            onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
                          >✕</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Trim Preview */}
          {previewFile && (
            <TrimPreview
              key={previewFile.path}
              file={previewFile}
              isAudio={isAudio}
              onTrimChange={t => setFileTrimMap(prev => ({ ...prev, [previewFile.path]: t }))}
            />
          )}

          {/* Output settings */}
          <div style={{ border: '1px solid #b0bcd0', borderRadius: 4, background: '#fff', padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3f6f', marginBottom: 8, borderBottom: '1px solid #e0e4ee', paddingBottom: 4 }}>
              ⚙ הגדרות פלט
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <label style={{ fontSize: 10, color: '#555' }}>פורמט פלט</label>
                <select value={s.ext || (isAudio ? 'mp3' : 'mp4')} onChange={e => updateJoinSettings({ ...s, ext: e.target.value })}
                  style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 3, background: '#fff' }}>
                  {isAudio ? <>
                    <option value="mp3">MP3</option>
                    <option value="aac">AAC</option>
                    <option value="flac">FLAC</option>
                    <option value="wav">WAV</option>
                    <option value="m4a">M4A</option>
                  </> : <>
                    <option value="mp4">MP4</option>
                    <option value="mkv">MKV</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                  </>}
                </select>
              </div>
              {isAudio ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: 10, color: '#555' }}>קודק אודיו</label>
                  <select value={s.audioCodec || 'libmp3lame'} onChange={e => updateJoinSettings({ ...s, audioCodec: e.target.value })}
                    style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 3, background: '#fff' }}>
                    <option value="copy">העתק (מהיר)</option>
                    <option value="libmp3lame">MP3</option>
                    <option value="aac">AAC</option>
                    <option value="flac">FLAC</option>
                    <option value="pcm_s16le">WAV</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: 10, color: '#555' }}>קודק וידאו</label>
                  <select value={s.videoCodec || 'copy'} onChange={e => updateJoinSettings({ ...s, videoCodec: e.target.value })}
                    style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 3, background: '#fff' }}>
                    <option value="copy">העתק (מהיר)</option>
                    <option value="libx264">H.264</option>
                    <option value="libx265">H.265/HEVC</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <label style={{ fontSize: 10, color: '#555' }}>קצב סיביות אודיו</label>
                <select value={s.audioBitrate || '192k'} onChange={e => updateJoinSettings({ ...s, audioBitrate: e.target.value })}
                  style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 3, background: '#fff' }}>
                  <option value="copy">העתק</option>
                  <option value="128k">128k</option>
                  <option value="192k">192k</option>
                  <option value="256k">256k</option>
                  <option value="320k">320k</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info tip */}
          <div style={{ fontSize: 10, color: '#886633', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 3, padding: '5px 10px' }}>
            💡 הקבצים יחוברו בסדר הרשימה. לחץ ✂ חתוך על קובץ לחיתוך מדויק לפני המיזוג.
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          padding: '8px 14px', background: 'linear-gradient(180deg,#e0e3ec,#d0d4e0)',
          borderTop: '1px solid #b0bcd0', borderRadius: '0 0 6px 6px',
          display: 'flex', justifyContent: 'flex-start', gap: 8, alignItems: 'center',
        }}>
          <button onClick={handleOk} disabled={files.length < 2} style={{
            padding: '6px 28px', fontSize: 12, fontWeight: 800, cursor: files.length >= 2 ? 'pointer' : 'not-allowed',
            background: files.length >= 2
              ? `linear-gradient(180deg,${isAudio ? '#5cb85c' : '#1e7ec8'},${isAudio ? '#2e7d32' : '#0d47a1'})`
              : '#ccc',
            color: '#fff', border: '1px solid', borderColor: files.length >= 2 ? (isAudio ? '#1a5c22' : '#0a3080') : '#aaa',
            borderRadius: 4, boxShadow: files.length >= 2 ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
          }}>
            {isAudio ? '🎵' : '🔗'} מזג קבצים
          </button>
          <button onClick={closeJoinWindow} style={{
            padding: '6px 20px', fontSize: 12, cursor: 'pointer',
            background: 'linear-gradient(180deg,#f8f9fc,#e4e8f0)', border: '1px solid #a0a8bc', borderRadius: 4,
          }}>ביטול</button>
          {files.length < 2 && (
            <span style={{ fontSize: 10, color: '#e65100', fontWeight: 600 }}>⚠ נדרשים לפחות 2 קבצים</span>
          )}
          {Object.keys(fileTrimMap).filter(k => fileTrimMap[k]?.start != null || fileTrimMap[k]?.end != null).length > 0 && (
            <span style={{ fontSize: 10, color: ACCENT, fontWeight: 600 }}>
              ✂ {Object.keys(fileTrimMap).filter(k => fileTrimMap[k]?.start != null || fileTrimMap[k]?.end != null).length} קבצים עם חיתוך
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
