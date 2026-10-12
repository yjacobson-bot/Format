import React, { useState } from 'react'

const DOC_FORMATS = [
  { id: 'pdf2docx', label: 'PDF → Word', icon: '📝', ext: 'docx', desc: 'מסמך Word הניתן לעריכה' },
  { id: 'pdf2txt',  label: 'PDF → טקסט', icon: '📄', ext: 'txt',  desc: 'טקסט גולמי ללא עיצוב' },
  { id: 'pdf2odt',  label: 'PDF → ODT',  icon: '📋', ext: 'odt',  desc: 'פורמט LibreOffice פתוח' },
  { id: 'pdf2rtf',  label: 'PDF → RTF',  icon: '🗒️', ext: 'rtf',  desc: 'Rich Text Format' },
]

export default function DocumentsPage() {
  const [selectedFormat, setSelectedFormat] = useState(DOC_FORMATS[0])
  const [files, setFiles] = useState([])
  const [converting, setConverting] = useState(false)
  const [results, setResults] = useState([])

  async function handlePickFiles() {
    const picked = await window.electronAPI?.openFiles({ multiple: true })
    if (picked?.length) {
      setFiles(picked.map(p => ({ path: p, name: p.split(/[\\/]/).pop(), status: 'pending' })))
      setResults([])
    }
  }

  async function handleConvert() {
    if (!files.length) return
    setConverting(true)
    const newResults = []
    for (const file of files) {
      const outputPath = file.path.replace(/\.[^.]+$/, `.${selectedFormat.ext}`)
      const res = await window.electronAPI?.convertDocument({ inputPath: file.path, outputPath })
      newResults.push({ name: file.name, success: res?.success, outputPath: res?.outputPath, error: res?.error })
    }
    setResults(newResults)
    setConverting(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', direction: 'rtl', padding: 16, gap: 12, overflow: 'auto' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1a3060' }}>📄 המרת מסמכים</div>

      {/* Format selection */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DOC_FORMATS.map(fmt => (
          <button key={fmt.id} onClick={() => setSelectedFormat(fmt)} style={{
            padding: '6px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 4,
            border: `2px solid ${selectedFormat.id === fmt.id ? '#1565c0' : '#ccc'}`,
            background: selectedFormat.id === fmt.id ? '#dbeafe' : '#f5f5f5',
            color: selectedFormat.id === fmt.id ? '#1565c0' : '#444',
            fontWeight: selectedFormat.id === fmt.id ? 700 : 400,
          }}>
            {fmt.icon} {fmt.label}
          </button>
        ))}
      </div>

      {/* File picker */}
      <button onClick={handlePickFiles} style={{
        padding: '8px 16px', fontSize: 12, cursor: 'pointer',
        background: '#f0f0f5', border: '1px solid #bbb', borderRadius: 4, alignSelf: 'flex-start',
      }}>
        📂 בחר קובצי PDF
      </button>

      {/* Files list */}
      {files.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
          {files.map((f, i) => {
            const res = results.find(r => r.name === f.name)
            return (
              <div key={i} style={{
                padding: '6px 10px', borderBottom: i < files.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                background: res?.success ? '#f0fdf4' : res?.error ? '#fff5f5' : '#fff',
              }}>
                <span style={{ fontSize: 16 }}>📕</span>
                <span style={{ flex: 1, color: '#333' }}>{f.name}</span>
                {res?.success && (
                  <button onClick={() => window.electronAPI?.showInFolder(res.outputPath)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: 11, textDecoration: 'underline' }}>
                    📂 פתח
                  </button>
                )}
                {res?.error && <span style={{ color: '#991b1b', fontSize: 11 }}>שגיאה: {res.error.slice(0, 40)}</span>}
                {!res && converting && <span style={{ color: '#1565c0', fontSize: 11 }}>ממיר...</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Convert button */}
      {files.length > 0 && (
        <button onClick={handleConvert} disabled={converting} style={{
          padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: converting ? 'default' : 'pointer',
          background: converting ? '#9ca3af' : 'linear-gradient(180deg,#4caf78,#2e7d32)',
          color: '#fff', border: 'none', borderRadius: 4, alignSelf: 'flex-start',
          opacity: converting ? 0.7 : 1,
        }}>
          {converting ? '⏳ ממיר...' : `▶ המר ${files.length} קובץ/ים → .${selectedFormat.ext}`}
        </button>
      )}
    </div>
  )
}
