# Ship, Automate, Extend: A Hands-On EmDash CMS Workshop

**Event:** CMS Conf 2026, Poland (12–14 Nov), developers track
**Format:** 120-minute hands-on workshop, attendees build along on their own laptops
**Speakers:** Matt Kane, Harshil Agrawal
**Status:** Draft proposal for discussion

---

## The idea in one line

Attendees build one blog during the session. They deploy it, hand it to an AI agent, and then write a plugin that generates cover images with an AI model and holds an API key, in a sandbox that blocks HTTP requests to unapproved hosts.

## What attendees leave with

1. A live EmDash blog on Cloudflare Workers (D1 and R2), with a content model they changed themselves.
2. An AI agent connected to their site over MCP, with limited scopes, that has drafted, tagged and scheduled real content.
3. A "Cover Images" plugin they wrote in the sandboxed format. It generates a cover image for a post with an image model on Replicate (FLUX Schnell), stores it in the media library and sets it as the post's featured image. Editors run it from the post editor, the agent runs it as an MCP tool, and a publish rule blocks posts without a cover. The plugin holds a Replicate API token, and its manifest only lets it talk to Replicate. (Attendees on the Workers free plan run it in-process on their live site; see the accounts plan.)

---

## Run of show

### 0:00–0:05 · Opening (Matt and Harshil)
- **Promise:** "In two hours you'll have a live CMS that an AI agent can run for you, plus an AI plugin you wrote, in a sandbox that blocks HTTP requests to unapproved hosts."
- Show the finished site and the payoff moment up front: the agent tries to publish a draft, the plugin rejects it for having no cover, the agent calls the plugin's tool to generate one, and the post goes live with an AI-generated cover.
- Short intros (under 30 seconds each), then the three-part map: **Ship → Automate → Extend**.
- *Type: concept*

### 0:05–0:12 · Setup check
- Attendees get the prerequisites by email before the day: Node 22.16+, pnpm, git, a Cloudflare account (or an invite to ours) **with R2 enabled in the dashboard**, an MCP-capable agent, and an Atmosphere (AT Protocol, e.g. Bluesky) handle or DID for the plugin manifest's `publisher` field.
- R2 must be activated on the account before the first deploy can create the bucket. Cloudflare may ask for a payment method even on the free tier, so attendees should do this at home.
- People without an Atmosphere account get a placeholder DID from us. `plugin-cli init` accepts a DID as-is with no network lookup; a handle is resolved over the network.
- Replicate: attendees either bring their own Replicate API token (with billing set up, because the free runs are limited) or sign up with a link we share live in the room, which gives each of them a Replicate account with free credits.
- `npx wrangler whoami` and `node --version` on screen. Helpers walk the room.
- Anyone without a Cloudflare account switches to the local track (Node.js and SQLite, no account needed) and keeps going.
- *Type: setup*

### Part 1: Ship (0:12–0:42, 30 min)

**0:12–0:19 · How EmDash is built (concept)**
- It's an Astro integration, so you get admin, REST API, auth, media and plugins with no separate backend.
- On Cloudflare it uses D1 for the database, R2 for media and Workers to run the site. It also runs on Node with SQLite, libSQL or Postgres, and S3-compatible or local storage.
- Content types live in the database, not in code. Each collection is a real SQL table (`ec_posts`, …), and rich text is stored as Portable Text (structured JSON, not HTML).
- Phil's point: name the platform primitives as they come up. Matt can tell the story of why it was built this way.

**0:19–0:42 · Hands-on**
1. `pnpm create emdash@latest`, then pick Cloudflare Workers, the Blog template and pnpm. Answer **No** to "Enable sandboxed plugins?" (free plan).
2. `pnpm wrangler login`, then `pnpm run deploy`. The first deploy creates D1 and R2.
3. Open `/_emdash/admin` on the `workers.dev` URL **straight away**, run the setup wizard and register a passkey. The first person to finish setup on a public URL becomes admin, and passkeys only work on the hostname they were registered on.
4. Change the content model in the admin (**Content Types**): add a `featured` boolean and a `subtitle` field to Posts. The Blog template already has `excerpt`.
5. Run `npx emdash login --url https://<site>.workers.dev`, then `npx emdash types --url https://<site>.workers.dev` to generate types from the live schema. Use `getEmDashCollection("posts", { where: { featured: true } })` to render featured posts on the homepage.
   - Local `pnpm dev` uses a separate local D1 database, so the new fields and live content aren't there. Verify on the deployed site instead.
