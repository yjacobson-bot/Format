import { create } from 'zustand'
import { getDefaultVideoSettings, getDefaultAudioSettings, getDefaultImageSettings } from '../utils/presets'

let taskCounter = 0
function genId() { return `task_${Date.now()}_${++taskCounter}` }

export const useStore = create((set, get) => ({
  activeCategory: 'video',
  tasks: [],
  settings: {
    outputDir: '',
    maxConcurrent: 2,
    deleteSourceAfter: false,
    showNotifications: true,
  },

  // The "Convert to X" setup window state
  setupWindow: null, // { targetFormat, category, files: [], convSettings: {} }

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  openSetupWindow: (targetFormat, category, files = []) => {
    let convSettings = {}
    if (category === 'video') convSettings = getDefaultVideoSettings()
    else if (category === 'audio') convSettings = getDefaultAudioSettings()
    else if (category === 'image') convSettings = getDefaultImageSettings()
    set({ setupWindow: { targetFormat, category, files, convSettings } })
  },

  updateSetupSettings: (convSettings) => set(state => ({
    setupWindow: state.setupWindow ? { ...state.setupWindow, convSettings } : null
  })),

  updateSetupFiles: (files) => set(state => ({
    setupWindow: state.setupWindow ? { ...state.setupWindow, files } : null
  })),

  closeSetupWindow: () => set({ setupWindow: null }),

  setOutputDir: (dir) => set(state => ({ settings: { ...state.settings, outputDir: dir } })),
  updateSettings: (updates) => set(state => ({ settings: { ...state.settings, ...updates } })),

  addTasks: (files, outputFormat, conversionSettings) => {
    const newTasks = files.map(file => ({
      id: genId(),
      inputPath: file.path,
      fileName: file.name,
      fileSize: file.size,
      outputFormat,
      outputPath: null,
      settings: conversionSettings || {},
      status: 'pending',
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    }))
    set(state => ({ tasks: [...state.tasks, ...newTasks] }))
    return newTasks
  },

  removeTask: (taskId) => set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) })),
  clearCompleted: () => set(state => ({ tasks: state.tasks.filter(t => t.status !== 'done' && t.status !== 'error') })),
  clearAll: () => set({ tasks: [] }),

  setTaskProgress: (taskId, percent) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, progress: Math.min(100, Math.max(0, percent || 0)) } : t)
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
