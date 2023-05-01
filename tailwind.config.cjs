/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['"Rubik"', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'serif'],
    },
    extend: {
      fontSize: {
        xxs: ['0.625rem', '0.75rem']
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  darkMode: 'class',
};