import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Not part of the 2026-10-04 export: the build setup used to render the kb outside the support repo.
export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        vitePreprocess(),
        mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } }),
      ],
      adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
      prerender: { entries: ['*'], handleHttpError: 'warn' },
    }),
  ],
});
