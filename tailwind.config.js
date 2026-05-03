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
        wrenly: {
          background: '#F5F7F9',
          surface: '#FFFFFF',
          surfaceSecondary: '#F1F4F5',
          primary: '#006D5B',
          accent: '#6C63FF',
          warning: '#F5A623',
          danger: '#FF4757',
          text: '#2C3E50',
          textSecondary: '#7F8C8D',
          border: '#E0E6ED',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
