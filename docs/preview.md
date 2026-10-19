# Preview the exported site

Run `pnpm build`, then `pnpm start` to serve the generated `out` directory at
http://localhost:3000. This uses the same static files deployed to GitHub Pages,
including extensionless blog and wishlist routes.

Use `pnpm dev` for development. `next start` cannot serve a Next.js static export.

Run `pnpm lint` and `pnpm check:unit` for source checks. With the preview running,
run `pnpm check:browser` to check page behavior and the sphere camera in Chrome.
Install its browser first with `pnpm exec puppeteer browsers install chrome`.
