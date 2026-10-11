import React from 'react'
import { useStore } from '../store/useStore'

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}

const STATUS_LABELS = {
  pending: { label: 'ממתין', color: '#888', bg: '#f0f0f0' },
  running: { label: 'ממיר...', color: '#1a5fa8', bg: '#dce9f8' },
  done:    { label: '✓ הושלם', color: '#16a34a', bg: '#dcfce7' },
  error:   { label: '✕ שגיאה', color: '#dc2626', bg: '#fee2e2' },
}

export default function Queue({ onStart }) {
  const { tasks, removeTask, clearCompleted, clearAll } = useStore()

  return (
    <div style={{
      height: 200, flexShrink: 0, borderTop: '2px solid #bbb',
      background: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg,#e8e8e8,#d8d8d8)',
        borderBottom: '1px solid #ccc', padding: '3px 8px',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>
          📋 תור המרות ({tasks.length})
        </span>
        <div style={{ flex: 1 }} />
        {tasks.some(t => t.status === 'done' || t.status === 'error') && (
          <button onClick={clearCompleted} style={{
            fontSize: 10, padding: '1px 8px', cursor: 'pointer',
            background: '#f5f5f5', border: '1px solid #bbb', borderRadius: 2,
          }}>נקה הושלמו</button>
        )}
        {tasks.length > 0 && (
          <button onClick={clearAll} style={{
            fontSize: 10, padding: '1px 8px', cursor: 'pointer',
            background: '#f5f5f5', border: '1px solid #bbb', borderRadius: 2,
          }}>נקה הכל</button>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#bbb', fontSize: 12, gap: 8,
          }}>
            <span style={{ fontSize: 22 }}>📥</span>
            בחר פורמט יעד או גרור קבצים לחלון
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: '35%' }}>שם קובץ קלט</th>
                <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: '12%' }}>פורמט</th>
                <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: '12%' }}>גודל</th>
                <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: '25%' }}>התקדמות</th>
                <th style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600, width: '10%' }}>סטטוס</th>
                <th style={{ padding: '3px 4px', width: 30 }}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => {
                const st = STATUS_LABELS[task.status] || STATUS_LABELS.pending
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '3px 8px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
                      <span title={task.inputPath}>{task.fileName}</span>
                    </td>
                    <td style={{ padding: '3px 8px', color: '#555', fontWeight: 600 }}>
                      → {task.outputFormat?.label || '?'}
                    </td>
                    <td style={{ padding: '3px 8px', color: '#888' }}>
                      {formatSize(task.fileSize)}
                    </td>
                    <td style={{ padding: '3px 8px' }}>
                      {task.status === 'running' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ flex: 1, height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${task.progress}%`,
                              background: 'linear-gradient(90deg,#1a5fa8,#4caf78)',
                              borderRadius: 4, transition: 'width 0.3s',
                            }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#555', minWidth: 28 }}>{task.progress}%</span>
                        </div>
                      ) : task.status === 'error' ? (
                        <span style={{ fontSize: 10, color: '#dc2626' }} title={task.error}>
                          {task.error?.slice(0, 40)}...
                        </span>
                      ) : task.status === 'done' ? (
                        <span style={{ fontSize: 10, color: '#16a34a' }}>
                          {task.outputPath ? (
                            <button onClick={() => window.electronAPI?.showInFolder(task.outputPath)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 10, padding: 0 }}>
                              📂 פתח תיקייה
                            </button>
                          ) : '✓'}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: '3px 8px' }}>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 8,
                        background: st.bg, color: st.color, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                      {task.status !== 'running' && (
                        <button onClick={() => removeTask(task.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#aaa', fontSize: 13, padding: '0 2px',
                        }} title="הסר">✕</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
