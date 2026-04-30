import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://invoicepass.app',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
