/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3EFE7',
        card: '#FFFFFF',
        ink: { DEFAULT: '#0D0D0D', 2: '#262423' },
        mute: '#5F5A52',
        soft: '#8F897F',
        line: { DEFAULT: '#E3DDD2', strong: '#C8C0B2' },
        brand: { DEFAULT: '#E52521', soft: '#FADDD9', deep: '#C41E1A', text: '#F0302B' },
        chart: { blue: '#4F63C9', green: '#6E9E0A', red: '#C8473A' },
        warn: { DEFAULT: '#8A5A00', bg: '#FFF1D6' },
        bad: { DEFAULT: '#A11712', bg: '#FBE3E0' },
        over: { DEFAULT: '#3B3833', bg: '#E6E0D5' },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
    },
  },
  plugins: [],
};
