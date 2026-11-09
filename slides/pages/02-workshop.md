---
layout: section
---

# How this workshop runs

You make the calls. Your agent does the typing.

---

# Two hours, three parts

| Time | What |
| --- | --- |
| 0:00 | Opening |
| 0:05 | Setup check |
| 0:12 | **Part 1 · Ship** |
| 0:42 | **Part 2 · Automate** |
| 1:12 | Break |
| 1:17 | **Part 3 · Extend** |
| 1:52 | Close and Q&A |

<!--
Each part starts with a few minutes of slides, then it's hands-on.
-->

---
layout: center
---

# The guide

**emdash-workshop.h-demo.workers.dev**

Every step is on this page. Keep it open next to your agent.

<!--
Fun fact: the guide is an EmDash site too. If a prompt is wrong, we fix it in the admin and you refresh.
-->

---

# How a step works

<v-clicks>

- Most steps are a **prompt** you paste into your coding agent
- The agent runs the commands and **explains each one**
- When something needs your eyes, a browser or a decision, the guide says **You do this**

</v-clicks>

<!--
The goal isn't to watch the agent type. Read what it tells you and ask it questions.
-->

---

# What the boxes mean

| Box | What to do |
| --- | --- |
| **Copy this prompt** | Paste it into your agent |
| **You do this** | Your hands, not the agent's: passkeys, consent screens, the admin |
| **You should see** | How you know it worked |
| **Look** | The thing worth noticing |

---

# Fell behind? Catch up.

| Checkpoint | You get |
| --- | --- |
| **A** · after Ship | The deployed blog with the new fields |
| **B** · after Automate | Plus agent-written drafts and the plugin starter |
| **C** · in Extend | The finished plugin with tests |

Each checkpoint is one prompt in the guide.

<!--
Nobody should sit stuck for more than a couple of minutes. Raise a hand, or paste the checkpoint prompt and keep going. Your `.env`, database and deploy stay as they are.
-->

---

# Which track are you on?

| | Workers Free | Workers Paid | No account |
| --- | --- | --- | --- |
| Ship | ✅ deployed | ✅ deployed | ✅ local Node |
| Automate | ✅ | ✅ | ✅ on `localhost` |
| Extend | ✅ in-process | ✅ sandboxed | ✅ sandboxed locally |

<!--
Free plan is the default. The only difference is in Part 3: Free runs the plugin in your site's Worker, Paid runs it in its own isolate. Matt shows the isolation live either way.
-->

---

# You'll also need

<v-clicks>

- **A Replicate API token**: bring your own, or sign up with the link we share in the room (it comes with free credits)
- **An Atmosphere handle** (a Bluesky handle works), or our placeholder DID

</v-clicks>

<!--
The sign-up link gives each attendee their own Replicate account with free credits. We share it live in the room.

Placeholder DID: did:plc:cmsconf2026workshop. It's fine for validate and bundle; only publishing needs a real account.
-->

---

# Setup check

Paste **Check your setup** from the guide

```bash
node --version      # 22.16 or newer
npx wrangler whoami
```

Stuck? Raise a hand.

<!--
Seven minutes, hard stop at 0:12. The agent also checks pnpm, git, R2 and your MCP client. Helpers walk the room. Anyone still fighting their account at 0:12 goes to the local track or an enterprise seat.
-->
