import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
	rollupOptions: {
		input: {
		  main: 'index.html',
		  watchlist: 'public/watchlist.html',
		},
	},
  },
});
