/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F4EF',
        card: '#FFFFFF',
        ink: { DEFAULT: '#121411', 2: '#2B2E29' },
        mute: '#646860',
        soft: '#8E928A',
        line: { DEFAULT: '#E3E4DD', strong: '#C9CBC2' },
        lime: { DEFAULT: '#C6F135', soft: '#EEFBC4', deep: '#5F8A00' },
        chart: { blue: '#4F63C9', green: '#6E9E0A', red: '#C8473A' },
        warn: { DEFAULT: '#8A5A00', bg: '#FFF1D6' },
        bad: { DEFAULT: '#A8322A', bg: '#FDE7E4' },
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
