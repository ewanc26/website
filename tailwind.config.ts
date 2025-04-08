import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#e7f0e7',
            a: {
              color: '#8bd5a0',
              '&:hover': {
                color: '#b7e6c4',
              },
            },
            h1: {
              color: '#e7f0e7',
            },
            h2: {
              color: '#e7f0e7',
            },
            h3: {
              color: '#e7f0e7',
            },
            h4: {
              color: '#e7f0e7',
            },
            h5: {
              color: '#e7f0e7',
            },
            h6: {
              color: '#e7f0e7',
            },
            strong: {
              color: '#e7f0e7',
            },
            code: {
              color: '#e7f0e7',
              backgroundColor: '#1e3025',
              borderRadius: '0.25rem',
              padding: '0.1rem 0.3rem',
            },
            blockquote: {
              color: '#c9e8d3',
              borderLeftColor: '#3b574a',
              backgroundColor: '#1e3025',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '0.5rem 1rem',
            },
            '.task-list-item': {
              'list-style-type': 'none'
            },
            '[type="checkbox"]': {
              'border-radius': '5px',
              'border-color': '#3b574a',
            },
            'img': {
              'border-style': 'solid',
              'border-color': '#3b574a',
              'border-width': '1px',
              'border-radius': '1em'
            },
            hr: {
              borderColor: '#3b574a',
            },
            pre: {
              backgroundColor: '#1e3025',
              color: '#e7f0e7',
            }
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: '#1e3025',
            },
          }
        }
      },
    }
  },

  plugins: [forms, typography]
} satisfies Config;