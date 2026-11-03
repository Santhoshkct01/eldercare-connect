/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Tamil"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#2563EB',
        secondary: '#14B8A6',
        accent: '#F59E0B',
        background: '#F8FAFC',
        cards: '#FFFFFF',
        success: '#16A34A',
        emergency: '#DC2626',
      },
    },
  },
  plugins: [],
}
