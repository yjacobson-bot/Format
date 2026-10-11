import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'

function fmtSize(b) {
  if (!b) return '—'
  if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB'
  return (b / 1e3).toFixed(0) + ' KB'
}

export default function JoinWindow() {
  const { joinWindow, closeJoinWindow, updateJoinFiles, updateJoinSettings, addJoinTask } = useStore()
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

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

  // Drag-to-reorder handlers
  function onDragStart(e, idx) {
    setDraggingIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragEnter(e, idx) {
    e.preventDefault()
    setDragOverIdx(idx)
  }
  function onDragOver(e) { e.preventDefault() }
  function onDragEnd() {
    if (draggingIdx !== null && dragOverIdx !== null && draggingIdx !== dragOverIdx) {
      const reordered = [...files]
      const [moved] = reordered.splice(draggingIdx, 1)
      reordered.splice(dragOverIdx, 0, moved)
      updateJoinFiles(reordered)
    }
    setDraggingIdx(null)
    setDragOverIdx(null)
  }

  function handleOk() {
    if (files.length < 2) return
    addJoinTask(files, settings.ext || (isAudio ? 'mp3' : 'mp4'), { ...settings, joinKind: kind })
    closeJoinWindow()
  }

  const s = settings || {}

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) closeJoinWindow() }}>
      <div style={{
        background: '#f5f5f5', border: '1px solid #888', borderRadius: 4,
        width: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        {/* Title */}
        <div style={{
          background: 'linear-gradient(180deg,#1a5fa8,#0d3d7a)',
          color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 700,
          borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{isAudio ? '🎵 מיזוג קטעי אודיו' : '🔗 מיזוג קטעי וידאו'}</span>
          <button onClick={closeJoinWindow} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 2, padding: '1px 7px', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={handleAddFiles} style={{ fontSize: 11, padding: '3px 10px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2 }}>
              📂 הוסף קובץ
            </button>
            <button onClick={() => updateJoinFiles([])} style={{ fontSize: 11, padding: '3px 10px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 2 }}>
              🗑 נקה
            </button>
            <span style={{ fontSize: 10, color: '#888' }}>{files.length} קבצים — גרור לשינוי סדר</span>
          </div>

          {/* File list with drag-to-reorder */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{ border: '1px solid #ccc', borderRadius: 2, background: '#fff', minHeight: 100, maxHeight: 280, overflow: 'auto' }}
          >
            {files.length === 0 ? (
              <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 11, gap: 4 }}>
                <span style={{ fontSize: 24 }}>{isAudio ? '🎵' : '🎬'}</span>
                גרור קבצי {isAudio ? 'אודיו' : 'וידאו'} לכאן (לפחות 2)
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#e8e8e8', borderBottom: '1px solid #ccc' }}>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 30 }}>#</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600 }}>שם קובץ</th>
                    <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: 70 }}>גודל</th>
                    <th style={{ padding: '3px 4px', width: 24 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, i) => (
                    <tr
                      key={i}
                      draggable
                      onDragStart={e => onDragStart(e, i)}
                      onDragEnter={e => onDragEnter(e, i)}
                      onDragOver={onDragOver}
                      onDragEnd={onDragEnd}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        background: dragOverIdx === i ? '#dce9f8' : i % 2 === 0 ? '#fff' : '#fafafa',
                        cursor: 'grab', opacity: draggingIdx === i ? 0.5 : 1,
                        borderTop: dragOverIdx === i ? '2px solid #0066cc' : undefined,
                      }}
                    >
                      <td style={{ padding: '4px 8px', color: '#999', textAlign: 'center' }}>
                        <span style={{ fontSize: 14, userSelect: 'none' }}>⠿</span> {i + 1}
                      </td>
                      <td style={{ padding: '3px 8px', color: '#333', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={f.path}>{f.name}</span>
                      </td>
                      <td style={{ padding: '3px 8px', color: '#888' }}>{fmtSize(f.size)}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                        <button onClick={() => updateJoinFiles(files.filter((_, j) => j !== i))} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0,
                        }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Output settings */}
          <div style={{ border: '1px solid #ccc', borderRadius: 2, background: '#fff', padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3f6f', marginBottom: 8, borderBottom: '1px solid #e0e0e0', paddingBottom: 4 }}>
              ⚙ הגדרות פלט
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 10, color: '#555' }}>פורמט פלט</label>
                <select value={s.ext || (isAudio ? 'mp3' : 'mp4')} onChange={e => updateJoinSettings({ ...s, ext: e.target.value })}
                  style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: 10, color: '#555' }}>קודק אודיו</label>
                  <select value={s.audioCodec || 'libmp3lame'} onChange={e => updateJoinSettings({ ...s, audioCodec: e.target.value })}
                    style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
                    <option value="copy">העתק (מהיר)</option>
                    <option value="libmp3lame">MP3</option>
                    <option value="aac">AAC</option>
                    <option value="flac">FLAC</option>
                    <option value="pcm_s16le">WAV</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: 10, color: '#555' }}>קודק וידאו</label>
                  <select value={s.videoCodec || 'libx264'} onChange={e => updateJoinSettings({ ...s, videoCodec: e.target.value })}
                    style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
                    <option value="copy">העתק (מהיר)</option>
                    <option value="libx264">H.264</option>
                    <option value="libx265">H.265/HEVC</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 10, color: '#555' }}>קצב סיביות אודיו</label>
                <select value={s.audioBitrate || '192k'} onChange={e => updateJoinSettings({ ...s, audioBitrate: e.target.value })}
                  style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #bbb', borderRadius: 2, background: '#fff' }}>
                  <option value="copy">העתק</option>
                  <option value="128k">128k</option>
                  <option value="192k">192k</option>
                  <option value="320k">320k</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#888', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2, padding: '5px 8px' }}>
            💡 הקבצים {isAudio ? 'האודיו' : 'הוידאו'} יחוברו בסדר שבו הם מופיעים ברשימה. גרור שורה לשינוי סדר.
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
            disabled={files.length < 2}
            style={{
              padding: '5px 24px', fontSize: 12, fontWeight: 700,
              cursor: files.length >= 2 ? 'pointer' : 'not-allowed',
              background: files.length >= 2 ? 'linear-gradient(180deg,#4caf78,#2e8b57)' : '#ccc',
              color: '#fff', border: '1px solid #1a6b3a', borderRadius: 3,
            }}>
            מזג קבצים
          </button>
          <button onClick={closeJoinWindow} style={{ padding: '5px 18px', fontSize: 12, cursor: 'pointer', background: '#f5f5f5', border: '1px solid #aaa', borderRadius: 3 }}>
            ביטול
          </button>
          {files.length < 2 && (
            <span style={{ fontSize: 10, color: '#e67e22' }}>נדרשים לפחות 2 קבצים</span>
          )}
        </div>
      </div>
    </div>
  )
}
