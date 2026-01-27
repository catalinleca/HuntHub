/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--hh-primary-main)',
          dark: 'var(--hh-primary-dark)',
          light: 'var(--hh-primary-light)',
        },
        accent: {
          DEFAULT: 'var(--hh-accent-main)',
          light: 'var(--hh-accent-light)',
          dark: 'var(--hh-accent-dark)',
        },
        background: {
          DEFAULT: 'var(--hh-background-default)',
          paper: 'var(--hh-background-paper)',
          surface: 'var(--hh-background-surface)',
        },
        foreground: {
          DEFAULT: 'var(--hh-text-primary)',
          muted: 'var(--hh-text-secondary)',
        },
        divider: 'var(--hh-divider)',
      },
      boxShadow: {
        warm: 'var(--hh-shadow-md)',
        'warm-lg': 'var(--hh-shadow-lg)',
      },
      fontFamily: {
        display: ['var(--hh-font-display)'],
        body: ['var(--hh-font-body)'],
      },
      borderRadius: {
        sm: 'var(--hh-radius-sm)',
        DEFAULT: 'var(--hh-radius-md)',
        md: 'var(--hh-radius-md)',
        lg: 'var(--hh-radius-lg)',
        xl: 'var(--hh-radius-xl)',
        '2xl': 'var(--hh-radius-2xl)',
      },
    },
  },
  plugins: [],
};
