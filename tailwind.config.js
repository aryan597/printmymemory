/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-tertiary': '#171717',
        'bg-card': '#ffffff',
        'bg-muted': '#f5f5f5',
        'surface': '#141414',
        'surface-hover': '#1c1c1c',
        'border-subtle': '#262626',
        'border-hover': '#404040',
        'text-primary': '#fafafa',
        'text-secondary': '#a3a3a3',
        'text-muted': '#737373',
        'accent': '#ffffff',
        'accent-inverse': '#0a0a0a',
        'whatsapp': '#25D366',
        'success': '#22c55e',
        'error': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'soft-lg': '0 12px 40px rgba(0, 0, 0, 0.18)',
      },
      letterSpacing: {
        'tight': '-0.02em',
        'wide': '0.04em',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
