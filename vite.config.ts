import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'src/main/main.ts',
        preload: 'src/main/preload.ts',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
