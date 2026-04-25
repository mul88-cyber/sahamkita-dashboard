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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        base:     '#080d14',
        surface:  '#0d1520',
        elevated: '#111c2d',
        overlay:  '#162238',
        accent:   '#00d2a0',
        whale:    '#00c4ff',
        bull:     '#00e676',
        bear:     '#ff4f6a',
        neutral:  '#f0b429',
      },
      backgroundImage: {
        'grid-dark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zM40 40V0h1v40zM0 0h40v1H0zM0 40h40v1H0z' fill='rgba(255,255,255,0.02)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-dot':  'pulse-dot 1.8s ease-in-out infinite',
        'fade-in':    'fadeInUp 0.3s ease-out both',
        'slide-in':   'slide-in-right 0.25s ease-out both',
        'shimmer':    'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}
export default config
