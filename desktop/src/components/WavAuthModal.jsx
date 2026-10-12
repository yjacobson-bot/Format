import React, { useState } from 'react'

const REQUIRED_PASSWORD = 'יצחק יעקבסון'

export default function WavAuthModal({ onApprove, onCancel }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.trim() === REQUIRED_PASSWORD) {
      onApprove()
    } else {
      setError('סיסמה שגויה. אין אפשרות להמשיך.')
      setPassword('')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 28,
        width: 380, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        direction: 'rtl', textAlign: 'right',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
          אישור שימוש בפורמט WAV
        </div>
        <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
          למען שמירת התקנות והגנת זכויות יוצרים, המרה לפורמט WAV או ממנו
          מחייבת אישור מפורש כי השימוש בקובץ זה עומד בכל הכללים החלים עליך
          על פי דין, לרבות דיני זכויות יוצרים.
          <br /><br />
          להמשך, הזן את קוד האישור שקיבלת.
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="קוד אישור..."
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
              borderRadius: 5, padding: '8px 10px',
              fontSize: 13, marginBottom: 6, direction: 'rtl',
              outline: 'none',
            }}
          />
          {error && (
            <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="submit" style={{
              flex: 1, padding: '8px 0', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              אשר והמשך
            </button>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '8px 0', background: '#f1f5f9', color: '#374151',
              border: '1px solid #d1d5db', borderRadius: 5, fontSize: 12, cursor: 'pointer',
            }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
