// ✅ and ❌ in tables become the guide's check and cross marks (style.css `.mk`).
// The emoji stays in the DOM, so screen readers and copied text are unchanged.
export default () => ({
  pre: [
    (ctx: { s: { replaceAll: (search: string, replacement: string) => unknown } }) => {
      ctx.s.replaceAll('✅', '<span class="mk mk-yes">✅</span>')
      ctx.s.replaceAll('❌', '<span class="mk mk-no">❌</span>')
    },
  ],
})
