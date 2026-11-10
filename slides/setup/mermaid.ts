// Mermaid renders in a shadow root; `themeCSS` is compiled into the SVG, and custom properties
// inherit through the shadow boundary, so the diagram follows the stage (and the room switch).
// Node groups carry ids like `…flowchart-W-0`, so the hubs are picked out with no fence change.
export default async () => {
  // mermaid measures labels at render time and caches the result, so the faces must be loaded first
  if (typeof document !== 'undefined')
    await Promise.all(['500 32px Inter', '600 32px Inter'].map(font => document.fonts.load(font))).catch(() => {})
  return {
    theme: 'base',
    look: 'classic',
    // mermaid 12 defaults to the ELK layout, which ignores the flowchart spacing below
    layout: 'dagre',
    themeVariables: {
      fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
      fontSize: '32px',
      useGradient: false,
      dropShadow: 'none',
      background: '#f9f9f9',
      mainBkg: '#ffffff',
      primaryColor: '#ffffff',
      secondaryColor: '#ffffff',
      tertiaryColor: '#ffffff',
      primaryTextColor: '#0a0a0a',
      textColor: '#262626',
      primaryBorderColor: '#3d3d3d',
      nodeBorder: '#3d3d3d',
      lineColor: '#4d4d4d',
      edgeLabelBackground: '#f9f9f9',
      clusterBkg: '#fcfcfc',
    },
    // wrappingWidth 520: the longest labels ("Worker: Astro site + EmDash" 443px, "Editor: Generate cover button" 450px) stay on one line
    flowchart: { curve: 'basis', nodeSpacing: 56, rankSpacing: 112, padding: 28, wrappingWidth: 520, useMaxWidth: true, htmlLabels: true },
    themeCSS: `
      .node rect, .node polygon, .node circle, .node path { fill: var(--panel, #fff) !important; stroke: var(--node-line, #3d3d3d) !important; stroke-width: 2px !important; }
      .node rect { rx: 18px; ry: 18px; }
      .nodeLabel, .nodeLabel * { color: var(--ink-strong, #0a0a0a) !important; font-weight: 500; line-height: 1.25; }
      .edgeLabel, .edgeLabel p, .edgeLabel span, .labelBkg { background-color: var(--stage, #f9f9f9) !important; color: var(--muted, #6b6b6b) !important; font-size: 26px; font-weight: 500; }
      .edgeLabel rect { fill: var(--stage, #f9f9f9) !important; }
      .flowchart-link { stroke: var(--edge, #4d4d4d) !important; stroke-width: 2px !important; }
      marker { overflow: visible; }
      marker path { fill: var(--edge, #4d4d4d) !important; stroke: var(--edge, #4d4d4d) !important; stroke-linejoin: round; transform: scale(1.7); transform-origin: 10px 5px; }
      [id*="flowchart-W-"] rect, [id*="flowchart-G-"] rect { fill: var(--hub-fill, #fff3ee) !important; stroke: #ff5e1f !important; stroke-width: 3px !important; }
      [id*="flowchart-W-"] .nodeLabel, [id*="flowchart-W-"] .nodeLabel *, [id*="flowchart-G-"] .nodeLabel, [id*="flowchart-G-"] .nodeLabel * { font-weight: 600 !important; }
      [id*="flowchart-G-"] .nodeLabel, [id*="flowchart-G-"] .nodeLabel * { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
      [id*="flowchart-X1-"] rect, [id*="flowchart-X2-"] rect { stroke: var(--danger, #c42b1c) !important; stroke-dasharray: 10 8; }
      [id*="flowchart-X1-"] .nodeLabel, [id*="flowchart-X1-"] .nodeLabel *, [id*="flowchart-X2-"] .nodeLabel, [id*="flowchart-X2-"] .nodeLabel * { color: var(--danger, #c42b1c) !important; font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 28px; }
    `,
  }
}
