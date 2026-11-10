// Page behaviour for the guide: first-paint gating, smooth-scroll arming, the top bar's scrolled state,
// copy buttons, prompt expand/collapse, editable prompts, disclosures and code scrollers.
// The rail (scrollspy, progress, mobile sheet) lives in ./rail.ts.

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const EASE_OPEN = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_CLOSE = "cubic-bezier(0.4, 0, 0.2, 1)";
const root = document.documentElement;

// 0. Nothing animates on first paint: .ready lands two frames after load.
const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("ready")));
if (document.readyState === "complete") ready();
else addEventListener("load", ready, { once: true });

// 1. Smooth anchor scrolling only after the first interaction, so a shared #step link lands instantly.
const arm = () => {
  if (!reduce.matches) root.classList.add("smooth-scroll");
};
addEventListener("pointerdown", arm, { once: true, capture: true });
addEventListener("keydown", arm, { once: true, capture: true });

// 1b. A shared #step link focuses that card on load (tabindex="-1"), and Chrome can match
//     :focus-visible before any interaction, leaving a permanent ring. The landing halo marks
//     the card instead; the ring comes back once focus leaves it (keyboard jumps keep theirs).
let landedId = "";
try {
  landedId = decodeURIComponent(location.hash.slice(1));
} catch {
  /* a malformed hash lands nowhere */
}
const landed = landedId ? document.getElementById(landedId) : null;
if (landed?.classList.contains("step")) {
  landed.setAttribute("data-landed", "");
  landed.addEventListener("blur", () => landed.removeAttribute("data-landed"), { once: true });
}

// 2. The top bar gets its glass ground past 24px. A crossing that happens beyond 160px
//    (a #link, a restored position, a fast fling) snaps instead of fading.
const topbar = document.querySelector<HTMLElement>("[data-topbar]");
let barTick = false;
const syncBar = () => {
  barTick = false;
  if (!topbar) return;
  const scrolled = String(scrollY > 24);
  if (topbar.dataset.scrolled === scrolled) return;
  topbar.toggleAttribute("data-instant", scrollY > 160);
  topbar.dataset.scrolled = scrolled;
};
addEventListener(
  "scroll",
  () => {
    if (!barTick) {
      barTick = true;
      requestAnimationFrame(syncBar);
    }
  },
  { passive: true },
);
syncBar();

// 3. Copy: honest about failure, safe to click again, announced. "Copied" holds for 4000ms.
const timers = new WeakMap<HTMLElement, number>();
const sizeLabels = (btn: HTMLElement) => {
  const wrap = btn.querySelector<HTMLElement>("[data-labels]");
  const on = wrap?.querySelector<HTMLElement>(".is-on");
  if (!wrap || !on) return;
  // A button inside a closed <details> measures 0: leave it at its natural width.
  const w = on.scrollWidth;
  if (w) wrap.style.inlineSize = `${w}px`;
  else wrap.style.removeProperty("inline-size");
};
document.fonts.ready.then(() => document.querySelectorAll<HTMLElement>("[data-copy]").forEach(sizeLabels));
const setCopied = (btn: HTMLElement, on: boolean) => {
  const wrap = btn.querySelector<HTMLElement>("[data-labels]");
  if (wrap && !wrap.style.inlineSize) {
    sizeLabels(btn); // start the width morph from a measured width, never from auto
    void wrap.offsetWidth;
  }
  const box = btn.closest<HTMLElement>(".prompt, .code");
  btn.dataset.copied = String(on);
  if (box) box.dataset.copied = String(on);
  const idle = btn.querySelector<HTMLElement>("[data-label-idle]");
  const done = btn.querySelector<HTMLElement>("[data-label-done]");
  idle?.classList.toggle("is-on", !on);
  done?.classList.toggle("is-on", on);
  idle?.setAttribute("aria-hidden", String(on));
  done?.setAttribute("aria-hidden", String(!on));
  sizeLabels(btn);
};
async function write(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}
const selectForManualCopy = (el: HTMLElement) => {
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  const r = document.createRange();
  r.selectNodeContents(el);
  const s = getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
};
document.addEventListener("click", async (e) => {
  const btn = (e.target as Element).closest<HTMLElement>("[data-copy]");
  if (!btn) return;
  const box = btn.closest<HTMLElement>(".prompt, .code");
  const source = box?.querySelector<HTMLElement>("[data-copy-source]") ?? box?.querySelector<HTMLElement>("pre");
  const status = box?.querySelector<HTMLElement>("[data-copy-status]");
  const text = (btn.dataset.copyText ?? source?.innerText ?? "").trim();
  clearTimeout(timers.get(btn)); // a re-click restarts the hold and never sticks
  if (await write(text)) {
    setCopied(btn, true);
    if (status) {
      status.textContent = "";
      requestAnimationFrame(() => {
        status.textContent = "Copied";
      });
    }
    timers.set(
      btn,
      window.setTimeout(() => {
        setCopied(btn, false);
        if (status) status.textContent = "";
      }, 4000),
    );
  } else {
    setCopied(btn, false);
    if (source) selectForManualCopy(source); // never claims "Copied"
  }
});

