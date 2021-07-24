import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/github-contributors-map/' : undefined,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    }
  };
});
