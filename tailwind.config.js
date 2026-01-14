/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0b',
        card: '#121212',
        border: '#1e1e1e',
        text: '#eaeaea',
        accent: { DEFAULT: '#9333ea', 600: '#7e22ce' }
      }
    }
  }
}

