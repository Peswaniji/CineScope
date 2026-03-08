/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brandBg: '#040711',
        brandSurface: '#0f172a',
        brandElevated: '#1e293b',
        brandPrimary: '#22d3ee',
        brandAccent: '#f97316',
      },
      boxShadow: {
        glow: '0 10px 35px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
};
