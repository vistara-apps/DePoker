import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(240, 10%, 4%)',
        surface: 'hsl(240, 10%, 8%)',
        primary: 'hsl(43, 96%, 50%)',
        accent: 'hsl(43, 96%, 60%)',
        success: 'hsl(120, 50%, 45%)',
        error: 'hsl(0, 70%, 50%)',
        'text-light': 'hsl(0, 0%, 95%)',
        'text-dark': 'hsl(0, 0%, 10%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '40px',
      },
      boxShadow: {
        'card': '0 8px 24px hsla(43, 96%, 50%, 0.12)',
        'inset': 'inset 0 2px 4px rgba(0,0,0,0.2)',
      },
      transitionTimingFunction: {
        'custom': 'cubic-bezier(0.22,1,0.36,1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
