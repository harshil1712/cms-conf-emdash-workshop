/**
 * The scopes on EmDash's OAuth consent screen. Labels are the exact wording from
 * EmDash (oauth/authorize SCOPE_LABELS), so they stay in code, not in the CMS.
 */
export type Scope = { name: string; note: string; on?: boolean; isNew?: boolean; danger?: boolean };

export const baseScopes: Scope[] = [
  { name: "content:read", note: "Read content (posts, pages, etc.)", on: true },
  { name: "content:write", note: "Create, edit, and delete content; manage menus and taxonomies", on: true },
  { name: "media:read", note: "View media files", on: true },
  { name: "media:write", note: "Upload and manage media files", on: true },
  { name: "schema:read", note: "View collection schemas", on: true },
  { name: "schema:write", note: "Create and modify collection schemas", danger: true },
  { name: "taxonomies:manage", note: "Manage taxonomies" },
  { name: "menus:manage", note: "Manage navigation menus" },
  { name: "settings:read", note: "View site settings" },
  { name: "settings:manage", note: "Modify site settings" },
  { name: "mcp:tools", note: "Use MCP tools from all enabled plugins" },
  { name: "transfer:export", note: "Export a copy of the entire site: all content, drafts, media, settings, and author names and emails" },
  { name: "transfer:analyze", note: "Upload site packages and check whether they can be imported into this site" },
  { name: "transfer:execute", note: "Import a site package into this empty site, overwriting its initial setup" },
  { name: "admin", note: "Full administrative access", danger: true },
];

/** Step 15: the same five, plus mcp:tools. */
export const reconnectScopes: Scope[] = [
  ...baseScopes.slice(0, 5),
  { name: "mcp:tools", note: "Use MCP tools from all enabled plugins", isNew: true },
  { name: "schema:write", note: "Create and modify collection schemas. Still unticked.", danger: true },
  { name: "admin", note: "Full administrative access. Still unticked.", danger: true },
];
