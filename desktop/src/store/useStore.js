import { create } from 'zustand'
import { getDefaultVideoSettings, getDefaultAudioSettings, getDefaultImageSettings } from '../utils/presets'

let taskCounter = 0
function genId() { return `task_${Date.now()}_${++taskCounter}` }

export const useStore = create((set, get) => ({
  activeCategory: 'video',
  paused: false,
  tasks: [],
  settings: {
    outputDir: '',
    maxConcurrent: Math.max(2, Math.min(8, Math.floor((navigator.hardwareConcurrency || 4) / 2))),
    deleteSourceAfter: false,
    showNotifications: true,
    shutdownOnComplete: false,
    playSoundOnComplete: true,
  },

  // The "Convert to X" setup window state
  setupWindow: null, // { targetFormat, category, files: [], convSettings: {} }
  joinWindow: null,  // { files: [], settings: {} }

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  togglePause: () => set(state => ({ paused: !state.paused })),

  openSetupWindow: (targetFormat, category, files = []) => {
    let convSettings = {}
    if (category === 'video') convSettings = getDefaultVideoSettings()
    else if (category === 'audio') convSettings = getDefaultAudioSettings()
    else if (category === 'image') convSettings = getDefaultImageSettings()
    const { settings } = get()
    if (category === 'video' && settings.defaultHwAccel) convSettings.hwAccel = settings.defaultHwAccel
    set({ setupWindow: { targetFormat, category, files, convSettings } })
  },

  updateSetupSettings: (convSettings) => set(state => ({
    setupWindow: state.setupWindow ? { ...state.setupWindow, convSettings } : null
  })),

  updateSetupFiles: (files) => set(state => ({
    setupWindow: state.setupWindow ? { ...state.setupWindow, files } : null
  })),

  closeSetupWindow: () => set({ setupWindow: null }),

  openJoinWindow: (files = [], kind = 'video') => set({ joinWindow: { files, kind, settings: kind === 'audio' ? { ext: 'mp3', audioCodec: 'libmp3lame', audioBitrate: '192k' } : { ext: 'mp4', videoCodec: 'libx264', audioBitrate: '192k' } } }),
  updateJoinFiles: (files) => set(state => ({ joinWindow: state.joinWindow ? { ...state.joinWindow, files } : null })),
  updateJoinSettings: (settings) => set(state => ({ joinWindow: state.joinWindow ? { ...state.joinWindow, settings } : null })),
  closeJoinWindow: () => set({ joinWindow: null }),

  setOutputDir: (dir) => set(state => ({ settings: { ...state.settings, outputDir: dir } })),
  updateSettings: (updates) => set(state => ({ settings: { ...state.settings, ...updates } })),

  addTasks: (files, outputFormat, conversionSettings, category) => {
    const newTasks = files.map(file => ({
      id: genId(),
      inputPath: file.path,
      fileName: file.name,
      fileSize: file.size,
      outputFormat,
      outputPath: null,
      settings: conversionSettings || {},
      category: category || null,
      status: 'pending',
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    }))
    set(state => ({ tasks: [...state.tasks, ...newTasks] }))
    return newTasks
  },

  addJoinTask: (files, outputExt, settings) => {
    const task = {
      id: genId(),
      inputPath: files[0]?.path || '',
      fileName: `מיזוג ${files.length} קבצים.${outputExt}`,
      fileSize: files.reduce((s, f) => s + (f.size || 0), 0),
      outputFormat: { id: 'merge', label: 'מיזוג', ext: outputExt, ffmpegArgs: [] },
      outputPath: null,
      settings: { ...settings, joinFiles: files.map(f => f.path) },
      category: 'video',
      status: 'pending',
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    }
    set(state => ({ tasks: [...state.tasks, task] }))
    return task
  },

  removeTask: (taskId) => set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) })),
  clearCompleted: () => set(state => ({ tasks: state.tasks.filter(t => t.status !== 'done' && t.status !== 'error') })),
  clearAll: () => set({ tasks: [] }),

  setTaskProgress: (taskId, percent, details) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? {
      ...t,
      progress: Math.min(100, Math.max(0, percent || 0)),
      speed: details?.speed ?? t.speed,
      remainingSec: details?.remainingSec ?? t.remainingSec,
      bitrate: details?.bitrate ?? t.bitrate,
    } : t)
  })),
  setTaskComplete: (taskId) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'done', progress: 100, completedAt: new Date().toISOString() } : t)
  })),
  setTaskError: (taskId, error) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'error', error, completedAt: new Date().toISOString() } : t)
  })),
  setTaskRunning: (taskId, outputPath) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'running', outputPath, startedAt: new Date().toISOString(), progress: 0 } : t)
  })),

  getPendingTasks: () => get().tasks.filter(t => t.status === 'pending'),
  getRunningTasks: () => get().tasks.filter(t => t.status === 'running'),
  getStats: () => {
    const { tasks } = get()
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      done: tasks.filter(t => t.status === 'done').length,
      error: tasks.filter(t => t.status === 'error').length,
    }
  },
}))
