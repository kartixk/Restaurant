/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FF5A00',
          hover: '#e85200',
          light: '#FFF7F5',
        }
      }
    },
  },
  safelist: [
    'lg:pl-24',
    'lg:pl-72',
    'w-24',
    'w-72',
  ],
  plugins: [],
}
