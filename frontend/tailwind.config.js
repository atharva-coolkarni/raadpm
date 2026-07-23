/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--canvas))",
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",
        line: "hsl(var(--line))",
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          subtle: "hsl(var(--ink-subtle))",
        },
        navy: {
          900: "#0B1626",
          800: "#0F1E33",
          700: "#16293F",
          600: "#1E3A57",
          500: "#2A4E70",
        },
        brand: {
          50: "#EFF5FF",
          100: "#DBE8FE",
          200: "#BFD6FE",
          400: "#5B8DEF",
          500: "#2F6FED",
          600: "#1D56D6",
          700: "#1B45A8",
        },
        critical: { soft: "#FEE9E7", base: "#D92D20", deep: "#912018" },
        high: { soft: "#FEF0E1", base: "#DC6803", deep: "#93370D" },
        medium: { soft: "#FEF7E0", base: "#B54708", deep: "#7A2E0E" },
        low: { soft: "#E9F5EE", base: "#067647", deep: "#054F31" },
        info: { soft: "#EAF1FE", base: "#1D56D6", deep: "#1B45A8" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
        raised: "0 4px 12px -2px rgba(16, 24, 40, 0.10), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
        panel: "0 12px 32px -8px rgba(16, 24, 40, 0.18)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 240ms ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
