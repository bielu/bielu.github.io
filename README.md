# bielu.github.io

Source for [bielu.pl](https://bielu.pl), the personal landing page of Arkadiusz Biel. It showcases the projects
of the bielu .NET ecosystem with live NuGet figures and links into the full catalogue at
[packages.bielu.pl](https://packages.bielu.pl) ([bielu/Bielu.EcoSystem](https://github.com/bielu/Bielu.EcoSystem)).
Built with [Astro](https://astro.build) and served by GitHub Pages behind Cloudflare.

## How it works

- **Collection.** At build time the site queries the NuGet search API for every package owned by `bielu`
  (`src/lib/nuget.ts`, the same client packages.bielu.pl uses). Nothing is committed: a nightly scheduled
  build keeps package counts, downloads and versions current.
- **Showcase.** `src/lib/projects.ts` lists the featured projects. A package belongs to the project with the
  **longest** matching id prefix (`src/lib/showcase.ts`), which supplies each tile's package count,
  downloads and latest version. Project slugs match packages.bielu.pl family slugs, so every tile links
  to its family there (`https://packages.bielu.pl/#<slug>`).
- **Avatar.** The Gravatar picture is downloaded at build time (`src/lib/gravatar.ts`) and inlined as a
  data URI. The email comes from the `GRAVATAR_EMAIL` secret and never appears in the repo or on the page,
  not even as a Gravatar hash. Without it the hero shows initials.
- **Page.** `/` shows the hero with live totals, the flagship (API descriptions) with an install snippet
  and its parts, infrastructure and library projects, the most downloaded packages, a link to the
  ecosystem, upstream contributions and older work.

## Development

Requires Node.js 22+.

```bash
npm ci
npm run dev            # http://localhost:4321
npm test               # unit tests
npm run test:coverage  # with coverage (70% line threshold)
npm run build          # astro check + static build into dist/
npm run preview        # serve dist/
```

## Deploying

`.github/workflows/deploy.yml` tests and builds on every PR, and deploys to GitHub Pages on pushes to
`main`, nightly, and on manual dispatch. After each deploy it purges the page URLs from Cloudflare's
cache; assets under `/_astro/` have content-hashed names, so they never need purging.

One-time setup:

1. Repo **Settings → Pages → Source**: *GitHub Actions*.
2. Pages custom domain `bielu.pl` (bound by `public/CNAME`), then **Enforce HTTPS**.
3. Repo secrets for the cache purge (the step is skipped with a warning while they are missing):
   - `CLOUDFLARE_API_TOKEN`: an API token with **Zone → Cache Purge → Purge** on the `bielu.pl` zone.
   - `CLOUDFLARE_ZONE_ID`: the zone ID from the Cloudflare dashboard overview.
4. Repo secret `GRAVATAR_EMAIL`: the email of the Gravatar account (optional; initials are shown without it).
   Locally, set it in the environment before `npm run dev` / `npm run build` to see the avatar.

### DNS records

Point the apex at GitHub Pages' anycast IPs:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `bielu.github.io.` |

Subdomains (e.g. `packages.bielu.pl`, `apidescriptions.bielu.pl`) stay independent: they CNAME to
`bielu.github.io` and are routed by their own project's `CNAME` file.
