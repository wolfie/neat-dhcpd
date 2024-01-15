import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import child_process from 'child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    version: {
      name: child_process.execSync('git rev-parse HEAD').toString().trim(),
    },

    // TODO _ideally_ this would not be needed, and the sveltekit ORIGIN would be resolved properly
    // but this is nontrivial to reliably set up in a UX-friendly way. Basically, we'd need to help
    // with the answer "what will you see in the browser's address bar when you submit the form, but only
    // the root part, not the entire path." 😵
    csrf: {
      checkOrigin: false,
    },
    alias: {
      '@neat-dhcpd/common': '../common/src',
    },
  },
};

export default config;
