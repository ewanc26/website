import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--link-color)',
        'primary-hover': 'var(--link-hover-color)',
        background: 'var(--background-color)',
        text: 'var(--text-color)',
        card: 'var(--card-bg)',
        'header-footer': 'var(--header-footer-bg)',
        button: 'var(--button-bg)',
        'button-hover': 'var(--button-hover-bg)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text-color)',
            a: {
              color: 'var(--link-color)',
              '&:hover': {
                color: 'var(--link-hover-color)',
              },
            },
            h1: {
              color: 'var(--text-color)',
            },
            h2: {
              color: 'var(--text-color)',
            },
            h3: {
              color: 'var(--text-color)',
            },
            h4: {
              color: 'var(--text-color)',
            },
            h5: {
              color: 'var(--text-color)',
            },
            h6: {
              color: 'var(--text-color)',
            },
            strong: {
              color: 'var(--text-color)',
            },
            code: {
              color: 'var(--text-color)',
              backgroundColor: 'var(--background-color)',
              borderRadius: '0.25rem',
              padding: '0.1rem 0.3rem',
            },
            blockquote: {
              color: 'var(--text-color)',
              borderLeftColor: 'var(--button-bg)',
              backgroundColor: 'var(--background-color)',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '0.5rem 1rem',
            },
            '.task-list-item': {
              'list-style-type': 'none'
            },
            '[type="checkbox"]': {
              'border-radius': '5px',
              'border-color': 'var(--button-bg)',
            },
            'img': {
              'border-style': 'solid',
              'border-color': 'var(--button-bg)',
              'border-width': '1px',
              'border-radius': '1em'
            },
            hr: {
              borderColor: 'var(--button-bg)',
            },
            pre: {
              backgroundColor: 'var(--background-color)',
              color: 'var(--text-color)',
            }
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: 'var(--background-color)',
            },
          }
        }
      },
    }
  },

  plugins: [forms, typography]
} satisfies Config;