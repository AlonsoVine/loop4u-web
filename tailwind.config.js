/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    // Colores usados por categorías (semilla y comunes)
    'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-lime-500',
    'bg-violet-500', 'bg-indigo-500', 'bg-rose-500', 'bg-neutral-400',
  ],
  plugins: [],
};
