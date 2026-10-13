/**
 * Every prompt attendees paste into their coding agent.
 *
 * House style (borrowed from the Worker Previews workshop):
 * - One job per prompt, numbered steps, exact commands in backticks.
 * - The agent explains each step in plain language, so attendees learn while it works.
 * - The agent never signs in for the attendee, and stops where a human should look.
 * - Every prompt ends by telling the attendee what to check themselves.
 */
import { workshop, repoUrl } from "./workshop";

const W = workshop;

const EXPLAIN = `I'm learning, so explain why each step matters.

Format each step like this, and keep the whole reply short:

**1. What you did, in one line**
> One or two plain sentences on why it matters, with no label in front.`;

const NARRATE = "Before each command, tell me in one line what it does.";

const MCP_ONLY =
  "Work only through the `emdash-site` MCP tools: don't edit files, run the CLI, or use the admin.";

export const prompts = {
  setup: `Check that my machine is ready for the EmDash workshop at ${W.event}. ${NARRATE}

1. Check: \`node -v\` (v22.16 or newer), \`pnpm -v\`, \`git --version\`, \`npx wrangler@latest whoami\`.
2. Missing or outdated tool: tell me the install command for my OS and ask before you run it. For pnpm, prefer \`corepack enable pnpm\`.
3. Not signed in to Cloudflare: don't sign in for me. Tell me to run \`npx wrangler login\` myself (it opens my browser), wait for me, then check again.
4. More than one Cloudflare account: list them in the table and ask me which one I'll use for the workshop. Don't save it anywhere: we'll set it when we deploy.
5. Check that R2 is enabled on that account: \`npx wrangler r2 bucket list\`. With more than one account, run it as \`CLOUDFLARE_ACCOUNT_ID=<id> npx wrangler r2 bucket list\`, or Wrangler refuses to pick one. If it says R2 isn't enabled (error 10042), tell me to open the Cloudflare dashboard, go to R2, and enable it (it may ask for a payment method, even on the free plan). Wait for me, then check again.
6. Tell me which coding agent you are, and confirm you can connect to remote MCP servers over HTTP with OAuth.

Ignore Wrangler warnings about missing optional permissions: the workshop doesn't need them.

Finish with a short table (tool, status, version or account), then "Ready" or what's left to fix. Don't create or deploy anything yet.`,

  create: `Create a new EmDash blog for the ${W.event} workshop. ${NARRATE}

1. Make a workshop folder and go into it: \`mkdir -p ${W.workspaceDir} && cd ${W.workspaceDir}\`.
2. Scaffold the site without prompts: \`pnpm create emdash@latest ${W.siteDir} --template cloudflare:blog --pm pnpm --install --no-sandboxed-plugins\`.
   Tell me in one line why sandboxed plugins are off for now: they need the Worker Loader binding, which is on Workers Paid. We'll come back to it in Part 3.
   If the install fails (for example a 401 from a private npm registry in my \`.npmrc\`), the project files are still created: show me the error, and we'll fix it and run \`pnpm install\` inside \`${W.siteDir}\`.
3. Inside \`${W.siteDir}\`: if it isn't a git repository yet, run \`git init\`. Then \`git add -A && git commit -m "Scaffold EmDash blog"\`, so every later change shows up as a diff.
4. In at most three short sentences, tell me what this project is: what EmDash adds to Astro, where content and media will live on Cloudflare, and that \`.agents/skills/\` and \`AGENTS.md\` hold instructions you'll use later. No file names beyond those.
5. Give me the folder's full path and the exact commands to restart you inside it, with one line on why.

Keep your whole reply short. Don't deploy yet.`,

  deploy: `Deploy my EmDash blog to Cloudflare Workers. ${EXPLAIN}

Steps:

1. Run \`pnpm wrangler whoami\`. Only if it lists more than one account: ask me which one to use (the one I picked in the setup check), then add \`"account_id": "<id>"\` at the top level of \`wrangler.jsonc\`.
   Explain: deploys and secrets in this folder now use this account, in any terminal.
2. Deploy: \`pnpm run deploy\`. Ignore the warnings about \`workers_dev\` and \`preview_urls\`: the defaults are what we want.
   Explain: what this first deploy creates (a D1 database for content, an R2 bucket for media, a KV namespace for sessions, and the Worker), and that later deploys reuse them.
   If it fails with code 10014 ("a namespace with this … title already exists"), a KV namespace is left over from an earlier attempt: show me \`pnpm wrangler kv namespace list\`, and ask before deleting it.
3. Store the encryption key from \`.env\` as a Worker secret, without printing it: \`grep '^EMDASH_ENCRYPTION_KEY=' .env | cut -d= -f2- | pnpm wrangler secret put EMDASH_ENCRYPTION_KEY\`.
   Explain: \`.env\` never leaves my machine, and in Part 3 the site needs this key to encrypt the plugin's API token.
4. If anything in the repo changed, commit it: \`git add -A && git commit -m "Deploy to Cloudflare"\`.
   Explain: in one line, what changed.

Then stop. Don't open the site or the admin: I'll open them myself, straight away. Tell me the first load can take up to half a minute while the site sets up its database. End your reply with two links on their own lines: my site, then my site with \`/_emdash/admin\` on the end.`,

  model: `I added two fields to Posts in my live site's admin: \`featured\` (boolean) and \`subtitle\` (short text). Use them on the homepage. ${EXPLAIN}

Steps:

1. Sign the EmDash CLI in to my live site: \`npx emdash login --url <my site URL>\`. It shows a code and a link: give me both, tell me to open the link and approve, and wait for me.
   Explain: the content model lives in the live database, not in the repo, so the CLI needs access to read it.
2. Generate types from the live schema: \`npx emdash types --url <my site URL>\`. Show me only the lines for \`featured\` and \`subtitle\` in \`.emdash/types.ts\`.
   These are standalone types. The site's own types are in \`emdash-env.d.ts\`, which \`pnpm dev\` generates from the local database, and that doesn't have the new fields. So copy the two lines into the \`Post\` interface in \`emdash-env.d.ts\`.
   Explain: why the types come from a running site and not from a file in the repo.
3. Use the \`building-emdash-site\` skill. Change the homepage hero so it shows the newest post where \`featured\` is true, falling back to the newest post when none is. Query it with \`getEmDashCollection("posts", { where: { featured: true }, orderBy: { published_at: "desc" }, limit: 1 })\`. EmDash's \`WhereValue\` type doesn't list booleans yet, although the query works, so cast the value (\`true as unknown as WhereValue\`, with \`WhereValue\` imported from \`emdash\`) and add a one-line comment saying why. Show the post's \`subtitle\` under its title when it has one. Show me only the lines you changed.
   Explain: in one line, what \`where\` does here, and that \`posts\` is a real SQL table behind the scenes.
4. Run \`pnpm run typecheck\`, commit, then deploy with \`pnpm run deploy\`.
   Explain: local \`pnpm dev\` uses a separate local database that has neither the new fields nor my content, so we check the change on the deployed site.

End by telling me to open my site (URL on its own line) and check that the hero shows the post I marked as featured, with its subtitle.`,

  connect: `Connect yourself to my EmDash site's MCP server, so you can work with its content. ${NARRATE}

The server URL is my live site's URL with \`/_emdash/api/mcp\` on the end. Name the server \`emdash-site\`.

1. Tell me which agent you are, then add the server:
   - Claude Code: run \`claude mcp add --transport http emdash-site <URL>\`, then tell me to run \`/mcp\`, pick \`emdash-site\`, and authenticate.
   - Codex: run \`codex mcp add emdash-site --url <URL>\`, then ask me and run \`codex mcp login emdash-site\`.
   - OpenCode: add it as a remote server in \`opencode.json\`, then ask me and run \`opencode mcp auth emdash-site\`.
   - Cursor: tell me to open Cursor Settings → MCP, add a server with this URL, and click Connect.
   - VS Code: add it to \`.vscode/mcp.json\` under \`servers\` with \`"type": "http"\`, then tell me to click Start above it and use Copilot Chat in Agent mode.
   - Any other agent: tell me how to add a remote MCP server with this URL.
2. Tell me that my browser will open my site's consent screen. Every permission on it starts ticked, and it shows descriptions, not scope names. I keep exactly these five and untick everything else:
   - "Read content (posts, pages, etc.)" (\`content:read\`)
   - "Create, edit, and delete content; manage menus and taxonomies" (\`content:write\`)
   - "View media files" (\`media:read\`)
   - "Upload and manage media files" (\`media:write\`)
   - "View collection schemas" (\`schema:read\`)
   Unticking includes "Create and modify collection schemas" (\`schema:write\`), "Use MCP tools from all enabled plugins" (\`mcp:tools\`) and "Full administrative access" (\`admin\`).
3. Wait for me. Then tell me whether I need to restart you (if unsure, say yes), and to paste the next prompt from the workshop page.

Don't call any of the site's tools yet.`,

  operate: `Topic: what a CMS conference in Poland taught me about content teams.

Do some editorial work on my site with this topic. ${MCP_ONLY} Before each tool call, tell me in one line what it does.

1. Read the Posts schema first, so you know the fields before you write anything.
2. Draft three posts on the topic: title, subtitle, excerpt, and a few short paragraphs of content each. Leave them as drafts. No images: we'll generate covers in Part 3.
3. Create tags that fit, and assign them to the three drafts.
4. Write alt text for the featured images of the sample posts. Set it on each post's \`featured_image\` with \`content_update\`, not only on the media library item: the post keeps its own copy of \`alt\`, and that copy is what the site renders.
5. Schedule one of the drafts for tomorrow at 9:00 my time.

End with a short table: post title, status, tags. Then tell me to open my admin (URL on its own line) and look at Posts.`,

  guardrail: `Add a \`reading_level\` select field (beginner, intermediate, advanced) to the Posts collection. ${MCP_ONLY}

If the call fails, don't look for a workaround. Show me the exact error code, then explain in two plain sentences why it failed and whether it's a bug.`,

  developer: `Add a "Related posts" section to the bottom of every post page: up to three other published posts that share a tag with this one, newest first. Hide the section when there are none. ${EXPLAIN}

Steps:

1. Read \`AGENTS.md\` and use the \`building-emdash-site\` skill. Check any API you're unsure of with the EmDash docs MCP server (\`search_docs\`) instead of guessing.
   Explain: which rule in \`AGENTS.md\` matters most for this change, and why.
2. Make the change. Show me only the lines you changed, and name the EmDash functions you used.
   Explain: why each function is the current API, citing the skill or the docs.
3. Run \`pnpm run typecheck\` and commit.
   Explain: in one line, what the typecheck caught or confirmed.

Don't deploy. End by telling me which file to open to review the change.`,

  starter: `Set up the Cover Images plugin starter next to my site. ${NARRATE}

1. Go to the workshop folder, the parent of \`${W.siteDir}\`: \`cd ${W.workspaceDir}\`.
2. Download the starter: \`npx giget@latest gh:${W.repo}/${W.pluginDir}#checkpoint-b ${W.pluginDir}\`.
3. In \`${W.pluginDir}\`, run \`pnpm install\`.
4. Ask me for my Atmosphere handle or DID (for example a Bluesky handle). Set it as \`publisher\` in \`${W.pluginDir}/emdash-plugin.jsonc\`. If I don't have one, use the workshop placeholder \`${W.placeholderDid}\`.
5. Walk me through the starter in at most five short bullets: what's already done for us, and what's left to write (the trust contract, \`generateCover\`, the editor and agent entry points, the publish rule). Open files only to answer this.

Keep working from \`${W.siteDir}\`: refer to the plugin as \`../${W.pluginDir}\` from now on. Don't change anything else yet.`,

  manifest: `Fill in the trust contract in \`../${W.pluginDir}/emdash-plugin.jsonc\`. Use the \`creating-plugins\` skill, and check field names with the EmDash docs MCP server. ${EXPLAIN}

Steps:

1. Set \`capabilities\` to exactly \`network:request\`, \`content:write\`, \`media:write\`, \`hooks.content-policy:register\`.
   Explain: what each one adds to \`ctx\`, and why we don't also list \`content:read\` or \`media:read\`.
2. Set \`allowedHosts\` to exactly \`api.replicate.com\` and \`*.replicate.delivery\`.
   Explain: Replicate serves generated files from \`replicate.delivery\` and its subdomains, and these are the only hosts the plugin can ever reach.
3. Under \`admin\`: a \`/settings\` page labelled "Settings", a \`settingsSchema\` with \`replicateToken\` (type \`secret\`, label "Replicate API token"), and an editor action \`generate-cover\` labelled "Generate cover", with \`placement: "toolbar"\` and \`collections: ["posts"]\`, that calls the private route \`covers/generate\`. \`placement\` is required: validate fails without it.
   Explain: what \`type: "secret"\` does to the token when it's stored.
4. Run \`pnpm run validate\` in \`../${W.pluginDir}\`.
   Explain: what validate checks, in one line.

Show me only the final \`capabilities\`, \`allowedHosts\` and \`admin\` blocks. Don't write plugin code yet.`,

  generate: `In \`../${W.pluginDir}/src/plugin.ts\`, write one function, \`generateCover(ctx, postId)\`, that every entry point will share. Use the \`creating-plugins\` skill, and check each \`ctx\` API with the EmDash docs MCP server. ${EXPLAIN}

Steps:

1. Read the post with \`ctx.content.get("posts", postId)\`. If it already has a \`featured_image\`, return it without generating anything. Otherwise build an image prompt from its title and excerpt: an editorial illustration, with no text in the image.
   Explain: why returning early makes the function safe to call twice.
2. Read the token with \`ctx.settings.get("replicateToken")\`. If it's missing, return an error that tells the editor to add it under the plugin's Settings.
3. Call Replicate with \`ctx.http.fetch\`, never the global \`fetch\`: POST \`https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions\` with headers \`Authorization: Bearer <token>\`, \`Content-Type: application/json\`, \`Prefer: wait=20\` and \`Cancel-After: 25s\`, and body \`{ "input": { "prompt": <prompt>, "aspect_ratio": "16:9", "output_format": "webp", "num_outputs": 1 } }\`. If \`status\` isn't \`succeeded\`, return a clear error. Don't poll.
   Explain: how \`Prefer: wait\` and \`Cancel-After\` keep us under the sandbox's 30-second wall time, and why polling would burn the 10-subrequest budget.
4. Download \`output[0]\` straight away with \`ctx.http.fetch\`, and read the bytes with \`arrayBuffer()\`.
   Explain: Replicate deletes API outputs after an hour, so the site keeps its own copy.
5. Upload it: \`ctx.media.upload("cover.webp", "image/webp", bytes)\`, which returns \`{ mediaId, url }\`.
6. Set the cover with \`ctx.content.update("posts", postId, { featured_image: { id: mediaId, src: url, alt } })\`, writing \`alt\` from the post's title.
   Explain: on a published post this stages a draft, so the live page doesn't change until someone publishes.

Return \`{ ok: true, mediaId, url }\` or \`{ ok: false, error }\`. Don't connect it to any route or hook yet. Run \`pnpm run typecheck\` in \`../${W.pluginDir}\`, then show me the function.`,

  expose: `Give \`generateCover\` two entry points in \`../${W.pluginDir}/src/plugin.ts\`, both backed by private routes. Use the \`creating-plugins\` skill (its API routes and MCP tools reference). ${EXPLAIN}

Steps:

1. Editors: implement the private route \`covers/generate\` behind the "Generate cover" editor action. Give it the narrowest EmDash permission that lets someone edit a post (check the exact name in the docs). Read the post from \`routeCtx.ui.entry\`, call \`generateCover\`, and reply with a toast and a refresh, so the editor sees the new cover.
   Explain: why the route reads the entry from \`routeCtx.ui.entry\` and not from the request body.
2. Agents: add \`zod\` as a dependency. Add an MCP tool under \`mcp.tools\` named \`generateCover\`, with input \`z.object({ postId: z.string() })\`, pointing at a second private route with the same permission that reads \`routeCtx.input\`. Description: "Generate an AI cover image for a post that has none. Use it when publishing fails because a post has no cover."
   Explain: why the description matters to an agent, and why the tool doesn't need \`destructive: true\` (\`generateCover\` never replaces an existing cover).
3. Run \`pnpm run validate\` and \`pnpm run typecheck\`.
   Explain: the tool will show up as \`${W.pluginSlug}__generateCover\`, and calling it needs the token scope \`mcp:tools\` (or the narrower \`mcp:tools:${W.pluginSlug}\`), which your connection doesn't have yet.

Show me only the routes and the \`mcp\` block.`,

  rule: `Make a cover image required for publishing, in \`../${W.pluginDir}/src/plugin.ts\`, and test it. ${EXPLAIN}

Steps:

1. Add a \`content:beforePublish\` hook. For the \`posts\` collection, when \`featured_image\` is empty, return \`{ cancel: true, reason: "Add a cover image (try Generate cover)." }\`.
   Explain: this hook runs on every way to publish: the admin, the REST API, MCP, the scheduler, and other plugins.
2. Register the same check as \`content:beforeSchedule\`.
   Explain: without it, scheduling a post would be a way around the rule.
3. Rewrite the generated test so it calls \`host.invokeHook("content:beforePublish", …)\` twice: with a post that has a cover (allowed), and with one that doesn't (cancelled, with our reason). Don't test generation.
   Explain: generation needs Replicate, so we check it live instead, and the tests stay fast and free.
4. In \`../${W.pluginDir}\`, run \`pnpm run validate\`, \`pnpm run typecheck\`, \`pnpm run test\` and \`pnpm run build\`.
   Explain: in one line, what \`build\` writes to \`dist/\`.

End with a short table of the four commands and their results.`,

  install: `Install the Cover Images plugin in my site, and deploy it. ${EXPLAIN}

Steps:

1. In \`${W.siteDir}\`, run \`pnpm add file:../${W.pluginDir}\`.
   Explain: the site now imports the built plugin like any other package.
2. Ask me which plan this account is on: Workers Free, or Workers Paid (the workshop's enterprise account counts as Paid). Then register the plugin in \`astro.config.mjs\`:
   - Free: import it and add it to \`plugins: []\` inside \`emdash({ … })\`.
   - Paid: uncomment the \`LOADER\` binding under \`worker_loaders\` in \`wrangler.jsonc\`, add \`sandboxRunner: sandbox()\` (imported from \`@emdash-cms/cloudflare\`), add the plugin to \`sandboxed: []\`, and check that \`src/worker.ts\` exports \`PluginBridge\`.
   Explain, honestly: on Free the plugin runs in-process, so the capability gates on \`ctx\` still apply, but its code could call \`fetch()\` directly. On Paid it runs in its own isolate, where it can't.
3. Check that the Worker has \`EMDASH_ENCRYPTION_KEY\`: \`pnpm wrangler secret list\`. If it's missing, set it from \`.env\` without printing it: \`grep '^EMDASH_ENCRYPTION_KEY=' .env | cut -d= -f2- | pnpm wrangler secret put EMDASH_ENCRYPTION_KEY\`.
   Explain: without this key, the site refuses to save secret settings.
4. Run \`pnpm run typecheck\`, commit, and deploy with \`pnpm run deploy\`.

Then stop. End by telling me to finish the setup in my admin (admin URL on its own line), and that the steps are on the workshop page.`,

  reconnect: `Reconnect to my site's \`emdash-site\` MCP server with one extra scope. ${NARRATE}

1. Tell me which agent you are, then help me sign in again so I see the consent screen:
   - Claude Code: tell me to run \`/mcp\`, pick \`emdash-site\`, clear its authentication, and authenticate again.
   - Codex: ask me, then run \`codex mcp logout emdash-site\` and \`codex mcp login emdash-site\`.
   - OpenCode: ask me, then run \`opencode mcp logout emdash-site\` and \`opencode mcp auth emdash-site\`.
   - Cursor or VS Code: tell me to disconnect the server and connect it again.
   - Any other agent: tell me how to sign out of a remote MCP server and sign in again.
2. On the consent screen, I keep the same five as before and tick exactly one more: "Use MCP tools from all enabled plugins" (\`mcp:tools\`). Everything else stays unticked.
   Tell me in one line: EmDash also has a narrower scope, \`mcp:tools:${W.pluginSlug}\`, but the consent screen only lists the scopes my agent asks for, and MCP clients ask for \`mcp:tools\`. With one plugin installed, the two allow the same thing.
3. Wait for me. Then tell me whether I need to restart you (if unsure, say yes), and to paste the next prompt from the workshop page.

Don't call any of the site's tools yet.`,

  payoff: `Publish the three drafts you wrote earlier. ${MCP_ONLY}

If a publish is rejected, read the reason, fix the cause with the tools you have, and publish again. Before each tool call, tell me in one line what it does.

End with a short table: post, what happened on the first attempt, what you did about it, final status. Then tell me to open my homepage (URL on its own line).`,

  shipIt: `Package the Cover Images plugin for the EmDash plugin registry, without publishing it. ${NARRATE}

1. In \`../${W.pluginDir}\`, run \`pnpm exec emdash-plugin validate\`, then \`pnpm exec emdash-plugin bundle\`.
2. Tell me where the tarball is and how big it is.
3. In a short table, list what a site operator will be asked to approve before installing this plugin: each capability and each allowed host, with one plain line on what it allows.

Don't run \`emdash-plugin publish\`: we'll watch that on stage.`,

  checkpointA: `Bring my site to the workshop's Checkpoint A. ${NARRATE}

1. In a temporary folder, fetch the checkpoint: \`npx giget@latest gh:${W.repo}#checkpoint-a /tmp/emdash-checkpoint-a\`.
2. Copy \`src/\` and \`emdash-env.d.ts\` from it into \`${W.siteDir}\`, replacing mine. Don't touch \`wrangler.jsonc\`, \`.env\`, \`.wrangler/\` or \`node_modules/\`.
3. Show me \`git status\` in one short list, then commit: \`git add -A && git commit -m "Checkpoint A"\`.
4. Deploy with \`pnpm run deploy\`.

If my live site doesn't have the \`featured\` and \`subtitle\` fields yet, tell me to add them in the admin under Content Types → Posts. End with my site URL on its own line.`,

  checkpointB: `Bring my site to the workshop's Checkpoint B. ${NARRATE}

1. Fetch the checkpoint: \`npx giget@latest gh:${W.repo}#checkpoint-b /tmp/emdash-checkpoint-b\`.
2. Copy \`src/\` and \`emdash-env.d.ts\` from it into \`${W.siteDir}\`, replacing mine. Don't touch \`wrangler.jsonc\`, \`.env\`, \`.wrangler/\` or \`node_modules/\`. Copy \`${W.pluginDir}/\` from it into \`${W.workspaceDir}/${W.pluginDir}\` if that folder doesn't exist yet.
3. Commit (\`git add -A && git commit -m "Checkpoint B"\`) and deploy with \`pnpm run deploy\`.
4. If you're connected to my site's \`emdash-site\` MCP server and have fewer than three draft posts, draft three short posts about content teams, with no images.

End with my site URL on its own line.`,

  checkpointC: `Bring my plugin to the workshop's Checkpoint C. ${NARRATE}

1. Fetch the checkpoint: \`npx giget@latest gh:${W.repo}#checkpoint-c /tmp/emdash-checkpoint-c\`.
2. Replace \`${W.workspaceDir}/${W.pluginDir}\` with the checkpoint's \`${W.pluginDir}/\`, keeping the \`publisher\` in my \`emdash-plugin.jsonc\`.
3. In \`${W.pluginDir}\`, run \`pnpm install\`, \`pnpm run test\` and \`pnpm run build\`.

Then carry on from "Install and deploy" on the workshop page.`,

  cleanup: `Delete everything this workshop created on Cloudflare. ${NARRATE}

1. Find the real names: the Worker, the D1 database and the R2 bucket from \`${W.siteDir}/wrangler.jsonc\`. They may differ from the defaults. The first deploy also created a KV namespace for sessions, named after the Worker with \`-session\` on the end: find its ID with \`pnpm wrangler kv namespace list\`.
2. List exactly what you'll delete, and wait for my yes.
3. Empty and delete the R2 bucket (\`pnpm wrangler r2 bucket delete <name>\`; if it isn't empty, tell me to empty it in the dashboard first), then delete the D1 database (\`pnpm wrangler d1 delete <name>\`), the KV namespace (\`pnpm wrangler kv namespace delete --namespace-id <id>\`) and the Worker (\`pnpm wrangler delete <name>\`).
4. Remove the \`emdash-site\` MCP server from your config.

Don't touch any other Workers, databases, namespaces or buckets. End with a short list of what's gone, and remind me that the local \`${W.workspaceDir}\` folder is still on my machine, and that a shared Replicate token from the workshop stops working after today.`,
} as const;

export type PromptKey = keyof typeof prompts;

export { repoUrl };
