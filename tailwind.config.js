/** @type {import('tailwindcss').Config} */

// Clean, premium dark theme. Colors reference --c-* channel triplets defined in
// index.css so /alpha modifiers work. Single dark theme (no light/dark toggle).
const ink = 'rgb(var(--c-ink) / <alpha-value>)';
const paper = 'rgb(var(--c-paper) / <alpha-value>)';
const surface = 'rgb(var(--c-surface) / <alpha-value>)';
const surface2 = 'rgb(var(--c-surface-2) / <alpha-value>)';
const orange = 'rgb(var(--c-orange) / <alpha-value>)';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: paper,
          orange: orange,
          'orange-light': orange,
          cream: paper,
          gold: orange,
        },
        bg: {
          primary: paper,
          secondary: surface2,
          card: surface,
          elevated: surface2,
          dark: paper,
        },
        surface: {
          white: surface,
          cream: paper,
          dark: surface,
          elevated: surface2,
        },
        text: {
          primary: ink,
          secondary: 'rgb(var(--c-ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-faint) / <alpha-value>)',
          inverse: paper,
        },
        accent: {
          orange: orange,
          'orange-light': orange,
          blue: orange,
          pink: orange,
          gold: orange,
          DEFAULT: orange,
        },
        border: {
          subtle: 'rgb(var(--c-line-soft) / <alpha-value>)',
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.8rem, 7vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-sm': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'headline': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'subhead': ['clamp(1rem, 1.5vw, 1.2rem)', { lineHeight: '1.6' }],
      },
      // Rounded, soft — de-boxed
      borderRadius: {
        'none': '0',
        'sm': '0.5rem',
        DEFAULT: '0.625rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        'full': '9999px',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Soft, subtle elevation
      boxShadow: {
        'glow-orange': '0 8px 30px -8px rgb(var(--c-orange) / 0.28)',
        'glow-orange-lg': '0 24px 70px -20px rgb(var(--c-orange) / 0.22)',
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.4), 0 6px 20px -6px rgb(0 0 0 / 0.35)',
        'card-hover': '0 12px 36px -8px rgb(0 0 0 / 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgb(255 255 255 / 0.05)',
      },
    },
  },
  plugins: [],
}