6. Redeploy (`pnpm run deploy`) and check the live site.

**Checkpoint A:** `checkpoint-a` branch, a deployed blog with the updated model.

### Part 2: Automate (0:42–1:12, 30 min)

**0:42–0:48 · Three ways agents work with EmDash (concept)**
- **MCP server**, built into every site at `/_emdash/api/mcp`. Agents use it to work with content.
- **CLI** (`npx emdash content …`, `schema …`). Scriptable, outputs JSON, useful in CI.
- **Agent skills** in `.agents/skills/` (`building-emdash-site`, `creating-plugins`, `emdash-cli`). These teach coding agents the current EmDash APIs, which matters when you're building the site with an agent.
- Least privilege: OAuth scopes and user roles are checked separately, so a scope never gives more than the user's role allows. **First appearance of the symbol** (the consent screen).

**0:48–1:02 · Hands-on: agent as content operator**
1. Connect an MCP client to your live site with OAuth. On the consent screen, keep `content:read`, `content:write`, `media:read`, `media:write` and `schema:read`, and clear everything else, including **`schema:write`**.
   - `content:write` already includes `taxonomies:manage`.
   - `media:write` does **not** include `media:read`, which is needed to list images.
   - `schema:read` lets the agent inspect fields before it writes content.
2. Prompts to run: draft three posts on a topic (no images; Part 3 generates the covers), create and assign tags, write alt text for the sample posts' featured images, schedule one post for tomorrow.
   - The post's image field keeps its own copy of `alt`. Have the agent set it on the post (`content_update`), not only on the media library item (`media_update`). Confirm in the dry run which copy the site renders.
3. Ask the agent to add a field to the schema. The schema tools are visible, but the call fails with `INSUFFICIENT_SCOPE`. Point out that this is the permission model working as intended.

