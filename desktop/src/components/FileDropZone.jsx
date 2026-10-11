import React, { useState, useRef } from 'react'

export default function FileDropZone({ onFiles, accept, disabled, className = '' }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFiles(files)
  }

  const handleClick = async () => {
    if (disabled) return
    if (window.electronAPI) {
      const paths = await window.electronAPI.openFiles({
        filters: accept || [{ name: 'All Files', extensions: ['*'] }]
      })
      if (paths.length > 0) {
        onFiles(paths.map(p => ({ path: p, name: p.split(/[\\/]/).pop(), size: 0 })))
      }
    } else {
      inputRef.current?.click()
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onFiles(files.map(f => ({ path: f.path || f.name, name: f.name, size: f.size })))
    }
    e.target.value = ''
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-6
        ${isDragging ? 'drop-active border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="text-3xl">{isDragging ? '📂' : '📁'}</span>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">
          {isDragging ? 'Drop files here' : 'Click or drag files here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supports all common video, audio and image formats
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  )
}
