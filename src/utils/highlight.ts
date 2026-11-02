const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Minimal JSONC highlighter for the manifest excerpt: keys, strings and comments,
 * using the same classes as the guide's stylesheet (.k, .s, .c).
 */
export function highlightJsonc(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      let out = "";
      const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\/\/.*$)/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        out += escape(line.slice(last, m.index));
        if (m[3]) out += `<span class="c">${escape(m[3])}</span>`;
        else if (m[2]) out += `<span class="k">${escape(m[1]!)}</span>${m[2]}`;
        else out += `<span class="s">${escape(m[1]!)}</span>`;
        last = m.index + m[0].length;
      }
      return out + escape(line.slice(last));
    })
    .join("\n");
}