**1:02–1:12 · Hands-on: agent as developer** *(first thing to cut if we're behind)*
- The template already includes the agent skills. Ask a coding agent to "add a reading-time estimate to post pages", then review the diff together. The point: skills keep the agent on current APIs so it doesn't make them up.

**Checkpoint B:** `checkpoint-b` branch, with seeded agent-written content and an example prompt log.

### 1:12–1:17 · Break

### Part 3: Extend (1:17–1:52, 35 min)

**1:17–1:25 · Plugins you don't have to trust (concept)**
- The problem: on WordPress, most security vulnerabilities come from plugins (cite a source on the slide, e.g. Patchstack's annual report). Every plugin can read the entire site, including every API key stored in it, and send them anywhere.
- The case we're building: an AI plugin that needs a paid API token. Where can that token go?
- EmDash's answer: a sandboxed plugin is a manifest (`emdash-plugin.jsonc`) plus code. It runs in its own isolate and can only use the `ctx` APIs its declared capabilities allow. Direct `fetch()` and `process.env` are blocked, and network access goes only to declared hosts. On Cloudflare, CPU (50 ms), subrequests (10) and wall time (30 s) are limited per invocation. The Node `workerd` runner enforces only wall time.
- Same plugin format, two ways to run it: under `sandboxed: []` it gets the isolate and limits; under `plugins: []` it runs in-process. Capability gating still applies there, but there's no isolation boundary.
- Sandboxed vs native plugins, and when native is actually needed: React admin pages, custom Portable Text blocks, or injecting HTML or scripts.
- **Live surprise demo (instructor only, on a Workers Paid account):** take the finished Cover Images plugin, running sandboxed, and add one line that POSTs the Replicate token to `evil.example`. `ctx.http.fetch()` throws because the host isn't in `allowedHosts`. A direct `fetch()` and reading `process.env` fail too. Real generation keeps working. **Second appearance of the symbol.**
  - Be honest about the free plan: under `plugins: []` the allowlist on `ctx.http` still applies, but plugin code could call `fetch()` directly. Isolation is what makes the guarantee real.

**1:25–1:47 · Hands-on: the "Cover Images" plugin**

The checkpoint-b branch includes a `cover-images/` starter with boilerplate that isn't worth typing in the room: the scaffold, the Block Kit settings page and the editor-action wiring. Attendees write the parts that teach something: the manifest, the generation function, the publish rule and the MCP tool.

1. Scaffold it, or open the starter: `pnpm dlx @emdash-cms/plugin-cli init cover-images`. The command asks for a publisher (Atmosphere handle or DID; required), author, security contact and repo.
2. Manifest (`emdash-plugin.jsonc`), the trust contract:
   ```jsonc
   "capabilities": ["network:request", "content:write", "content:revisions:read", "media:write", "hooks.content-policy:register"],
   "allowedHosts": ["api.replicate.com", "*.replicate.delivery"],
   "admin": {
     "pages": [{ "path": "/settings", "label": "Settings" }],
     "settingsSchema": { "replicateToken": { "type": "secret", "label": "Replicate API token" } },
     "editorActions": [{ "id": "generate-cover", "label": "Generate cover", "route": "covers/generate" }]
   }
   ```
   - `content:write` includes `content:read`, and `media:write` includes `media:read`.
   - Replicate serves output files from `replicate.delivery` and its subdomains, and EmDash's `*.replicate.delivery` matches both.
   - `type: "secret"` means the token is stored encrypted.
3. Write `generateCover(ctx, postId)`, one function used by every entry point:
   1. Read the post with `ctx.content.get()` and build a prompt from its title and excerpt.
   2. `ctx.http.fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions")`:
      - Headers: `Authorization: Bearer <token>` (token from `ctx.settings.get("replicateToken")`), `Prefer: wait=20` and `Cancel-After: 25s`. This keeps the call under the sandbox's 30 s wall-time limit.
      - Body: `{ input: { prompt, aspect_ratio: "16:9", output_format: "webp", num_outputs: 1 } }`.
      - The response's `output` is an array of URLs. If `status` isn't `succeeded`, return a clear error rather than polling.
   3. Download `output[0]` with `ctx.http.fetch()` straight away. Replicate deletes API outputs after an hour. The body arrives as binary bytes, so there's no base64 decoding.
   4. `ctx.media.upload("cover.webp", "image/webp", bytes)` returns `{ mediaId, url }`.
   5. `ctx.content.update("posts", postId, { featured_image: { id: mediaId, src: url, alt } })`. Write the alt text from the title. On a published post, this stages a draft.
4. Expose it in two places:
   - **Editors:** the private route `covers/generate` with a `permission`, behind the **Generate cover** editor action. It gets the post from `routeCtx.ui.entry`.
   - **Agents:** an MCP tool under `mcp.tools` (`generateCover`, with a `zod` input `{ postId }`) pointing to the same kind of private route. In the admin, enable the plugin's MCP tools. The tool appears as `cover-images__generateCover`.
5. Publish rule: a `content:beforePublish` hook that returns `{ cancel: true, reason: "Add a cover image (try Generate cover)." }` when `event.content.data.featured_image` is empty (the event carries the whole item, so fields are under `data`; ignore `seo.image`, which only overrides the share image). It runs for every publish path: admin/API, MCP, scheduler and other plugins. Register the same check as `content:beforeSchedule` so a scheduled post can't skip it.
6. Rewrite the generated workerd-backed test to call `host.invokeHook("content:beforePublish", …)` with a post that has a cover and one that doesn't. Generation itself is checked live, so the tests don't depend on Replicate. Run `pnpm run validate` and `pnpm run test`.
7. Run `pnpm run build` in the plugin, then install it in the site: `pnpm add file:../cover-images`. Register it according to the account:
   - Workers Paid / our enterprise account: uncomment `LOADER` in `wrangler.jsonc`, add `sandboxRunner: sandbox()`, and put the plugin under `sandboxed: []`.
   - Workers free plan: put it under `plugins: []` (in-process, no isolation).
   - Then `pnpm wrangler secret put EMDASH_ENCRYPTION_KEY` (paste the value from `.env`) and redeploy. Secret settings can't be saved without this key.
8. In the admin, open the plugin's **Settings**, paste the Replicate token and save. Open a draft and click **Generate cover**.
9. **Payoff:** reconnect the Part 2 agent with the extra `mcp:tools:cover-images` scope, then ask it to publish its drafts. The plugin rejects them (`PUBLISH_REJECTED`, "Add a cover image…"). The agent calls `cover-images__generateCover` for each one and publishes, and the live homepage fills with generated covers.

**1:47–1:52 · Shipping it**
- Run `emdash-plugin validate` and `emdash-plugin bundle` to produce a registry tarball.
- Show `emdash-plugin publish` to the registry live. Publishing needs an Atmosphere account, so attendees don't do this step in the room.
- Point out what an operator sees before installing from the registry: the capabilities and the two Replicate hosts, listed in the consent dialog.

**Checkpoint C:** `checkpoint-c` branch, with the finished plugin, tests and a seeded post that already has a generated cover.

### 1:52–2:00 · Close and Q&A
- **Contributions slide** (stays up during Q&A), matching the promise:
  - A live blog you deployed and modelled
  - An agent running it with scopes you chose
  - An AI plugin you wrote that editors and agents both use, enforces a publish rule, and runs in a sandbox that blocks HTTP requests to unapproved hosts
- Next steps: WordPress import, publishing to the plugin registry, the docs MCP, and the community channel.
- No "Thank you" or "Questions?" slide at the end.

---

## Proposed split

| Section | Presenting | Floor support |
|---|---|---|
| Opening | Both | – |
| Setup check | Harshil | Matt |
| Part 1: Ship | Harshil | Matt |
| Part 2: Automate | Harshil | Matt |
| Part 3: Extend (concept and sandbox demo) | Matt | Harshil |
| Part 3: plugin hands-on and shipping | Matt | Harshil |
| Close | Both | – |

**Prep ownership (proposal):**
- **Harshil:** workshop repo and checkpoint branches, step-by-step attendee guide, prerequisites email, account plan, slides for Opening and Parts 1–2, fallback recordings.
- **Matt:** technical review of the guide, the Part 3 plugin code and sandbox demo, slides for Part 3, pinning the EmDash version.
- **James (if interested):** turning the guide into a public tutorial or video after the conference.

---

## Accounts plan (answers Kristian's question)

From the docs: the Cloudflare templates **deploy on the Workers free plan** as long as the `LOADER` (Worker Loader) binding is left out; it's commented out in the template. **Sandboxed isolation on Cloudflare needs Workers Paid** because it runs on Dynamic Workers. R2 must be enabled on the account before the first deploy.

Part 3's payoff has to run on the **same site the Part 2 agent is connected to**. Building Part 3 locally on a free account would mean a different database (no agent drafts) and a different MCP endpoint. So free-plan attendees register the plugin under `plugins: []` on their live site. Same code, same hook, same rejection, but no isolation.

Replicate is separate from the Cloudflare plan. FLUX Schnell costs $3 per thousand images (about $0.003 each), so 60 attendees × 20 images is about $4. A dedicated workshop account with prepaid credit limits our spend. Because the token is shared, we revoke it after the session.

| Part | Free plan | Our enterprise account | No account (Node track) |
|---|---|---|---|
| 1: Ship | ✅ | ✅ | ✅ local Node + SQLite |
| 2: Automate | ✅ (MCP on live site) | ✅ | ✅ MCP on `localhost:4321` |
| 3: Extend | ✅ deployed in-process (`plugins: []`) | ✅ deployed sandboxed (`sandboxed: []` + `LOADER`) | ✅ sandboxed locally via `@emdash-cms/sandbox-workerd` + `workerd` |

**Proposal:** attendees use their own free accounts throughout and run the plugin in-process in Part 3. The isolation itself is shown in Matt's live demo on a paid account. The enterprise account is the fallback, plus a few seats for people who want to deploy the plugin sandboxed. This means we don't depend on Dynamic Workers reaching the free plan by November.

The Node `workerd` runner applies only to the Node.js track. Cloudflare-template projects use `sandbox()` with `LOADER`. Whether `LOADER` works under local `astro dev` isn't documented; test it before offering it as a local option.

---

## Risks and fallbacks

| Risk | Level | Mitigation / fallback |
|---|---|---|
| Venue Wi-Fi (npm installs, deploys) | High | Prerequisites email asks people to run `pnpm create emdash` in advance; we bring a hotspot; local track needs no deploy |
| R2 not enabled on attendee accounts | Medium | Prerequisites email: enable R2 in the dashboard ahead of time (may need a payment method); test on a brand-new account during prep; enterprise seats as fallback |
| Missing Atmosphere handle blocks `plugin-cli init` | Medium | Prerequisites email; hand out a placeholder DID in the guide |
| Free-plan limits (10 ms CPU per request, 5 cron triggers per account) | Low | Watch admin and site behaviour on a free account during the dry run; the template uses one cron trigger |
| Free-plan CPU limit (10 ms per request) with the plugin in-process | High | Downloading and uploading the image happens inside the site's request, and upload may also compute blurhash and dimensions. **Test on a free account first (Matt, by 26 Oct).** If it fails: enterprise seats for Part 3, or the local track |
| Sandbox subrequest limit (10 per invocation on Cloudflare) | Medium | Replicate needs 2 calls (create and download), plus the plugin's calls back to EmDash for settings, content and media, if those count toward the limit. Keep it to one prediction and no polling, and measure in prep |
| Replicate tokens (sign-up, credits, rate limits) | Medium | A sign-up link, shared live, gives each attendee their own account with free credits, so there's no shared token to revoke; attendees with their own billing-enabled token can use it |
| Generation slow or failing live | Medium | FLUX Schnell usually takes a few seconds; `Prefer: wait=20` with `Cancel-After: 25s`; the plugin returns a clear error; checkpoint C has pre-generated covers; fallback video of the payoff |
| Image download from Replicate hangs (sandboxed) | Medium | Seen in the 3 Nov dry run: 3 of about 7 `generateCover` calls had the second `ctx.http.fetch` (downloading `output[0]` from `replicate.delivery`) hang until the runtime cancelled the request; the call failed, and a retry always worked. The exact message isn't in the plugin or EmDash 1.4.0 (a crashed or cancelled route returns `INTERNAL_ERROR`), so step 15 tells the agent to retry once on any error that isn't about a missing token. Root cause not found yet |
| Redeploying a changed sandboxed plugin keeps the old code | Medium | EmDash caches sandboxed plugins by ID and version, and pnpm copies `file:` packages. Step 14 tells attendees to bump `version`, rebuild and re-run `pnpm add file:` after every plugin change |
| Missing `EMDASH_ENCRYPTION_KEY` on the deployed Worker | Medium | The guide step sets it with `wrangler secret put` before the token is saved; without it, secret settings won't save |
| Attendees without an MCP-capable agent or paid AI plan | High | Decide on a supported client list ahead of time (Claude, ChatGPT dev mode, Codex, Cursor, VS Code). Fallback: the same tasks with the `emdash` CLI. Pair people up |
| Agent output varies on stage | Medium | Pre-recorded video of the Part 2 and payoff demos. If it misbehaves, say: "This is exactly why Part 3 exists: you don't rely on the agent behaving, you enforce it." |
| Attendees falling behind | High | Checkpoint branches A, B and C; the non-presenting speaker walks the room |
| EmDash or plugin-cli API changes before November | Medium | Pin versions in the repo; plugin tooling is still `0.x`; Matt freezes versions on 9 Nov |
| Passkey registration on unusual setups | Low | Test on Windows, Linux and macOS during the dry run. Magic links only work on a deployed Worker once an email plugin is configured, and passkeys are bound to the hostname. Fallback: the local track, where magic links print to the terminal |
| Running over time | Medium | First cut: "agent as developer" (10 min). Second cut: the editor action (keep the MCP tool, which the payoff needs) |

**Critical path:** the Part 3 payoff moment, where the agent's publish is rejected by the attendee's own plugin and the agent fixes it by generating a cover. Protect it ahead of everything else.

---

## Prep timeline

| By | What | Owner |
|---|---|---|
| 16 Oct | Agree on the outline and split; ask organisers about attendee count, room setup and Wi-Fi | Both |
| 23 Oct | Repo with checkpoint branches and draft attendee guide | Harshil |
| 23 Oct | Free-plan CPU test of the in-process Cover Images plugin; Replicate workshop account with prepaid credit | Matt / Harshil |
| 26 Oct | Plugin code, starter branch and sandbox demo | Matt |
| 28 Oct | Prerequisites email to the organisers for attendees | Harshil |
| 2 Nov | Full internal dry run with 2–3 testers (James? Phil?) | Both |
| 6 Nov | Fallback videos recorded, slides final | Both |
| 9 Nov | Version freeze | Matt |

---

## Open questions

1. Is the slot definitely 120 minutes? How many attendees are expected, and do they bring laptops?
2. Will the organisers send a pre-workshop email to attendees?
3. Which agent clients do we officially support in Part 2?
4. Does Matt want to own Part 3, or would he rather do Part 1 (architecture story) and swap?
5. Are we OK leaving registry publishing as a live demo only?
6. Does the Cloudflare `sandbox()` runner work under local `astro dev` with `LOADER` uncommented on a free account? If so, it's an extra local option for Part 3.
7. ~~Replicate: shared workshop token, attendees' own tokens, or both?~~ Decided: attendees' own accounts, from a sign-up link with free credits, shared live.
