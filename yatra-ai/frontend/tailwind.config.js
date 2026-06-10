/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          orange: '#f97316',
          violet: '#8b5cf6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        dark: {
          900: '#030712',
          800: '#0a0f1e',
          700: '#0f172a',
          600: '#1e293b',
          500: '#334155',
          400: '#475569',
        }
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(210,100%,16%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,16%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,100%,8%,1) 0px, transparent 50%)',
        'mesh-2': 'radial-gradient(at 21% 33%, hsla(224,100%,12%,1) 0px, transparent 50%), radial-gradient(at 79% 64%, hsla(289,60%,12%,1) 0px, transparent 50%)',
        'card-glow': 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(139,92,246,0.05) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14,165,233,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(14,165,233,0.6)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
