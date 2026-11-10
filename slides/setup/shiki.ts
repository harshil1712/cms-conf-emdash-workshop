// Brand code colours: ink plus greys, like emdashcms.com's code panes. Orange in code is only the
// highlight band, its bar and its line numbers (style.css). No runtime imports: this file also runs in Node.

const emdashLight = {
  name: 'emdash-light',
  type: 'light',
  colors: { 'editor.background': '#ffffff', 'editor.foreground': '#262626' },
  tokenColors: [
    { settings: { foreground: '#262626' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6b6b6b' } },
    {
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string', 'constant.numeric', 'constant.language', 'constant.other', 'constant.character'],
      settings: { foreground: '#4d4d4d' },
    },
    {
      scope: ['keyword', 'keyword.control', 'keyword.operator', 'keyword.other', 'storage', 'storage.type', 'storage.modifier', 'punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition', 'meta.embedded punctuation'],
      settings: { foreground: '#6b6b6b' },
    },
    {
      scope: ['support.type.property-name', 'punctuation.support.type.property-name', 'meta.object-literal.key', 'variable.other.property', 'variable.other.object.property', 'entity.name.function', 'support.function', 'entity.name.type', 'support.class', 'variable.other.constant', 'entity.name.tag', 'variable', 'variable.other.readwrite'],
      settings: { foreground: '#0a0a0a' },
    },
  ],
}

// The room switch (colorSchema: dark)
const emdashDark = {
  name: 'emdash-dark',
  type: 'dark',
  colors: { 'editor.background': '#141414', 'editor.foreground': '#f5f5f5' },
  tokenColors: [
    { settings: { foreground: '#f5f5f5' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#a3a3a3' } },
    {
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string', 'constant.numeric', 'constant.language', 'constant.other', 'constant.character'],
      settings: { foreground: '#c9c9c9' },
    },
    {
      scope: ['keyword', 'keyword.control', 'keyword.operator', 'keyword.other', 'storage', 'storage.type', 'storage.modifier', 'punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition', 'meta.embedded punctuation'],
      settings: { foreground: '#a3a3a3' },
    },
    {
      scope: ['support.type.property-name', 'punctuation.support.type.property-name', 'meta.object-literal.key', 'variable.other.property', 'variable.other.object.property', 'entity.name.function', 'support.function', 'entity.name.type', 'support.class', 'variable.other.constant', 'entity.name.tag', 'variable', 'variable.other.readwrite'],
      settings: { foreground: '#ffffff' },
    },
  ],
}

// A JSON fragment with no enclosing braces (slide 43's manifest excerpt) leaves its top-level keys scoped
// as plain strings and their colons unscoped. Recolour them to the property-name and punctuation colours
// the nested keys get, so a key looks like a key at every depth.
const KEY_STYLE = '--shiki-light:#0A0A0A;--shiki-dark:#FFFFFF'
const PUNCT_STYLE = '--shiki-light:#6B6B6B;--shiki-dark:#A3A3A3'
const DEFAULT_FG = '--shiki-light:#262626;--shiki-dark:#F5F5F5'
const text = (node: any): string => (node?.children ?? []).map((c: any) => c.type === 'text' ? c.value : text(c)).join('')
const norm = (style: unknown) => String(style ?? '').replace(/\s|;$/g, '').toUpperCase()
const sameStyle = (a: unknown, b: string) => norm(a) === norm(b)

export default () => ({
  themes: { light: emdashLight, dark: emdashDark },
  transformers: [
    {
      name: 'emdash:json-fragment-keys',
      line(node: any) {
        // @ts-expect-error shiki transformer context
        if (!['json', 'jsonc', 'json5'].includes(this.options.lang))
          return
        const spans = node.children.filter((c: any) => c.type === 'element')
        spans.forEach((span: any, i: number) => {
          const next = spans[i + 1]
          if (/^"[^"]*"$/.test(text(span).trim()) && text(next).trimStart().startsWith(':')) {
            span.properties.style = KEY_STYLE
            if (sameStyle(next.properties.style, DEFAULT_FG))
              next.properties.style = PUNCT_STYLE
          }
          else if (/^[,:]$/.test(text(span).trim()) && sameStyle(span.properties.style, DEFAULT_FG)) {
            span.properties.style = PUNCT_STYLE
          }
        })
      },
    },
    {
      // Shiki never puts `language-*` on the code, so tag the <pre> for the line-number rule in style.css
      name: 'emdash:lang',
      pre(node: any) {
        // @ts-expect-error shiki transformer context
        this.addClassToHast(node, `lang-${this.options.lang}`)
      },
    },
  ],
})