// 4. Prompt expand / collapse: WAAPI on max-height, the fade via CSS opacity. Interruptible:
//    the live height is measured BEFORE cancelling, so a reversal starts where the pane is.
document.addEventListener("click", (e) => {
  const toggle = (e.target as Element).closest<HTMLElement>("[data-toggle]");
  if (!toggle) return;
  const prompt = toggle.closest<HTMLElement>(".prompt");
  const pane = prompt?.querySelector<HTMLElement>("[data-pane]");
  const label = toggle.querySelector<HTMLElement>("[data-toggle-label]");
  if (!prompt || !pane || !label) return;
  const expanding = prompt.dataset.expanded !== "true";
  const from = pane.getBoundingClientRect().height;
  pane.getAnimations().forEach((a) => a.cancel());
  if (!expanding) {
    // keep the window in view when collapsing a long prompt (with its docked "What the prompt does" strip)
    const prev = prompt.previousElementSibling;
    const head = prev?.classList.contains("aside--attached") ? (prev as HTMLElement) : prompt;
    const top = head.getBoundingClientRect().top;
    const limit = (topbar?.getBoundingClientRect().bottom ?? 0) + 16;
    if (top < limit) scrollBy({ top: top - limit, behavior: reduce.matches ? "auto" : "smooth" });
  }
  prompt.dataset.expanded = String(expanding);
  toggle.setAttribute("aria-expanded", String(expanding));
  label.textContent = expanding ? "Show less" : "Show full prompt";
  if (reduce.matches) return;
  const to = pane.getBoundingClientRect().height;
  const dh = Math.abs(to - from);
  pane.animate([{ maxHeight: `${from}px` }, { maxHeight: `${to}px` }], {
    duration: expanding ? Math.min(480, 240 + dh / 4) : Math.min(360, 200 + dh / 6),
    easing: expanding ? EASE_OPEN : EASE_CLOSE,
  });
});

// 5. Editing a collapsed editable prompt expands it.
document.addEventListener("focusin", (e) => {
  const pre = (e.target as HTMLElement).closest?.<HTMLElement>('pre[contenteditable="true"]');
  const p = pre?.closest<HTMLElement>(".prompt");
  if (p?.dataset.expanded === "false") p.querySelector<HTMLButtonElement>("[data-toggle]")?.click();
});

// 6. Disclosures: the brand FAQ timing, independent (not an accordion), interruptible.
//    Native <details> without JS. Branch on data-state (the intent), never on d.open,
//    which stays true through a close animation.
document.querySelectorAll<HTMLDetailsElement>("details[data-disclosure]").forEach((d) => {
  const summary = d.querySelector<HTMLElement>(":scope > summary");
  const panel = d.querySelector<HTMLElement>(":scope > [data-panel]");
  if (!summary || !panel) return;
  const sync = () => {
    d.dataset.state = d.open ? "open" : "closed";
  };
  sync();
  // find-in-page and other native opens keep data-state and the chevron honest
  d.addEventListener("toggle", () => {
    if (!panel.getAnimations().length) sync();
  });
  summary.addEventListener("click", (e) => {
    if (reduce.matches) return; // native toggle; the toggle listener syncs data-state
    e.preventDefault();
    // the live height mid-animation, else 0 when closed (Chrome keeps a closed panel's box measurable)
    const running = panel.getAnimations().length > 0;
    const from = d.dataset.state === "open" || running ? panel.getBoundingClientRect().height : 0;
    panel.getAnimations().forEach((a) => a.cancel());
    if (d.dataset.state !== "open") {
      d.dataset.state = "open";
      d.open = true;
      const to = panel.scrollHeight;
      panel.animate(
        [
          { height: `${from}px`, opacity: from ? 1 : 0 },
          { height: `${to}px`, opacity: 1 },
        ],
        { duration: 180, easing: EASE_OPEN },
      );
    } else {
      d.dataset.state = "closed";
      const a = panel.animate(
        [
          { height: `${from}px`, opacity: 1 },
          { height: "0px", opacity: 0 },
        ],
        { duration: 160, easing: EASE_CLOSE, fill: "forwards" },
      );
      a.onfinish = () => {
        d.open = false;
        a.cancel();
      }; // a reversal cancels `a`, so onfinish never runs
    }
  });
});

// 7. Horizontal code scrollers are keyboard-focusable only while they overflow (Safari won't do it for us).
const scrollers = [...document.querySelectorAll<HTMLElement>("[data-scroller]")];
const syncScrollers = () =>
  scrollers.forEach((el) => {
    if (el.scrollWidth > el.clientWidth) el.setAttribute("tabindex", "0");
    else el.removeAttribute("tabindex");
  });
document.fonts.ready.then(syncScrollers);
addEventListener("resize", syncScrollers, { passive: true });
// a scroller inside a closed disclosure measures 0 until it opens
document.addEventListener("toggle", syncScrollers, { capture: true });
