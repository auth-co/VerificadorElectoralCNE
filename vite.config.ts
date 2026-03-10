import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
  const cneColorPlugin = {
    name: 'cne-theme-color',
    generateBundle(_: unknown, bundle: Record<string, { type: string; code?: string; source?: string | Uint8Array }>) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && typeof chunk.code === 'string') {
          chunk.code = chunk.code.replaceAll('#40376d', '#003e74').replaceAll('#40376D', '#003e74');
        } else if (chunk.type === 'asset' && typeof chunk.source === 'string') {
          chunk.source = chunk.source.replaceAll('#40376d', '#003e74').replaceAll('#40376D', '#003e74');
        }
      }
    },
  };

  return {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [react(), ...(mode === 'cne' ? [cneColorPlugin] : [])],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});