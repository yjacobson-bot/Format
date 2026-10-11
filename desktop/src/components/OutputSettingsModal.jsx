import React, { useState } from 'react'
import {
  RESOLUTIONS, VIDEO_BITRATES, AUDIO_BITRATES, FRAMERATES,
  SAMPLE_RATES, AUDIO_CHANNELS, VIDEO_CODECS, AUDIO_CODECS, DEVICE_PRESETS
} from '../utils/formats'
import { PRESETS } from '../utils/presets'

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:border-blue-400 focus:outline-none"
      >
        {options.map(o => (
          <option key={o.value ?? 'auto'} value={o.value || ''}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        placeholder={placeholder}
        className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:border-blue-400 focus:outline-none"
      />
    </div>
  )
}

export default function OutputSettingsModal({ category, format, settings, onChange, onClose, onApply, outputDir, onOutputDirChange }) {
  const [tab, setTab] = useState('video')
  const tabs = category === 'audio'
    ? ['audio', 'trim']
    : category === 'image'
    ? ['image']
    : ['video', 'audio', 'trim', 'presets']

  const applyPreset = (presetId) => {
    const preset = PRESETS.video?.[presetId]
    if (preset) onChange({ ...settings, ...preset })
  }

  const applyDevicePreset = (preset) => {
    const s = preset.settings
    onChange({
      ...settings,
      format: s.format,
      resolution: s.resolution,
      videoBitrate: s.videoBitrate,
      audioBitrate: s.audioBitrate,
      fps: s.fps,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-800">
            הגדרות פלט — {format?.label}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex border-b px-5">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'video' ? 'וידאו' : t === 'audio' ? 'אודיו' : t === 'trim' ? 'חיתוך' : t === 'image' ? 'תמונה' : t === 'presets' ? 'פרסטים' : t}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {tab === 'video' && (
            <>
              <SelectField label="רזולוציה" value={settings.resolution} onChange={v => onChange({ ...settings, resolution: v })} options={RESOLUTIONS} />
              <SelectField label="קודק וידאו" value={settings.videoCodec} onChange={v => onChange({ ...settings, videoCodec: v })} options={VIDEO_CODECS} />
              <SelectField label="קצב וידאו" value={settings.videoBitrate} onChange={v => onChange({ ...settings, videoBitrate: v })} options={VIDEO_BITRATES} />
              <SelectField label="קצב פריימים" value={settings.fps} onChange={v => onChange({ ...settings, fps: v })} options={FRAMERATES} />
              <div className="grid grid-cols-3 gap-3">
                {[null, 90, 180, 270].map(r => (
                  <button key={r} onClick={() => onChange({ ...settings, rotate: r })}
                    className={`py-2 text-sm rounded border transition-colors ${settings.rotate === r ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                    {r === null ? 'ללא סיבוב' : `סובב ${r}°`}
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'audio' && (
            <>
              <SelectField label="קודק אודיו" value={settings.audioCodec} onChange={v => onChange({ ...settings, audioCodec: v })} options={AUDIO_CODECS} />
              <SelectField label="קצב אודיו" value={settings.audioBitrate} onChange={v => onChange({ ...settings, audioBitrate: v })} options={AUDIO_BITRATES} />
              <SelectField label="קצב דגימה" value={settings.sampleRate} onChange={v => onChange({ ...settings, sampleRate: v })} options={SAMPLE_RATES} />
              <SelectField label="ערוצים" value={settings.channels} onChange={v => onChange({ ...settings, channels: v })} options={AUDIO_CHANNELS} />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="normalize" checked={!!settings.normalize} onChange={e => onChange({ ...settings, normalize: e.target.checked })} />
                <label htmlFor="normalize" className="text-sm text-gray-700">נרמל עוצמת אודיו</label>
              </div>
            </>
          )}

          {tab === 'trim' && (
            <>
              <InputField label="זמן התחלה (שניות)" value={settings.trim?.start} onChange={v => onChange({ ...settings, trim: { ...settings.trim, start: v ? parseFloat(v) : null } })} placeholder="לדוג' 10.5" type="number" />
              <InputField label="זמן סיום (שניות)" value={settings.trim?.end} onChange={v => onChange({ ...settings, trim: { ...settings.trim, end: v ? parseFloat(v) : null } })} placeholder="לדוג' 60.0" type="number" />
            </>
          )}

          {tab === 'image' && (
            <>
              <InputField label="רוחב (פיקסל, השאר ריק לאוטומטי)" value={settings.width} onChange={v => onChange({ ...settings, width: v })} placeholder="אוטו" type="number" />
              <InputField label="גובה (פיקסל, השאר ריק לאוטומטי)" value={settings.height} onChange={v => onChange({ ...settings, height: v })} placeholder="אוטו" type="number" />
              <InputField label="איכות (1-100, JPG/WebP)" value={settings.quality} onChange={v => onChange({ ...settings, quality: v })} placeholder="85" type="number" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="keepAspect" checked={settings.keepAspect !== false} onChange={e => onChange({ ...settings, keepAspect: e.target.checked })} />
                <label htmlFor="keepAspect" className="text-sm text-gray-700">שמור יחס גובה-רוחב</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="grayscale" checked={!!settings.grayscale} onChange={e => onChange({ ...settings, grayscale: e.target.checked })} />
                <label htmlFor="grayscale" className="text-sm text-gray-700">המר לגווני אפור</label>
              </div>
            </>
          )}

          {tab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">פרסטים למכשירים</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DEVICE_PRESETS.map(preset => (
                    <button key={preset.id} onClick={() => applyDevicePreset(preset)}
                      className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">פרסטים לאיכות</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESETS.video || {}).map(([id, preset]) => (
                    <button key={id} onClick={() => applyPreset(id)}
                      className="p-2.5 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
                      <span className="text-xs font-medium text-gray-700">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs font-medium text-gray-600 shrink-0">תיקיית פלט:</label>
            <input
              type="text"
              value={outputDir}
              onChange={e => onOutputDirChange(e.target.value)}
              placeholder="זהה לקובץ המקור"
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={async () => {
                const dir = await window.electronAPI?.openFolder()
                if (dir) onOutputDirChange(dir)
              }}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1.5 rounded transition-colors"
            >
              עיון
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              ביטול
            </button>
            <button onClick={onApply} className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium">
              החל הגדרות
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
