/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arch: {
          50: '#FAF9F6',
          100: '#F4F1EA',
          200: '#E8E3D7',
          300: '#D6CFC0',
          400: '#ABA18E',
          500: '#847A69',
          600: '#5E5649',
          700: '#3D372E',
          800: '#23201B',
          900: '#141310',
          accent: '#A37A4C',
          accentDark: '#855E33',
          terracotta: '#A65B45',
          slate: '#404B52',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
