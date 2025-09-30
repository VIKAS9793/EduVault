/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3F51B5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',
        },
        accent: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#FF9933',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        accessible: {
          focus: '#FF9933',
          error: '#E53935',
          success: '#16a34a',
          warning: '#f57c00',
        },
        neutral: {
          light: '#F5F5F5',
          white: '#FFFFFF',
        },
      },
      fontSize: {
        'accessible-base': ['18px', { lineHeight: '1.5' }],
        'accessible-lg': ['20px', { lineHeight: '1.6' }],
        'accessible-xl': ['24px', { lineHeight: '1.4' }],
      },
      fontFamily: {
        sans: ['Roboto', 'Noto Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
