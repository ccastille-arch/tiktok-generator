/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080d08',
        surface: '#0f1a0f',
        card: '#162216',
        border: '#1e3a1e',
        accent: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
          dim: '#15803d',
        },
        gold: '#f59e0b',
        danger: '#ef4444',
        text: {
          primary: '#f0faf0',
          secondary: '#86a986',
          muted: '#4a6e4a',
        },
      },
      fontFamily: {
        display: ['Impact', 'Arial Black', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
