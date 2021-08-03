import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import windicss from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/github-contributors-map/' : undefined,
    plugins: [vue(), windicss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    }
  };
});
