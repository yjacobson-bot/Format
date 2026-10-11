/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/index.html'],
  theme: {
    extend: {
      colors: {
        // Format Factory exact palette
        'ff-bg': '#ebebeb',
        'ff-sidebar': '#333333',
        'ff-sidebar-hover': '#444444',
        'ff-sidebar-active': '#1a5fa8',
        'ff-header-from': '#1c3f6e',
        'ff-header-to': '#2d6abf',
        'ff-card': '#ffffff',
        'ff-card-border': '#d0d0d0',
        'ff-card-hover': '#e8f0fb',
        'ff-queue-bg': '#2b2b2b',
        'ff-queue-header': '#1a1a1a',
        'ff-orange': '#f97316',
        'ff-green': '#16a34a',
        'ff-blue': '#1d4ed8',
        'ff-purple': '#7c3aed',
        'ff-red': '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Arial', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ff-card': '0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.10)',
        'ff-sidebar': 'inset -2px 0 4px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
