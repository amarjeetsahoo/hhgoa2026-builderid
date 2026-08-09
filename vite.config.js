import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Generates relative asset paths so the app works on subfolders (like GitHub Pages) as well as main domains
});
