/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#08080A',
          orange: '#F05500',
          'orange-light': '#FF7A35',
          cream: '#F5F5F0',
          gold: '#D4A017',
        },
        bg: {
          primary: '#08080A',
          secondary: '#0E0E12',
          card: '#13131A',
          elevated: '#1A1A22',
          dark: '#08080A',
        },
        surface: {
          white: '#ffffff',
          cream: '#F5F5F0',
          dark: '#13131A',
          elevated: '#1A1A22',
        },
        text: {
          primary: '#F4F4F5',
          secondary: '#A1A1AA',
          muted: '#6B6B78',
          inverse: '#08080A',
        },
        accent: {
          orange: '#F05500',
          'orange-light': '#FF7A35',
          blue: '#3B82F6',
          pink: '#EC4899',
          gold: '#D4A017',
          DEFAULT: '#F05500',
        },
        border: {
          subtle: '#1C1C24',
          DEFAULT: '#2A2A36',
          strong: '#3E3E4E',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.8rem, 7vw, 5.5rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'headline': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'subhead': ['clamp(1rem, 1.5vw, 1.2rem)', { lineHeight: '1.6' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
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
      boxShadow: {
        'glow-orange': '0 0 40px rgba(240, 85, 0, 0.2)',
        'glow-orange-lg': '0 0 80px rgba(240, 85, 0, 0.15)',
        'card': '0 1px 2px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
