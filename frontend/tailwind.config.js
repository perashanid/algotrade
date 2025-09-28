/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'bg-brand-950',
    'bg-brand-900',
    'bg-brand-850',
    'bg-brand-800',
    'bg-brand-700',
    'border-brand-800',
    'border-brand-850',
    'from-brand-950',
    'via-brand-900',
    'to-brand-950',
    'from-brand-850',
    'to-brand-800',
    'hover:bg-brand-850',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDF2FB',
          100: '#E2EAFC',
          200: '#D7E3FC',
          300: '#CCDBFD',
          400: '#C1D3FE',
          500: '#B6CCFE',
          600: '#ABC4FF',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        brand: {
          50: '#EDF2FB',   // Lightest blue - backgrounds only
          100: '#E2EAFC',  // Very light blue - backgrounds
          200: '#D7E3FC',  // Light blue - backgrounds
          300: '#CCDBFD',  // Medium light blue - backgrounds
          400: '#C1D3FE',  // Medium blue - backgrounds
          500: '#B6CCFE',  // Medium blue - backgrounds
          600: '#ABC4FF',  // Primary blue - buttons, accents
          700: '#6B8DD6',  // Darker blue - readable text
          800: '#4A6FA5',  // Much darker blue - dark mode backgrounds
          900: '#2A4F85',  // Very dark blue - dark mode backgrounds
          950: '#1A3A65',  // Darkest blue - dark mode backgrounds
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}