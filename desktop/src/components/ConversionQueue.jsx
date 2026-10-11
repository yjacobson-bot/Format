import React from 'react'
import { useStore } from '../store/useStore'
import TaskItem from './TaskItem'

export default function ConversionQueue({ onStartAll }) {
  const { tasks, removeTask, clearCompleted, getStats } = useStore()
  const stats = getStats()

  const handleCancel = (taskId) => {
    window.electronAPI?.cancelConversion(taskId)
    useStore.getState().updateTask(taskId, { status: 'error', error: 'Cancelled' })
  }

  const handleOpenOutput = (outputPath) => {
    window.electronAPI?.showInFolder(outputPath)
  }

  return (
    <div style={{
      background: '#2b2b2b', borderTop: '2px solid #111',
      display: 'flex', flexDirection: 'column', height: 200, flexShrink: 0,
    }}>
      {/* Queue header bar - like FF */}
      <div style={{
        background: '#1a1a1a', padding: '4px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid #444',
      }}>
        <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
          OUTPUT QUEUE
        </span>

        {stats.total > 0 && (
          <div style={{ display: 'flex', gap: 5, marginLeft: 4 }}>
            {[
              { label: `${stats.total} total`, bg: '#444', color: '#ccc' },
              stats.running > 0 && { label: `${stats.running} running`, bg: '#1d4ed8', color: '#fff' },
              stats.done > 0 && { label: `${stats.done} done`, bg: '#16a34a', color: '#fff' },
              stats.pending > 0 && { label: `${stats.pending} waiting`, bg: '#92400e', color: '#fcd34d' },
              stats.error > 0 && { label: `${stats.error} error`, bg: '#dc2626', color: '#fff' },
            ].filter(Boolean).map((s, i) => (
              <span key={i} style={{
                background: s.bg, color: s.color,
                fontSize: 10, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
              }}>{s.label}</span>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {stats.pending > 0 && (
          <button onClick={onStartAll} style={{
            background: 'linear-gradient(180deg,#22c55e,#15803d)', color: '#fff',
            border: '1px solid #14532d', borderRadius: 2, padding: '2px 8px',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            ▶ Start All
          </button>
        )}
        {stats.done > 0 && (
          <button onClick={clearCompleted} style={{
            background: '#3a3a3a', color: '#aaa',
            border: '1px solid #555', borderRadius: 2, padding: '2px 8px',
            fontSize: 10, cursor: 'pointer',
          }}>
            Clear done
          </button>
        )}
      </div>

      {/* Queue list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.length === 0 ? (
          <div style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
            Queue is empty — select a format above, then add files
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onRemove={removeTask}
              onCancel={handleCancel}
              onOpenOutput={handleOpenOutput}
            />
          ))
        )}
      </div>
    </div>
  )
}
