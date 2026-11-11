/**
 * Workshop-wide settings. Everything an organiser might need to change before
 * the day lives here. The steps themselves live in EmDash (collections `parts`
 * and `steps`) and refer to these values as {{placeholders}}.
 */
export const workshop = {
  title: "Ship, Automate, Extend",
  subtitle: "A hands-on EmDash CMS workshop",
  event: "CMS Conf 2026",
  place: "Poland",
  dates: "12–14 Nov 2026",
  duration: "120 min",
  speakers: ["Matt Kane", "Harshil Agrawal", "Noah Pham"],

  /**
   * Public repo with the checkpoint-a/b/c branches, and the `cover-images/`
   * starter on checkpoint-b. Attendees' agents fetch from it with giget, so it
   * must be public. Separate from this guide repo. Format: owner/repo.
   */
  repo: "harshil1712/emdash-workshop",

  /** Placeholder publisher DID for attendees without an Atmosphere account. */
  placeholderDid: "did:plc:cmsconf2026workshop",

  /** Folder names used in every prompt. Keep them in sync with the starter. */
  workspaceDir: "~/cms-conf-emdash",
  siteDir: "my-blog",
  pluginDir: "cover-images",
  pluginSlug: "cover-images",

  links: {
    docs: "https://docs.emdashcms.com/",
    docsMcp: "https://docs.emdashcms.com/docs-mcp/",
    github: "https://github.com/emdash-cms/emdash",
    template: "https://github.com/emdash-cms/templates/tree/main/blog-cloudflare",
    announcement: "https://blog.cloudflare.com/emdash-cms-plugin-registry/",
    mcpReference: "https://docs.emdashcms.com/reference/mcp-server/",
    aiTools: "https://docs.emdashcms.com/guides/ai-tools/",
    plugins: "https://docs.emdashcms.com/plugins/creating-plugins/your-first-plugin/",
    capabilities: "https://docs.emdashcms.com/plugins/creating-plugins/capabilities/",
    sandbox: "https://docs.emdashcms.com/deployment/plugin-sandbox/",
    publishing: "https://docs.emdashcms.com/plugins/creating-plugins/publishing/",
    wordpress: "https://docs.emdashcms.com/migration/from-wordpress/",
    cloudflareDeploy: "https://docs.emdashcms.com/deployment/cloudflare/",
    nodeDeploy: "https://docs.emdashcms.com/deployment/nodejs/",
    replicate: "https://replicate.com/black-forest-labs/flux-2-klein-4b",
    replicateTokens: "https://replicate.com/account/api-tokens",
    r2: "https://dash.cloudflare.com/?to=/:account/r2/overview",
    bluesky: "https://bsky.app/",
  },
} as const;

export const repoUrl = `https://github.com/${workshop.repo}`;

/** Reusable prompt fragments. Content uses them as {{explain}}, {{narrate}} and {{mcpOnly}}. */
export const snippets = {
  explain: `I'm learning, so explain why each step matters.

Format each step like this, and keep the whole reply short:

**1. What you did, in one line**
> One or two plain sentences on why it matters, with no label in front.`,
  narrate: "Before each command, tell me in one line what it does.",
  mcpOnly:
    "Work only through the `emdash-site` MCP tools: don't edit files, run the CLI, or use the admin.",
};

const values: Record<string, string> = {
  event: workshop.event,
  repo: workshop.repo,
  repoUrl,
  placeholderDid: workshop.placeholderDid,
  workspaceDir: workshop.workspaceDir,
  siteDir: workshop.siteDir,
  pluginDir: workshop.pluginDir,
  pluginSlug: workshop.pluginSlug,
  ...snippets,
};

/**
 * Fills {{placeholders}} in content from the CMS with the values above, so names
 * like the repo or folder are set once here and every step picks them up.
 * Unknown placeholders are left as they are, so a typo shows on the page.
 */
export function fill(text: string): string {
  return text.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}

export const runOfShow = [
  { time: "0:00", label: "Opening" },
  { time: "0:05", label: "Setup check" },
  { time: "0:12", label: "Ship", accent: true },
  { time: "0:42", label: "Automate", accent: true },
  { time: "1:12", label: "Break" },
  { time: "1:17", label: "Extend", accent: true },
  { time: "1:52", label: "Close and Q&A" },
];
