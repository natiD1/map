/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        // This tells the browser: "Try Palatino. If not found, try Georgia. 
        // If not found, try Times. If none are found, use any available serif font."
        'classic': ['Raleway', 'sans-serif'],
        'classicc': ['Lora', 'serif'],
        'one': ['Playwrite CA', 'cursive'],
        'two': ['Ojuju', 'sans-serif'],
        'three': ['Lobster', 'sans-serif'],
        'four': ['Ultra', 'serif'],
        'classic-system': ['Palatino', 'Palatino Linotype', 'Georgia', '"Times New Roman"', 'serif']

      }
    },
  },
  plugins: [],
}