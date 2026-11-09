# Workshop slides

[Slidev](https://sli.dev) deck for the concept blocks. The hands-on steps stay in the guide; these slides are for explaining.

```bash
cd slides
pnpm install
pnpm dev       # http://localhost:3030, presenter view at /presenter
pnpm build     # static SPA in dist/
pnpm export    # slides-export.pdf (uses playwright-chromium)
pnpm deploy    # build + wrangler deploy
```

**Deployed** to the Employee Account (same as the guide) at https://emdash-workshop-slides.h-demo.workers.dev. It's a static-assets Worker (`wrangler.jsonc`) with SPA fallback, so `/12` and `/presenter` work. The deploy script deletes Slidev's Netlify-style `dist/_redirects`, which Workers rejects as an infinite loop.

| File | Section | Presenter |
| --- | --- | --- |
| `slides.md` | Cover, and the imports below | Both |
| `pages/01-intro.md` | 1 · Introduction to EmDash: promise, architecture, content model | Both / Harshil |
| `pages/02-workshop.md` | 2 · How the workshop runs: run of show, the guide, checkpoints, tracks, setup check | Harshil |
| `pages/03-agents.md` | 3 · How EmDash works with agents (Part 2): MCP, CLI, skills, scopes and roles, guardrail | Harshil |
| `pages/04-plugins.md` | 4 · Plugins in EmDash (Part 3): the problem, trust contract, sandbox, live demo, the build, payoff | Matt |
| `pages/05-close.md` | Contributions slide, stays up during Q&A | Both |

Built-in Slidev layouts and the default theme only, no custom CSS. One idea per slide; lists reveal one item per click. Speaker notes are in the `<!-- -->` comment at the end of each slide.

The guide URL on "The guide is your workshop" is public, and the placeholder DID is final.
