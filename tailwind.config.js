/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        warm: {
          50: '#fffaf3',
          100: '#fff3e0',
          200: '#ffe0b3',
          300: '#ffc97a',
          400: '#ffa53d',
          500: '#f97e1a',
          600: '#e0630d',
          700: '#b44a0a',
          800: '#7d340b',
          900: '#4d2007',
        },
        terracotta: {
          50: '#fdf4f0',
          100: '#fae5dc',
          200: '#f4cab8',
          300: '#e9a786',
          400: '#dc7d54',
          500: '#c95e36',
          600: '#a8472a',
          700: '#823822',
          800: '#5c2a1a',
          900: '#3a1b11',
        },
        olive: {
          50: '#f7f8f0',
          100: '#ecefd9',
          200: '#d7dfa9',
          300: '#bbca77',
          400: '#9fb052',
          500: '#7d923b',
          600: '#5f712d',
          700: '#465526',
          800: '#313a1e',
          900: '#1a1f10',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f2',
          200: '#f9f0e1',
          300: '#f2e4cd',
          400: '#e7d2b1',
          500: '#d4ba8f',
        },
        charcoal: {
          700: '#3d3328',
          800: '#2a231c',
          900: '#1a1612',
        },
      },
      boxShadow: {
        warm: '0 8px 30px -8px rgba(224, 99, 13, 0.25)',
        card: '0 2px 16px -4px rgba(61, 51, 40, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-warm': 'pulseWarm 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseWarm: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
