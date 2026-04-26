/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './modules/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Wrenly AI brand palette
        navy: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          300: '#A5B4FC',
          500: '#1E3A8A',
          600: '#1E40AF',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#0F2257',
        },
        sky: {
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        wrenly: {
          primary:   '#1E3A8A', // Navy
          secondary: '#0EA5E9', // Sky blue
          accent:    '#38BDF8',
          bg:        '#FFFFFF',
          surface:   '#F8FAFC',
          muted:     '#94A3B8',
          border:    '#E2E8F0',
          error:     '#EF4444',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
