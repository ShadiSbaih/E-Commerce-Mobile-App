/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#64748B',
        disabled: '#94A3B8',
        background: '#F8FAFC',
        surface: '#F8FAFC',
        'surface-muted': '#E9EEF6',
        'nimbus-blue': '#DDE6F7',
        accent: '#8298C8',
        border: '#E2E8F0',
      }
    },
  },
  plugins: [],
}
