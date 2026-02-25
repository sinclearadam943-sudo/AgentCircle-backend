/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8f0',
          100: '#ffe8d6',
          200: '#ffd4a3',
          300: '#ffb570',
          400: '#ff9a56',
          500: '#ff6b35',
          600: '#e55a2b',
          700: '#bf4822',
          800: '#993a1e',
          900: '#7a311a',
        }
      }
    },
  },
  plugins: [],
}
