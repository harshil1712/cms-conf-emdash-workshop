# CMS Conf EmDash Workshop

**Ship, Automate, Extend: A Hands-On EmDash CMS Workshop** · CMS Conf 2026 · Matt Kane & Harshil Agrawal

In this two-hour workshop, you'll go from zero to a fully deployed, agent-powered CMS site, and learn how to extend it with your own plugins.
We'll start by deploying an EmDash blog to production, covering configuration, content modeling, and the deployment pipeline. From there, we'll explore EmDash's agentic capabilities, using AI agents to generate, enrich, and manage content without manual busywork. Finally, we'll roll up our sleeves and build a custom plugin, covering the plugin lifecycle, APIs, and how to package and ship your extension.
By the end of the session, you'll have a live blog, a working understanding of EmDash's agent features, and a custom plugin you built yourself.

---

## The attendee guide

This repo is the workshop's step-by-step guide: a single static page (Astro) served from a Cloudflare Worker. The structure follows the [Worker Previews workshop](https://worker-previews-workshop.thomas-development.workers.dev/): most steps are a prompt attendees paste into their coding agent, plus **You do this** boxes for the parts a person has to do (passkeys, consent screens, the admin).

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output in dist/
pnpm deploy     # build + wrangler deploy
```

### Where things live

| File | What it holds |
| --- | --- |
| `src/data/workshop.ts` | Event details, repo name, placeholder DID, folder names, links, the step list and the run of show |
| `src/data/prompts.ts` | Every agent prompt. Edit these as plain text; they pick up names from `workshop.ts` |
| `src/pages/index.astro` | The page itself: part headers, step cards, callouts |
| `src/components/` | `StepCard`, `Prompt`, `Callout`, `Compare`, `Consent` (scope checklist), `Checkpoint`, `StepNav`, … |
| `src/styles/global.css` | The whole design system |
| `outline.md` | The talk outline this guide is built from |

### Before the workshop: TODO

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
