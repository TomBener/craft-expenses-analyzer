import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Category colors - more natural, less saturated
        groceries: {
          light: '#4ade80',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        shopping: {
          light: '#f9a8d4',
          DEFAULT: '#f472b6',
          dark: '#ec4899',
        },
        dining: {
          light: '#fdba74',
          DEFAULT: '#fb923c',
          dark: '#f97316',
        },
        transport: {
          light: '#93c5fd',
          DEFAULT: '#60a5fa',
          dark: '#3b82f6',
        },
        entertainment: {
          light: '#c4b5fd',
          DEFAULT: '#a78bfa',
          dark: '#8b5cf6',
        },
        utilities: {
          light: '#fde047',
          DEFAULT: '#facc15',
          dark: '#eab308',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
