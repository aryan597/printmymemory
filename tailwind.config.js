/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#070911',
        'bg-secondary': '#0d1220',
        'bg-card': 'rgba(255, 255, 255, 0.045)',
        'bg-elevated': 'rgba(255, 255, 255, 0.09)',
        'glass': 'rgba(255, 255, 255, 0.05)',
        'glass-strong': 'rgba(255, 255, 255, 0.10)',
        'glass-border': 'rgba(255, 255, 255, 0.10)',
        'glass-border-strong': 'rgba(255, 255, 255, 0.18)',
        'accent': '#f97316',
        'accent-hover': '#fb923c',
        'accent-glow': 'rgba(249, 115, 22, 0.25)',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'border-subtle': 'rgba(255, 255, 255, 0.10)',
        'border-hover': 'rgba(255, 255, 255, 0.18)',
        'success': '#22c55e',
        'whatsapp': '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.35)',
        'glow': '0 0 24px rgba(249, 115, 22, 0.25)',
        'glow-sm': '0 0 12px rgba(249, 115, 22, 0.20)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'blob': 'blob 10s infinite',
        'shimmer': 'shimmer 3s infinite linear',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
