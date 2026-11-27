/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cosmos: {
          950: '#02040a',
          900: '#050914',
          800: '#0a1226',
          700: '#101d3b',
        },
        neon: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          magenta: '#ec4899',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 18s linear infinite',
      },
    },
  },
  plugins: [],
};
