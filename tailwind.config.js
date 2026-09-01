/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050505',
          secondary: '#0B1116',
          elevated: '#11181F',
          card: 'rgba(17, 24, 31, 0.7)',
        },
        cyan: {
          primary: '#0F8F9C',
          secondary: '#18B8C4',
          highlight: '#3DD6DE',
          glow: 'rgba(24, 184, 196, 0.15)',
        },
        mint: {
          primary: '#7CFF6A',
          secondary: '#A3FF85',
          glow: 'rgba(124, 255, 106, 0.15)',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A7AFBA',
          muted: '#68717D',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.18)',
          'border-cyan': 'rgba(24, 184, 196, 0.3)',
          'border-mint': 'rgba(124, 255, 106, 0.3)',
          surface: 'rgba(255, 255, 255, 0.035)',
          'surface-hover': 'rgba(255, 255, 255, 0.06)',
          elevated: 'rgba(17, 24, 31, 0.65)',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
      backgroundImage: {
        'prism-gradient': 'linear-gradient(180deg, #7CFF6A 0%, #18B8C4 50%, #0F8F9C 100%)',
        'prism-glow': 'radial-gradient(circle at 50% 30%, rgba(124, 255, 106, 0.08) 0%, rgba(15, 143, 156, 0.06) 50%, transparent 80%)',
        'card-glow': 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(24, 184, 196, 0.08), transparent 40%)',
      },
      boxShadow: {
        'glass-subtle': '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-card': '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'cyan-glow': '0 0 30px -5px rgba(24, 184, 196, 0.3)',
        'mint-glow': '0 0 30px -5px rgba(124, 255, 106, 0.25)',
        'robot-glow': '0 0 50px rgba(24, 184, 196, 0.25), 0 0 20px rgba(124, 255, 106, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'glow-breathe': 'glowBreathe 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        glowBreathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.75' },
        },
      }
    },
  },
  plugins: [],
}
