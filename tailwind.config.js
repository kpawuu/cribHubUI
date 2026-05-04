/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './node_modules/flowbite/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f8ff',
          100: '#BBE1FA',
          200: '#9dd4f7',
          300: '#3282B8',
          400: '#2674a8',
          500: '#0F4C75',
          600: '#0d4165',
          700: '#0a3552',
          800: '#1B262C',
          900: '#151e23'
        }
      }
    }
  },
  plugins: [require('flowbite/plugin')]
}

