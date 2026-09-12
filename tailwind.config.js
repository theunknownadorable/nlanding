/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,css,html}', './public/404.html'],
  theme: {
    extend: {
      fontFamily: {
        // Fraunces gives the display type its academic, slightly-old-book
        // warmth; Inter keeps long body copy quiet; JetBrains Mono handles
        // the terminal, the kickers and every label that wants to look
        // typeset rather than designed.
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
