# CMS Conf EmDash Workshop

**Ship, Automate, Extend: A Hands-On EmDash CMS Workshop** · CMS Conf 2026 · Matt Kane & Harshil Agrawal

In this two-hour workshop, you'll go from zero to a fully deployed, agent-powered CMS site, and learn how to extend it with your own plugins.
We'll start by deploying an EmDash blog to production, covering configuration, content modeling, and the deployment pipeline. From there, we'll explore EmDash's agentic capabilities, using AI agents to generate, enrich, and manage content without manual busywork. Finally, we'll roll up our sleeves and build a custom plugin, covering the plugin lifecycle, APIs, and how to package and ship your extension.
By the end of the session, you'll have a live blog, a working understanding of EmDash's agent features, and a custom plugin you built yourself.

---

## The attendee guide

This repo is the workshop's step-by-step guide. It's an EmDash site on Cloudflare Workers, D1 and R2: the steps live in the CMS, so we can fix a prompt or a callout in the admin (or from an agent over MCP) during the session, without a redeploy. The structure follows the [Worker Previews workshop](https://worker-previews-workshop.thomas-development.workers.dev/): most steps are a prompt attendees paste into their coding agent, plus **You do this** boxes for the parts a person has to do (passkeys, consent screens, the admin).

```bash
pnpm install
pnpm dev        # http://localhost:4321, admin at /_emdash/admin
pnpm build
pnpm deploy     # build + wrangler deploy
```

**Local content:** on a fresh local database, open `http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/` once. It signs you in as a dev admin and loads the guide from `seed/seed.json`. To start over, stop the dev server and delete `.wrangler/state`.

### Deploying

1. `pnpm deploy`. The first deploy creates the D1 database `emdash-workshop`, the R2 bucket `emdash-workshop-media`, a KV namespace for sessions, and the Worker. If your Wrangler login has more than one account, set `CLOUDFLARE_ACCOUNT_ID` (or add `account_id` to `wrangler.jsonc` locally).
2. **Straight away**, open `/_emdash/admin` on the deployed URL and run the setup wizard. The first person to finish it becomes the admin. Keep **Sample content** on: that's what loads the guide from the seed. Until then, the page shows an empty state.

### Where things live

| Where | What it holds |
| --- | --- |
| Admin → **Parts** | The four part headers: label, time, lede, concepts, and a `body` of blocks (the Part 3 comparison and stage callout). `break_before` puts the break separator above a part |
| Admin → **Steps** | Every step card: number, rail label, part, lede, tag, and a `body` of blocks. `position` sets the order. A step with no part (the finale) goes at the end, outside the rail |
| `seed/seed.json` | The schema (collections and block types) and the starting content. Applied once, by the setup wizard. `npx emdash export-seed --with-content` only reads a local database, so to refresh it from the live site, copy each part's and step's `data` from `npx emdash content get <collection> <slug> --raw --json -u <site URL>`, then check it with `npx emdash seed seed/seed.json --validate` |
| `src/data/workshop.ts` | Event details, the public checkpoints repo, placeholder DID, folder names, links, the run of show, and the `{{explain}}`, `{{narrate}}` and `{{mcpOnly}}` prompt snippets |
| `src/data/scopes.ts` | The consent-screen scopes, worded exactly as EmDash shows them |
| `src/pages/index.astro` | Loads parts and steps and lays out the page |
| `src/components/GuideBlocks.astro`, `src/components/blocks/` | One renderer per block type |
| `src/components/` | `StepCard`, `Prompt`, `Callout`, `Compare`, `Consent` (scope checklist), `Checkpoint`, `StepNav`, … |
| `src/styles/global.css` | The whole design system: light-only, Inter, EmDash's orange accent |
| `src/scripts/` | `guide.ts` (copy buttons, prompt expand, disclosures, the top bar) and `rail.ts` (scrollspy, progress, the mobile step menu) |
| `src/lib/halftone.ts`, `public/brand/` | The part headers' halftone art (the same generator and seeds as the slides) and the EmDash logos |
| `slides/` | The Slidev deck for the concept blocks (see `slides/README.md`) |

### Editing content

- **Block types** in a step's `body`: Prompt, Callout (`success`, `look`, `you`, `warn`, `restart`, `stage`), Facts, Comparison, Consent screen, Code, Checkpoint, Aside, Link cards, Heading and Text.
- **Placeholders**: any text can use `{{workspaceDir}}`, `{{siteDir}}`, `{{pluginDir}}`, `{{pluginSlug}}`, `{{repo}}`, `{{repoUrl}}`, `{{placeholderDid}}`, `{{event}}`, `{{explain}}`, `{{narrate}}` and `{{mcpOnly}}`. They're filled from `workshop.ts` when the page renders, so changing the repo there updates every prompt. An unknown placeholder shows up as-is on the page.
- **Short text fields** (ledes, facts, comparison rows, concepts, hints, checkpoint summaries) take `` `code` ``, `**bold**`, `_italic_` and `[links](https://…)`. Rich text fields (callout and aside bodies) use the editor.
- **Signed in?** Every part and step on the page shows an **Edit in admin** link.
- Parts and steps have drafts and revisions: save a draft to try a change, publish when it's right.

### The checkpoint repo

The public repo [`harshil1712/emdash-workshop`](https://github.com/harshil1712/emdash-workshop) (set as `repo` in `src/data/workshop.ts`) has the three checkpoint branches. The starter and catch-up prompts fetch from it with `giget`, which only works on public repos. Each branch is the site at the root, scaffolded on EmDash 1.4.0 with the current Blog template:

- `checkpoint-a`: step 4's featured post card (`src/pages/index.astro`, `src/components/PostCard.astro`), and `featured`/`subtitle` in `emdash-env.d.ts`.
- `checkpoint-b`: plus step 8's Related posts (`src/pages/posts/[slug].astro`), and the `cover-images/` starter: `emdash-plugin init` 0.13.5, a Block Kit settings page, the editor-action wiring and a test. `emdash ^1.4.0` and `@emdash-cms/plugin-test ^0.2.11` are dev dependencies only, so `pnpm add file:../cover-images` doesn't install a second copy of EmDash.
- `checkpoint-c`: the finished plugin, with tests for the publish rule.

To rebuild a checkpoint, change the code on its branch and push. Keep `src/` and `emdash-env.d.ts` self-contained: the catch-up prompts copy only those (and `cover-images/`).

The placeholder publisher DID `did:plc:cmsconf2026workshop` passes validate, bundle and the tests on `checkpoint-c`; only `emdash-plugin publish` needs a real Atmosphere account.

### Known upstream issues (EmDash 1.4.0)

- `WhereValue` doesn't accept `boolean`, but the runtime does. Step 4 casts around it.
- `emdash types --url` writes standalone types that don't augment `EmDashCollections`. Step 4 copies the fields into `emdash-env.d.ts` by hand.
- `scopes_supported` doesn't list per-plugin `mcp:tools:<id>` scopes, so MCP clients can't ask for them. Step 15 uses `mcp:tools` instead.

### Design notes

- **Agent as developer** asks for a "Related posts" section instead of reading time, because the Blog template already shows reading time.
- **`EMDASH_ENCRYPTION_KEY`** is set during the first deploy (step 2), not in Part 3, which removes a risk from Part 3. Step 14 checks it again.
- **Scaffolding** uses `create-emdash` flags (`--template cloudflare:blog --pm pnpm --install --no-sandboxed-plugins`), so the agent can run it without interactive prompts.
- **Step 15** asks for `mcp:tools`, not `mcp:tools:cover-images`. The consent screen only lists the scopes the client asks for, and MCP clients ask for what `scopes_supported` lists, which doesn't include per-plugin scopes.
- **Step 12** names the route permission, `content:edit_any`, instead of asking for "the narrowest edit permission". Since EmDash 1.3.0 the narrowest is `content:edit_own_drafts` (Contributor), and plugin routes check only the role, not ownership or status.
- **Step 3** has no separate sign-in step: since EmDash 1.3.0 the setup wizard signs the new admin in after passkey registration.
- **Step 3** has an "Admin in Polish?" aside: the admin follows the browser language, and EmDash 1.4.0 completed the Polish translation.
- **`generateCover`** returns early when a post already has a cover. That makes the MCP tool safe to call twice and means it doesn't need `destructive: true`. Because `ctx.content.get` returns the saved post and not a pending draft, it reads the draft with `ctx.content.getRevision` when there is one, so a cover it staged (or an editor removing one) counts. That needs the `content:revisions:read` capability, so the trust contract has five capabilities. (An earlier version kept a KV note of staged covers, which could return a cover an editor had since removed.)
- **Step 14** tells attendees to bump the plugin's `version` before every rebuild: EmDash caches sandboxed plugins by ID and version, so a redeploy with the same version keeps running the old code.
- **Step 15** tells the agent to call `generateCover` for a missing cover, retry once if it fails, and otherwise stop. The earlier "fix the cause with the tools you have" let an agent attach library photos to get past the rule.
- **Step 12** adds `zod` at the exact version EmDash uses (4.5.4 in EmDash 1.4.0). `pnpm add zod` installs a newer 4.x, and the MCP tool's `input` schema then fails typecheck.
- **Step 14** doesn't ask attendees to switch the plugin on or check its hosts: a plugin registered in `astro.config.mjs` starts enabled on both plans, and the Plugins page lists capabilities but not allowed hosts (only the registry install dialog shows those).
