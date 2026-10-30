/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F5F5',
        card: '#FFFFFF',
        ink: { DEFAULT: '#000000', 2: '#1F1F1F' },
        mute: '#5C5C5C',
        soft: '#8A8A8A',
        line: { DEFAULT: '#E6E6E6', strong: '#CFCFCF' },
        // L'Oréal palette. Swap in the exact values from the brand guidelines here.
        // Passionate Red: CTAs, active states, the L mark.
        brand: { DEFAULT: '#E4002B', soft: '#FDE6EA', deep: '#B8001F', text: '#FF3355' },
        // Eternal Gold: L recognition and achievements only.
        gold: { DEFAULT: '#B4975A', soft: '#F5EFE2', deep: '#7A6131', text: '#D2B77A' },
        chart: { blue: '#4F63C9', green: '#6E9E0A', red: '#C8473A' },
        warn: { DEFAULT: '#8A5A00', bg: '#FFF1D6' },
        bad: { DEFAULT: '#A11712', bg: '#FBE3E0' },
        over: { DEFAULT: '#4D4D4D', bg: '#EDEDED' },
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
