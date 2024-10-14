import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, filename: 'bundle-visualization.html' })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    rollupOptions: {
      treeshake: true  // Ensure tree shaking is enabled
    }
  },
  server: {
    host: true, // Needed for running on devcontainers. 
  },
});
