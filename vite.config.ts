/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      // Restore React 19's missing findDOMNode for elemental atoms via react-onclickoutside.
      // Only matches the bare specifier `react-dom`; `react-dom/client`, `react-dom/server`,
      // and the shim's own `react-dom/index.js` fall through to the dedupe alias below.
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'src/polyfills/react-dom-with-findDOMNode.ts') },
      // Deduplicate React — force Elemental to use our project's React
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') }
    ]
  },
  optimizeDeps: {
    include: ['prop-types', 'react-modal']
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});