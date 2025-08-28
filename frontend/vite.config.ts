import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      external: [
        /\.test\.tsx?$/,
        /\.spec\.tsx?$/,
        /__tests__\//,
        /__mocks__\//,
      ],
    },
  },
});
