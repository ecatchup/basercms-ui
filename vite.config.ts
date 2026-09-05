/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import type { PreRenderedAsset } from 'rollup';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: (asset: PreRenderedAsset) => (asset.names?.[0]?.endsWith('.css') ? 'style.css' : '[name][extname]'),
      },
    },
  },
  // vitest@2.x が peerDependency として解決できる vite が ^5/^6 系のため、
  // node_modules 直下に vitest 専用の vite@5 系が二重インストールされる。
  // その結果「declare module 'vite'」による test オプションの型拡張が
  // ルートの vite@7 系の型とは別モジュール扱いとなり適用されない。
  // 実行時の挙動には影響がないため、この設定オブジェクト全体を any として渡す。
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
} as any);
