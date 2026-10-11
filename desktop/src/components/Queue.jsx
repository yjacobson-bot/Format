import React from 'react'
import { useStore } from '../store/useStore'

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes > 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}

function formatRemaining(sec) {
  if (sec == null || sec <= 0) return null
  if (sec < 60) return `${sec}ש׳`
  const m = Math.floor(sec / 60), s = sec % 60
  if (m < 60) return `${m}:${String(s).padStart(2, '0')}`
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const STATUS_CFG = {
  pending: { label: 'ממתין',   color: '#555',    bg: '#f0f0f2', border: '#c0c0cc' },
  running: { label: 'ממיר...',  color: '#1565c0', bg: '#dbeafe', border: '#93c5fd' },
  done:    { label: '✓ הושלם', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  error:   { label: '✕ שגיאה', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
}

export default function Queue({ onStart }) {
  const { tasks, removeTask, clearCompleted, clearAll, openSetupWindow, settings } = useStore()
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    done:    tasks.filter(t => t.status === 'done').length,
    error:   tasks.filter(t => t.status === 'error').length,
  }

  function reEditTask(task) {
    if (task.status === 'running') return
    openSetupWindow(task.outputFormat, task.category || 'video', [
      { name: task.fileName, path: task.inputPath, size: task.fileSize }
    ])
  }

  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', borderTop: '2px solid #9aa0b0' }}>
      {/* Queue header */}
      <div style={{
        background: 'linear-gradient(180deg,#dde0ea,#c8ccd8)',
        borderBottom: '1px solid #aaa8bc',
        padding: '4px 10px',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#2a3050' }}>📋 תור המרות</span>

        {/* Stat badges */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['pending','running','done','error'].map(s => {
            const n = stats[s]; if (!n) return null
            const c = STATUS_CFG[s]
            return (
              <span key={s} style={{
                fontSize: 10, padding: '1px 7px', borderRadius: 8,
                background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700,
              }}>{c.label}: {n}</span>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {tasks.some(t => t.status === 'done' || t.status === 'error') && (
          <button onClick={clearCompleted} style={{
            fontSize: 10, padding: '2px 10px', cursor: 'pointer',
            background: '#f0f0f5', border: '1px solid #aaa', borderRadius: 2, color: '#444',
          }}>נקה הושלמו</button>
        )}
        {tasks.length > 0 && (
          <button onClick={clearAll} style={{
            fontSize: 10, padding: '2px 10px', cursor: 'pointer',
            background: '#f0f0f5', border: '1px solid #aaa', borderRadius: 2, color: '#444',
          }}>נקה הכל</button>
        )}
        {stats.pending > 0 && (
          <button onClick={onStart} style={{
            fontSize: 10, padding: '2px 12px', cursor: 'pointer', fontWeight: 700,
            background: 'linear-gradient(180deg,#4caf78,#2e7d32)', border: '1px solid #1a5c22',
            borderRadius: 2, color: '#fff',
          }}>▶ התחל ({stats.pending})</button>
        )}
      </div>

      {/* Table */}
      <div style={{ height: 180, overflow: 'auto', background: '#fff' }}>
        {tasks.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, color: '#aab',
          }}>
            <span style={{ fontSize: 32 }}>📥</span>
            <span style={{ fontSize: 12 }}>בחר פורמט ברשימה הצדדית, או גרור קבצים לחלון</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: 'linear-gradient(180deg,#eef0f5,#e0e3ec)', borderBottom: '2px solid #b0b5c8' }}>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#334', width: '30%', whiteSpace: 'nowrap' }}>שם קובץ</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#334', width: '7%', whiteSpace: 'nowrap' }}>גודל</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#334', width: '10%', whiteSpace: 'nowrap' }}>פורמט יעד</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#334', width: '30%', whiteSpace: 'nowrap' }}>התקדמות</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#334', width: '12%', whiteSpace: 'nowrap' }}>מהירות / זמן</th>
                <th style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#334', width: '9%', whiteSpace: 'nowrap' }}>סטטוס</th>
                <th style={{ width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => {
                const st = STATUS_CFG[task.status] || STATUS_CFG.pending
                const rem = formatRemaining(task.remainingSec)
                return (
                  <tr
                    key={task.id}
                    onDoubleClick={() => reEditTask(task)}
                    style={{
                      borderBottom: '1px solid #eef0f5',
                      background: task.status === 'running'
                        ? '#f0f7ff'
                        : task.status === 'done'
                          ? '#f0fdf4'
                          : task.status === 'error'
                            ? '#fff5f5'
                            : i % 2 === 0 ? '#fff' : '#f8f9fc',
                      cursor: task.status !== 'running' ? 'pointer' : 'default',
                    }}
                    title={task.status !== 'running' ? 'לחץ פעמיים לעריכת הגדרות' : undefined}
                  >
                    <td style={{ padding: '4px 8px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
                      <span title={task.inputPath} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13 }}>
                          {task.category === 'audio' ? '🎵' : task.category === 'image' ? '🖼️' : '🎬'}
                        </span>
                        {task.fileName}
                      </span>
                    </td>
                    <td style={{ padding: '4px 8px', color: '#888', whiteSpace: 'nowrap' }}>
                      {formatSize(task.fileSize)}
                    </td>
                    <td style={{ padding: '4px 8px', fontWeight: 700, color: '#1565c0', whiteSpace: 'nowrap' }}>
                      → {task.outputFormat?.label || '?'}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      {task.status === 'running' ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                            <div style={{ flex: 1, height: 10, background: '#dde5f0', borderRadius: 5, overflow: 'hidden', border: '1px solid #b0c0d8' }}>
                              <div style={{
                                height: '100%',
                                width: `${task.progress}%`,
                                background: task.progress < 30
                                  ? 'linear-gradient(90deg,#1565c0,#42a5f5)'
                                  : task.progress < 70
                                    ? 'linear-gradient(90deg,#1565c0,#26c6da)'
                                    : 'linear-gradient(90deg,#1565c0,#4caf78)',
                                borderRadius: 5,
                                transition: 'width 0.4s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: 10, color: '#1565c0', fontWeight: 700, minWidth: 30 }}>
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      ) : task.status === 'error' ? (
                        <span style={{ fontSize: 10, color: '#991b1b' }} title={task.error}>
                          {task.error?.slice(0, 50)}...
                        </span>
                      ) : task.status === 'done' && task.outputPath ? (
                        <button onClick={() => window.electronAPI?.showInFolder(task.outputPath)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: 10,
                          padding: 0, textDecoration: 'underline',
                        }}>📂 פתח תיקייה</button>
                      ) : null}
                    </td>
                    <td style={{ padding: '4px 8px', color: '#666', fontSize: 10, whiteSpace: 'nowrap' }}>
                      {task.status === 'running' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {task.speed && <span>⚡ {task.speed.toFixed(1)}x</span>}
                          {rem && <span>⏱ {rem}</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 9, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 8,
                        background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                        whiteSpace: 'nowrap',
                      }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                      {task.status !== 'running' && (
                        <button onClick={() => removeTask(task.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#bbb', fontSize: 14, padding: '0 2px', lineHeight: 1,
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#e53'}
                          onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
                          title="הסר מהתור"
                        >✕</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        background: 'linear-gradient(180deg,#dde0ea,#cdd0dc)',
        borderTop: '1px solid #aaa8bc',
        padding: '3px 10px',
        display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: '#444',
      }}>
        <span>📂 פלט: <strong>{settings.outputDir || 'זהה לקובץ המקורי'}</strong></span>
        <span style={{ color: '#888' }}>|</span>
        <span>קבצים בתור: <strong>{tasks.length}</strong></span>
        {stats.running > 0 && (
          <>
            <span style={{ color: '#888' }}>|</span>
            <span style={{ color: '#1565c0', fontWeight: 700 }}>⚙ ממיר {stats.running} קבצים...</span>
          </>
        )}
        {stats.done > 0 && (
          <>
            <span style={{ color: '#888' }}>|</span>
            <span style={{ color: '#166534', fontWeight: 700 }}>✓ הושלמו: {stats.done}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ color: '#888' }}>פורמט נקי v1.8.0 — 100% אופליין</span>
      </div>
    </div>
  )
}
