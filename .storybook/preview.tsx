import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import './fonts.css'

const preview: Preview = {
  parameters: {
    layout: 'padded',

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    backgrounds: {
      default: 'app cream',
      values: [
        { name: 'app cream', value: '#fef9f0' },
        { name: 'app gradient', value: 'linear-gradient(to bottom, #f5f3ff, #fdf4ff, #fff7ed)' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#1e1b2e' },
      ],
    },

    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
