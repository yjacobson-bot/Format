import { create } from 'zustand'
import { getDefaultVideoSettings, getDefaultAudioSettings, getDefaultImageSettings } from '../utils/presets'

let taskCounter = 0

function genId() {
  return `task_${Date.now()}_${++taskCounter}`
}

export const useStore = create((set, get) => ({
  activeCategory: 'video',
  activeOutputFormat: null,
  tasks: [],
  outputDir: '',
  theme: 'light',
  settings: {
    outputDir: '',
    maxConcurrent: 2,
    deleteSourceAfter: false,
    showNotifications: true,
  },

  setActiveCategory: (cat) => set({ activeCategory: cat, activeOutputFormat: null }),
  setActiveOutputFormat: (fmt) => set({ activeOutputFormat: fmt }),
  setTheme: (theme) => set({ theme }),

  setOutputDir: (dir) => set((state) => ({
    settings: { ...state.settings, outputDir: dir }
  })),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),

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
    set((state) => ({ tasks: [...state.tasks, ...newTasks] }))
    return newTasks
  },

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
  })),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  clearCompleted: () => set((state) => ({
    tasks: state.tasks.filter(t => t.status !== 'done' && t.status !== 'error')
  })),

  clearAll: () => set({ tasks: [] }),

  setTaskProgress: (taskId, percent) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, progress: Math.min(100, Math.max(0, percent || 0)) } : t)
  })),

  setTaskComplete: (taskId) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId
      ? { ...t, status: 'done', progress: 100, completedAt: new Date().toISOString() }
      : t)
  })),

  setTaskError: (taskId, error) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId
      ? { ...t, status: 'error', error, completedAt: new Date().toISOString() }
      : t)
  })),

  setTaskRunning: (taskId, outputPath) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId
      ? { ...t, status: 'running', outputPath, startedAt: new Date().toISOString(), progress: 0 }
      : t)
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
