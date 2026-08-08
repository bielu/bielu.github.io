# bielu.github.io

Personal landing page for [bielu.pl](https://bielu.pl), served by GitHub Pages.

A single static `index.html` — no build step, no dependencies, light/dark aware.

## Deploying

GitHub Pages serves this repo from the `main` branch root. The `CNAME` file binds
the apex domain `bielu.pl`.

### DNS records required

Point the apex at GitHub Pages' anycast IPs:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `bielu.github.io.` |

Then enable **Enforce HTTPS** in the repo's Pages settings once the certificate is issued.

Docs subdomains (e.g. `apidescriptions.bielu.pl`) stay independent — they CNAME to
`bielu.github.io` and are routed by their own project's `CNAME` file.
