import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-family-display)', 'serif'],
        sans: ['var(--font-family-body)', 'sans-serif'],
        body: ['var(--font-family-body)', 'sans-serif'],
      },
      fontSize: {
        'fluid-hero': [
          'var(--text-fluid-hero)',
          { lineHeight: '1.15', letterSpacing: '-0.02em' },
        ],
        'fluid-brand': [
          'var(--text-fluid-brand)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        'fluid-headline-lg': [
          'var(--text-fluid-headline-lg)',
          { lineHeight: '1.25', letterSpacing: '-0.015em' },
        ],
        'fluid-title': [
          'var(--text-fluid-title)',
          { lineHeight: '1.3', letterSpacing: '-0.01em' },
        ],
        'fluid-lead': [
          'var(--text-fluid-lead)',
          { lineHeight: '1.6', letterSpacing: '-0.01em' },
        ],
        'fluid-body': ['var(--text-fluid-body)', { lineHeight: '1.6' }],
        'fluid-body-sm': ['var(--text-fluid-body-sm)', { lineHeight: '1.6' }],
        'fluid-label': [
          'var(--text-fluid-label)',
          { lineHeight: '1.4', letterSpacing: '-0.01em' },
        ],
        'fluid-badge': [
          'var(--text-fluid-badge)',
          { lineHeight: '1.4', letterSpacing: '0.01em' },
        ],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-on-primary)',
          container: 'var(--color-primary-container)',
          'on-container': 'var(--color-on-primary-container)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-on-secondary)',
          container: 'var(--color-secondary-container)',
          'on-container': 'var(--color-on-secondary-container)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          foreground: 'var(--color-on-tertiary)',
          container: 'var(--color-tertiary-container)',
        },
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-on-surface)',
          variant: 'var(--color-surface-variant)',
          'on-variant': 'var(--color-on-surface-variant)',
          container: 'var(--color-surface-container)',
          'container-low': 'var(--color-surface-container-low)',
          'container-high': 'var(--color-surface-container-high)',
          'container-highest': 'var(--color-surface-container-highest)',
        },
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outline-variant)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-on-error)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-on-warning)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-on-success)',
        },
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        medium: 'var(--shadow-medium)',
        hard: 'var(--shadow-hard)',
      },
    },
  },
  plugins: [],
};

export default config;

