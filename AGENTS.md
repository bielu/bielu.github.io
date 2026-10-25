# AGENTS.md

Guidance for AI coding agents working in this repository. See [README.md](./README.md) for what the site does.

## What this project is

The Astro static site behind [bielu.pl](https://bielu.pl): a landing page that showcases the bielu .NET
projects with live NuGet figures, collected at build time. It links into
[packages.bielu.pl](https://packages.bielu.pl) (repo `bielu/Bielu.EcoSystem`), which lists every package.
This repo owns the design tokens that packages.bielu.pl mirrors; both repos share the same stack and rules.

## Layout

| Path | Purpose |
|------|---------|
| `src/lib/nuget.ts` | NuGet search API client: fetch + normalise into `Package` (shared with packages.bielu.pl) |
| `src/lib/projects.ts` | Showcased projects, flagship copy and upstream contributions, the only hand-maintained data |
| `src/lib/project-icons.ts` | Names of the hand-drawn icons in `src/assets/project-icons/` (SVG, frame included) |
| `src/lib/illustrations.ts` | Flat fallback illustrations for projects without an icon |
| `src/lib/showcase.ts` | Pure logic: matching packages to projects, totals, formatting, install commands, URLs |
| `src/lib/gravatar.ts` | Build-time Gravatar download, inlined as a data URI |
| `src/lib/data.ts` | Memoised build-time showcase and avatar |
| `src/components/` | `ProjectTile` (one project tile) and `ProjectArt` (icon / illustration / NuGet image) |
| `src/pages/index.astro` | The landing page |
| `src/styles/global.css` | Design tokens and base styles |
| `test/` | Vitest unit tests for `src/lib` |

## Conventions

- **Keep logic in `src/lib`, keep pages thin.** Anything testable (matching, formatting, URLs) is a pure
  function in `src/lib` with tests. `.astro` files only render.
- **Figures are never hand-written.** Package counts, downloads and versions come from NuGet at build time.
  The only hand-kept figure is `UPSTREAM_PRS_MERGED`.
- **Showcasing a project:** add it to `PROJECTS` in `projects.ts`. Reuse the packages.bielu.pl family slug
  so its links land on the right family. The longest matching prefix wins, so declaration order is only
  display order. Keep slugs unique, which a test enforces.
- **Never publish the Gravatar email or its hash.** It is a short, guessable address, so its hash is as
  good as the address. Read it only from `GRAVATAR_EMAIL` at build time and keep the avatar inlined;
  don't link to gravatar.com or commit the address anywhere.
- **Shared code with packages.bielu.pl:** `nuget.ts`, `illustrations.ts`, the icons and the tokens in
  `global.css` are copies. Change them in both repos together.
- **Design:** reuse the tokens in `global.css` and support light and dark themes. Layouts must work at
  phone width with no horizontal scroll.
- **Formatting:** follow [`.editorconfig`](./.editorconfig) (2 spaces, LF, final newline).
- **Tests:** Vitest, using `Method_Scenario_ExpectedResult` names and Arrange / Act / Assert comments.
  No network calls in tests; pass a fake `fetch` to `fetchPackages`.

## Engineering principles

- **SOLID:** single-purpose modules (fetching, curation and matching stay separate), and dependencies are
  injected where it matters (`fetchPackages(fetchImpl)`, `buildShowcase(packages, projects)`).
- **DRY:** shared styling lives in `global.css` and shared logic in `showcase.ts`. Don't duplicate either
  in pages.
- **KISS:** use static output and a few lines of vanilla JS for interactivity. No UI framework or extra
  dependencies without a real need.

## Code coverage

Target **70%+ line coverage** for `src/lib`. `npm run test:coverage` enforces it.

## Before opening a PR

1. `npm test` passes, and `npm run test:coverage` meets the threshold.
2. `npm run build` succeeds (it runs `astro check` first).
3. Preview the built site locally (`npm run preview`) and check the change visually, in light and dark.
4. Update `README.md` / `AGENTS.md` when behaviour or structure changes.
5. Work on a branch and target `main`. CI tests and builds every PR; merging to `main` deploys and
   purges the Cloudflare cache.
