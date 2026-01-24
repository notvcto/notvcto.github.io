import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha Palette
        primary: "#b4befe", // Lavender
        secondary: "#cba6f7", // Mauve
        // Backgrounds
        "background-light": "#eff1f5", // Latte Base
        "background-dark": "#1e1e2e", // Mocha Base
        // Surface layers
        "surface-light": "#e6e9ef", // Latte Mantle
        "surface-dark": "#181825", // Mocha Mantle
        // Text
        "text-light": "#4c4f69", // Latte Text
        "text-dark": "#cdd6f4", // Mocha Text
        // Accents
        "subtext-dark": "#a6adc8",
        "overlay-dark": "#6c7086",
        "red-accent": "#f38ba8",
        "green-accent": "#a6e3a1",
        "yellow-accent": "#f9e2af",
        "blue-accent": "#89b4fa",
      },
      fontFamily: {
        display: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(180, 190, 254, 0.15)',
      }
    },
  },
  plugins: [],
}
export default config
