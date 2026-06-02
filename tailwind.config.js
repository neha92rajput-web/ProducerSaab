/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        'cream-dark': '#F0EBE3',
        gold: '#C5A880',
        'gold-dark': '#B8986E',
        charcoal: '#111111',
        'charcoal-light': '#333333',
        'border-soft': '#E8E2D9',
        'text-primary': '#111111',
        'text-secondary': '#777777',
        'text-muted': '#AAAAAA',
      },
    },
  },
  plugins: [],
}
