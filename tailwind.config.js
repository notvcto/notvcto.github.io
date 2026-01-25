module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      "ub-grey": "var(--ub-grey)",
      "ub-warm-grey": "var(--ub-warm-grey)",
      "ub-cool-grey": "var(--ub-cool-grey)",
      "ub-orange": "var(--ub-orange)",
      "ub-lite-abrgn": "var(--ub-lite-abrgn)",
      "ub-med-abrgn": "var(--ub-med-abrgn)",
      "ub-drk-abrgn": "var(--ub-drk-abrgn)",
      "ub-window-title": "var(--ub-window-title)",
    }),
    textColor: (theme) => ({
      ...theme("colors"),
      "ubt-grey": "#F6F6F5",
      "ubt-warm-grey": "var(--ub-warm-grey)",
      "ubt-cool-grey": "var(--ub-cool-grey)",
      "ubt-blue": "#3465A4",
      "ubt-green": "#4E9A06",
    }),
    borderColor: (theme) => ({
      ...theme("colors"),
      DEFAULT: theme("colors.gray.300", "currentColor"),
      "ubb-orange": "var(--ub-orange)",
    }),
    minWidth: {
      0: "0",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
    minHeight: {
      0: "0",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
    extend: {
      zIndex: {
        "-10": "-10",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
