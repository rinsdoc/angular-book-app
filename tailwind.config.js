/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        card: "0 8px 20px rgba(0, 0, 0, 0.08)",
        "card-dark": "0 8px 20px rgba(0, 0, 0, 0.3)",
      },
      keyframes: {
        fadeIn: {
          '0%': {opacity: '0'},
          '100%': {opacity: '1'},
        },
        slideIn: {
          '0%': {transform: 'translateX(100%)', opacity: '0'},
          '100%': {transform: 'translateX(0)', opacity: '1'},
        },
        slideUp: {
          '0%': {transform: 'translateY(20px)', opacity: '0'},
          '100%': {transform: 'translateY(0)', opacity: '1'},
        },
        pulse: {
          '0%': {boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'},
          '50%': {boxShadow: '0 8px 30px rgba(244, 67, 54, 0.4)'},
          '100%': {boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'},
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-in-out',
        pulse: 'pulse 2s infinite',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "#9d46ff",
          dark: "#0a00b6",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          primary: {
            light: "#212121",
            dark: "#e1e1e1",
          },
          secondary: {
            light: "#757575",
            dark: "#a0a0a0",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      }
    },
    plugins: [],
  }
}
