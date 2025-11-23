import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/hammer-surf-ramp-generator/',
  server: {
    port: 5173
  }
});

