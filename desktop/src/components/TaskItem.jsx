import React from 'react'

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

const STATUS_STYLE = {
  pending:  { bg: '#78350f', color: '#fcd34d', label: 'ממתין' },
  running:  { bg: '#1e3a8a', color: '#93c5fd', label: 'ממיר' },
  done:     { bg: '#14532d', color: '#86efac', label: 'הושלם' },
  error:    { bg: '#7f1d1d', color: '#fca5a5', label: 'שגיאה' },
}

export default function TaskItem({ task, onRemove, onCancel, onOpenOutput }) {
  const isRunning = task.status === 'running'
  const isDone = task.status === 'done'
  const isError = task.status === 'error'
  const progress = Math.round(task.progress || 0)
  const style = STATUS_STYLE[task.status] || STATUS_STYLE.pending

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 6px', borderRadius: 2,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isError ? '#7f1d1d' : isDone ? '#14532d' : 'rgba(255,255,255,0.06)'}`,
    }}>
      {/* Status pill */}
      <div style={{
        background: style.bg, color: style.color,
        fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 2,
        minWidth: 60, textAlign: 'center', flexShrink: 0,
      }}>
        {style.label}
      </div>

      {/* Filename */}
      <span style={{
        color: isDone ? '#86efac' : isError ? '#fca5a5' : '#e0e0e0',
        fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }} title={task.inputPath}>
        {task.fileName}
      </span>

      {/* Size */}
      {task.fileSize > 0 && (
        <span style={{ color: '#666', fontSize: 10, flexShrink: 0 }}>{formatSize(task.fileSize)}</span>
      )}

      {/* Format badge */}
      <span style={{
        background: '#3a3a3a', color: '#aaa', fontSize: 9, fontWeight: 700,
        padding: '1px 5px', borderRadius: 2, flexShrink: 0,
      }}>
        {task.outputFormat?.label || task.outputFormat?.id}
      </span>

      {/* Progress bar - FF style (replaces spinner) */}
      {isRunning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 80, height: 10, background: '#444', borderRadius: 1, overflow: 'hidden', border: '1px solid #555' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
              transition: 'width 0.3s',
            }} className="progress-striped" />
          </div>
          <span style={{ color: '#93c5fd', fontSize: 9, fontWeight: 700, width: 28, textAlign: 'right' }}>
            {progress}%
          </span>
        </div>
      )}

      {/* Error message */}
      {isError && task.error && (
        <span style={{ color: '#f87171', fontSize: 10, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={task.error}>
          {task.error}
        </span>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {isDone && task.outputPath && (
          <button onClick={() => onOpenOutput?.(task.outputPath)}
            title="Show in folder"
            style={{ background: '#1a3a6a', color: '#93c5fd', border: 'none', borderRadius: 2, padding: '2px 5px', fontSize: 10, cursor: 'pointer' }}>
            📂
          </button>
        )}
        {isRunning ? (
          <button onClick={() => onCancel?.(task.id)} title="Cancel"
            style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 2, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>
            ✕
          </button>
        ) : (
          <button onClick={() => onRemove?.(task.id)} title="Remove"
            style={{ background: '#3a3a3a', color: '#888', border: 'none', borderRadius: 2, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
