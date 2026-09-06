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
        dark: {
          950: '#05070c',
          900: '#080c14',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        neon: {
          cyan: '#00f2fe',
          blue: '#38bdf8',
          purple: '#a855f7',
          pink: '#ec4899',
          emerald: '#10b981'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
