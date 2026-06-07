/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'bg-card': '#1a1f2e',
        'bg-elevated': '#232838',
        'accent': '#f97316',
        'accent-hover': '#ea580c',
        'accent-glow': 'rgba(249, 115, 22, 0.15)',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'border-subtle': '#1e293b',
        'border-hover': '#334155',
        'success': '#22c55e',
        'whatsapp': '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
