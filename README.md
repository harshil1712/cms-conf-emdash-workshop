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

1. `pnpm deploy`. The first deploy creates the D1 database `emdash-workshop`, the R2 bucket `emdash-workshop-media`, a KV namespace for sessions, and the Worker. With more than one Cloudflare account, add `account_id` to `wrangler.jsonc` first.
2. **Straight away**, open `/_emdash/admin` on the deployed URL and run the setup wizard. The first person to finish it becomes the admin. Keep **Sample content** on: that's what loads the guide from the seed. Until then, the page shows an empty state.
3. Invite the other speaker from **Users**.

### Where things live

| Where | What it holds |
| --- | --- |
| Admin → **Parts** | The four part headers: label, time, lede, concepts, and a `body` of blocks (the Part 3 comparison and stage callout). `break_before` puts the break separator above a part |
| Admin → **Steps** | Every step card: number, rail label, part, lede, tag, and a `body` of blocks. `position` sets the order. A step with no part (the finale) goes at the end, outside the rail |
| `seed/seed.json` | The schema (collections and block types) and the starting content. Applied once, by the setup wizard. Refresh it from a live site with `npx emdash export-seed --with-content` |
| `src/data/workshop.ts` | Event details, repo name, placeholder DID, folder names, links, the run of show, and the `{{explain}}`, `{{narrate}}` and `{{mcpOnly}}` prompt snippets |
| `src/data/scopes.ts` | The consent-screen scopes, worded exactly as EmDash shows them |
| `src/pages/index.astro` | Loads parts and steps and lays out the page |
| `src/components/GuideBlocks.astro`, `src/components/blocks/` | One renderer per block type |
| `src/components/` | `StepCard`, `Prompt`, `Callout`, `Compare`, `Consent` (scope checklist), `Checkpoint`, `StepNav`, … |
| `src/styles/global.css` | The whole design system |
| `outline.md` | The talk outline this guide is built from |

### Editing content

- **Block types** in a step's `body`: Prompt, Callout (`success`, `look`, `you`, `warn`, `restart`, `stage`), Facts, Comparison, Consent screen, Code, Checkpoint, Aside, Link cards, Heading and Text.
- **Placeholders**: any text can use `{{workspaceDir}}`, `{{siteDir}}`, `{{pluginDir}}`, `{{pluginSlug}}`, `{{repo}}`, `{{repoUrl}}`, `{{placeholderDid}}`, `{{event}}`, `{{explain}}`, `{{narrate}}` and `{{mcpOnly}}`. They're filled from `workshop.ts` when the page renders, so changing the repo there updates every prompt. An unknown placeholder shows up as-is on the page.
- **Short text fields** (ledes, facts, comparison rows, concepts, hints, checkpoint summaries) take `` `code` ``, `**bold**`, `_italic_` and `[links](https://…)`. Rich text fields (callout and aside bodies) use the editor.
- **Signed in?** Every part and step on the page shows an **Edit in admin** link.
- Parts and steps have drafts and revisions: save a draft to try a change, publish when it's right.

### Before the workshop: TODO

- [ ] Deploy the guide and claim its admin (see **Deploying**), then invite Matt.
- [ ] Set `repo` in `src/data/workshop.ts` to the real workshop repo. The starter and catch-up prompts fetch `cover-images/` and `checkpoint-a/b/c` from it with `giget`.
- [ ] Build `checkpoint-a` and `checkpoint-b` from the current Blog template (redesigned in the templates repo on 16 Oct 2026, EmDash 1.3.0+). The checkpoint prompts replace the attendee's whole `src/`, so an older template would bring back the old design. Checkpoint A's homepage change goes in `src/components/PostCard.astro` (`feature` variant) as well as `src/pages/index.astro`.
- [ ] Build the `cover-images/` starter on `checkpoint-b` (scaffold, Block Kit settings page, editor-action wiring, test setup) so it matches the step 9 prompt. Use `emdash ^1.4.0` and `@emdash-cms/plugin-test ^0.2.11` as dev dependencies (`emdash-plugin init` 0.13.5 scaffolds `^1.0.0` and `^0.2.6`; older versions scaffolded EmDash 0.x), and don't list `emdash` under `dependencies`, so `pnpm add file:../cover-images` doesn't install a second copy in the site.
- [ ] Set `placeholderDid` to a real DID we control.
- [ ] Dry-run every prompt with Claude Code, Codex, OpenCode and Cursor, on a brand-new free account and on a Paid account.
- [ ] Check which scopes each agent's MCP client asks for on the consent screen. Claude Code should ask for `scopes_supported` (all 15). A client that asks for none gets "No valid scopes requested".
- [ ] Include the `emdash-env.d.ts` change from step 4 in `checkpoint-a` and `checkpoint-b`.
- [ ] Upstream (EmDash), all still open in 1.4.0:
  - [ ] `WhereValue` doesn't accept `boolean`, but the runtime does. Step 4 casts around it.
  - [ ] `emdash types --url` writes standalone types that don't augment `EmDashCollections`. Step 4 copies the fields into `emdash-env.d.ts` by hand.
  - [ ] `scopes_supported` doesn't list per-plugin `mcp:tools:<id>` scopes, so MCP clients can't ask for them. Step 15 uses `mcp:tools` instead.

### Changes from `outline.md`

- **Agent as developer** asks for a "Related posts" section instead of reading time, because the Blog template already shows reading time.
- **`EMDASH_ENCRYPTION_KEY`** is set during the first deploy (step 2), not in Part 3, which removes a risk from Part 3. Step 14 checks it again.
- **Scaffolding** uses `create-emdash` flags (`--template cloudflare:blog --pm pnpm --install --no-sandboxed-plugins`), so the agent can run it without interactive prompts.
- **Step 15** asks for `mcp:tools`, not `mcp:tools:cover-images`. The consent screen only lists the scopes the client asks for, and MCP clients ask for what `scopes_supported` lists, which doesn't include per-plugin scopes.
- **Step 12** names the route permission, `content:edit_any`, instead of asking for "the narrowest edit permission". Since EmDash 1.3.0 the narrowest is `content:edit_own_drafts` (Contributor), and plugin routes check only the role, not ownership or status.
- **Step 3** has no separate sign-in step: since EmDash 1.3.0 the setup wizard signs the new admin in after passkey registration.
- **Step 3** has an "Admin in Polish?" aside: the admin follows the browser language, and EmDash 1.4.0 completed the Polish translation.
- **`generateCover`** returns early when a post already has a cover. That makes the MCP tool safe to call twice and means it doesn't need `destructive: true`.
