/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand': {
          black: '#0a0a0a',
          orange: '#ff6b35',
          blue: '#0066ff',
          cream: '#faf9f6',
        },
        // Dark theme semantic colors
        'bg': {
          primary: '#0a0a0a',      // dark background
          secondary: '#141414',    // slightly lighter dark
          card: '#1a1a1a',        // card backgrounds
          dark: '#0a0a0a',
        },
        'surface': {
          white: '#ffffff',
          cream: '#f5f5f0',
          dark: '#1a1a1a',
          elevated: '#1f1f1f',
        },
        'text': {
          primary: '#ffffff',
          secondary: '#a3a3a3',
          muted: '#737373',
          inverse: '#0a0a0a',
        },
        'accent': {
          orange: '#ff6b35',
          blue: '#0066ff',
          pink: '#ff006e',
          DEFAULT: '#ff6b35',
        },
        'border': {
          subtle: '#262626',
          DEFAULT: '#333333',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'headline': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'subhead': ['clamp(1.1rem, 1.5vw, 1.35rem)', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
