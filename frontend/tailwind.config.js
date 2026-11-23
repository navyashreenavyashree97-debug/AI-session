/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#071811',
          900: '#0c261b',
          850: '#103224',
          800: '#143d2b',
          700: '#1c523b',
          600: '#256b4e',
          100: '#e5f3ec',
          50: '#f0f8f4',
        },
        brandlime: {
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        bloom: {
          remember: '#3B82F6',    // Blue
          understand: '#10B981',  // Emerald Green
          apply: '#F59E0B',       // Amber
          analyze: '#EC4899',     // Pink
          evaluate: '#8B5CF6',    // Purple
          create: '#EF4444'       // Crimson Red
        }
      },
      boxShadow: {
        // Tailwind v3 ships shadow-sm but not shadow-xs; define it here
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
