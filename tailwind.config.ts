import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-green": "#14b822",
        "primary-navy": "#0a0e1a",
        "secondary-navy": "#161b2e",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "border-gray": "var(--border-gray)",
        "input-border": "var(--input-border)",
        "surface-light": "var(--surface-light)",
        "surface-white": "var(--surface-white)",
        "error-bg": "var(--error-bg)",
        "error-text": "var(--error-text)",
        "error-button": "#ef4444",
        "success-bg": "var(--success-bg)",
        "success-text": "var(--success-text)",
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
