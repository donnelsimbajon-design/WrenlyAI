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
          background: '#0D0D0D',
          surface: '#1A1A2E',
          primary: '#00C896',
          accent: '#6C63FF',
          warning: '#F5A623',
          danger: '#FF4757',
          text: '#FFFFFF',
          textSecondary: '#A0A0B0',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
