import { fill } from "../data/workshop";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:)/;

/**
 * Renders the small amount of formatting short text fields allow:
 * `code`, **bold**, *italic* or _italic_, and [links](https://…), after filling {{placeholders}}.
 * Everything else is escaped, so editors can't inject HTML.
 */
export function inline(text: string | null | undefined): string {
  if (!text) return "";
  const codes: string[] = [];
  let out = escape(fill(text)).replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${c}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_(?!\s)(.+?)_(?!\w)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, href: string) =>
      SAFE_HREF.test(href) ? `<a href="${href}">${label}</a>` : m,
    );
  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)]!);
}
