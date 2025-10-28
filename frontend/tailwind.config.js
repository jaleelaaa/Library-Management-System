/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FOLIO color palette
        'folio': {
          'primary': '#106BA3',
          'secondary': '#F0F0F0',
          'accent': '#FFB900',
          'success': '#008A00',
          'warning': '#FFC72C',
          'danger': '#D32F2F',
          'info': '#2196F3',
          'dark': '#333333',
          'light': '#F5F5F5',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
