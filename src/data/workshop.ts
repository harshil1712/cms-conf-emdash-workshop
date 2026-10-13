/**
 * Workshop-wide settings. Everything an organiser might need to change before
 * the day lives here, so prompts and pages never hard-code it.
 */
export const workshop = {
  title: "Ship, Automate, Extend",
  subtitle: "A hands-on EmDash CMS workshop",
  event: "CMS Conf 2026",
  place: "Poland",
  dates: "12–14 Nov 2026",
  duration: "120 min",
  speakers: ["Matt Kane", "Harshil Agrawal"],

  /**
   * TODO(harshil): the public workshop repo with checkpoint-a/b/c branches and
   * the `cover-images/` starter on checkpoint-b. Format: owner/repo.
   */
  repo: "emdash-cms/cms-conf-workshop",

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
    replicate: "https://replicate.com/black-forest-labs/flux-schnell",
    replicateTokens: "https://replicate.com/account/api-tokens",
    r2: "https://dash.cloudflare.com/?to=/:account/r2/overview",
    bluesky: "https://bsky.app/",
  },
} as const;

export const repoUrl = `https://github.com/${workshop.repo}`;

/** A section of the workshop, shown as a group in the step rail. */
export type Part = {
  id: string;
  label: string;
  name: string;
  time: string;
};

export type Step = {
  id: string;
  num: string;
  label: string;
  part: Part["id"];
  optional?: boolean;
};

export const parts: Part[] = [
  { id: "start", label: "Start", name: "Before you start", time: "0:00" },
  { id: "ship", label: "Part 1", name: "Ship", time: "0:12" },
  { id: "automate", label: "Part 2", name: "Automate", time: "0:42" },
  { id: "extend", label: "Part 3", name: "Extend", time: "1:17" },
];

export const steps: Step[] = [
  { id: "setup", num: "0", label: "Check your setup", part: "start" },
  { id: "create", num: "1", label: "Create your blog", part: "ship" },
  { id: "deploy", num: "2", label: "Deploy to Cloudflare", part: "ship" },
  { id: "claim", num: "3", label: "Claim your admin", part: "ship" },
  { id: "model", num: "4", label: "Change the content model", part: "ship" },
  { id: "connect", num: "5", label: "Connect your agent", part: "automate" },
  { id: "operate", num: "6", label: "Run your content desk", part: "automate" },
  { id: "guardrail", num: "7", label: "Hit the guardrail", part: "automate" },
  { id: "developer", num: "8", label: "Agent as developer", part: "automate", optional: true },
  { id: "starter", num: "9", label: "Open the plugin starter", part: "extend" },
  { id: "manifest", num: "10", label: "Write the trust contract", part: "extend" },
  { id: "generate", num: "11", label: "Generate a cover", part: "extend" },
  { id: "expose", num: "12", label: "Hand it to editors and agents", part: "extend" },
  { id: "rule", num: "13", label: "Enforce the publish rule", part: "extend" },
  { id: "install", num: "14", label: "Install and deploy", part: "extend" },
  { id: "payoff", num: "15", label: "The payoff", part: "extend" },
  { id: "ship-it", num: "16", label: "Ship it", part: "extend" },
];

export const runOfShow = [
  { time: "0:00", label: "Opening" },
  { time: "0:05", label: "Setup check" },
  { time: "0:12", label: "Ship", accent: true },
  { time: "0:42", label: "Automate", accent: true },
  { time: "1:12", label: "Break" },
  { time: "1:17", label: "Extend", accent: true },
  { time: "1:52", label: "Close and Q&A" },
];
