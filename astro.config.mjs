// @ts-check
import { defineConfig } from 'astro/config';

// bielu.pl is the apex domain bound by public/CNAME, so no `base` path is needed.
export default defineConfig({
  site: 'https://bielu.pl',
  trailingSlash: 'ignore',
});
