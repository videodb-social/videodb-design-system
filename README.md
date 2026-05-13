# VideoDB Design System

The canonical design system for [videodb.io](https://videodb.io) — tokens, typography, components, motion, accessibility rules, and a live showcase.

**Live showcase:** [videodb-design-system.vercel.app/design-system](https://videodb-design-system.vercel.app/design-system)

---

## What's in here

| File / Folder | What it is |
|---|---|
| **`videodb-design.md`** | The spec. Single source of truth — tokens, typography, components, hero variants, article-template chrome, WebGL recipes, accessibility floors, do's & don'ts. Versioned (currently **v1.10**). |
| **`homepage-showcase.html`** | Single-page interactive showcase of every component in the spec. Includes a built-in **Review Mode** (see below). Run locally or open the deployed version. |
| **`assets/logos/`** | Official VideoDB logo lockups (wordmark dark/light, V-glyph icon, square dark/light). PNG only — never re-render the wordmark in HTML/CSS. |
| **`scripts/build-vercel.py`** | Build script. Strips the Review Mode CSS + JS using a sentinel-bounded regex, retitles, copies assets, writes `vercel.json`, and outputs a deploy-ready `vercel-deploy/` folder. |
| **`scripts/lint-font-sizes.py`** | Pre-publish lint. Enforces the spec's 11px microcopy floor — fails the build if any `font-size` below 11px sneaks into the showcase (outside the Review Mode block, which is stripped at build). |
| **`scripts/ui-review-flow/`** | The Review Mode harness as a self-contained, portable skill bundle — `SKILL.md`, `INTEGRATION.md`, `review-mode.css`, `review-mode.js`, `extract.py`. Drop it into any single-page HTML showcase to add the same point-and-click commenting overlay. See [reuse](#reuse-the-review-flow-elsewhere) below. |
| **`CLAUDE.md`** | Working notes for Claude sessions on this repo: hard rules from the spec, review-flow workflow, pre-publish checklist. |

The deployed production version (`vercel-deploy/design-system.html`) is regenerated from the source HTML by the build script — it's `.gitignore`d, not tracked in the repo.

---

## View locally

Open `homepage-showcase.html` directly in a browser. Everything loads from CDNs (Google Fonts, Iconify, GSAP, Three.js); no build step required.

```bash
open homepage-showcase.html              # macOS
xdg-open homepage-showcase.html          # Linux
start homepage-showcase.html             # Windows
```

Or serve over HTTP if your browser blocks local `file://` requests for CDN scripts:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/homepage-showcase.html
```

---

## Review Mode — leave pinned comments

The showcase has a built-in Figma-style pin commenting overlay. Append `?review=1` to the URL:

```
homepage-showcase.html?review=1
```

The harness has evolved across the v1.6 → v1.10 rounds; this is the current behavior.

**Activating pin mode.** With `?review=1` the toolbar pill (top-right, "REVIEW MODE", pulsing orange dot) appears as an on/off toggle. Default state on first load is **ON** — drop pins anywhere. Click the pill to flip to **OFF** (hollow dot, label "Review Mode · Off") so the page navigates normally without dropping pins. Preference persists across reloads via localStorage. When the comments sidebar is open, pin-drop is implicit and the toolbar pill hides automatically.

**Dropping pins.** Hover any element to see its auto-generated `data-comment-id` label (e.g. `Card · card-soft · Tag chips — light`); click to drop a numbered pin and open a comment panel. Hold ⌘ (Mac) / Ctrl (Win) to switch from "closest tagged ancestor" to "deepest descendant" — useful for targeting a child inside a card without grabbing the card itself. ⌘-click also accumulates multiple elements into a multi-target selection; click off (or click the floating bottom-center chip) to open a single comment that targets all selected elements at once.

**Per-comment data.** Each pin holds: comment text, attachments (file picker + clipboard paste for screenshots), reference links (paste URLs, Enter to add more), and a threaded history that records the full back-and-forth.

**Statuses.** Open (orange pin) · needs-review (blue, set automatically when an AI response arrives) · resolved (grey).

**Sidebar.** A bottom-right floating button opens the comments sidebar — filters by status (Open / Needs review / Resolved / All), shows the per-pin thread, and carries two action buttons:

- **Submit feedback** — writes `feedback-bundle-LATEST.json` to a folder you pick once via the browser's File System Access API. The folder handle is persisted to IndexedDB so subsequent submits go to the same location with no prompt. Browsers without the API (Safari, Firefox) fall back to a regular download.
- **Load Claude responses…** — picks an AI-generated response bundle. Each comment with a response flips to needs-review and the reply is appended to the comment's history thread. The "Didn't fix it" thumbs-down on any reply opens a follow-up textarea that records a new user entry in the same thread and flips the status back to open.

**Stripping for production.** The Review Mode CSS and JS are excluded from the Vercel deploy via `scripts/build-vercel.py`. The strip is sentinel-bounded (terminates at a `/* End of Review Mode CSS … */` comment), so component CSS added *below* the Review Mode block ships correctly — a regression caught and fixed in v1.10.

---

## Reuse the review flow elsewhere

The Review Mode harness lives as a self-contained skill bundle in `scripts/ui-review-flow/`:

```
scripts/ui-review-flow/
├── SKILL.md          # short skill description (when / why)
├── INTEGRATION.md    # long-form how-to + JSON bundle schema
├── review-mode.css   # drop into any <style> block
├── review-mode.js    # drop into a <script> block before </body>
└── extract.py        # re-extract from this project's homepage-showcase.html if the canonical version evolves
```

Copy the folder to a shared location once:

```bash
cp -r scripts/ui-review-flow ~/Documents/Claude/Skills/
```

Then in any future Claude session working on a different showcase, say:

> "Use the UI review flow skill at `~/Documents/Claude/Skills/ui-review-flow/`."

Claude loads `SKILL.md`, finds the CSS/JS, and injects them into the target showcase. See `scripts/ui-review-flow/INTEGRATION.md` for the bundle JSON schema and per-version interaction details (v3 added threaded follow-ups + Cmd-click multi-select; v4 added the pin-mode toggle, edit-in-place panel UX, slim attachment persistence, and per-comment page attribution).

---

## Pre-publish checklist

Before shipping a new version to GitHub + Vercel:

1. **Bump the spec version.** Edit `videodb-design.md` frontmatter — `version: "videodb-design-vX.Y"` and rewrite the `status:` line into a tight single-paragraph summary. Detail goes in the `## Changelog` section at the bottom of the spec, not in the status line.
2. **Lint.** `python3 scripts/lint-font-sizes.py` — fails on any sub-11px font-size declaration outside the Review Mode block.
3. **Build.** `python3 scripts/build-vercel.py` — strips Review Mode, regenerates `vercel-deploy/design-system.html`. Sanity-check: the script reports `stripped N review-mode lines` and the output exists.
4. **Clear stale review state.** Delete `feedback/` (it's `.gitignore`d, but clearing it locally avoids confusion across rounds).
5. **Commit + push to GitHub.** Conventional commit message: `vX.Y — <short headline>` followed by a body grouped by P0 / P1 / P2 with the diff.
6. **Deploy to Vercel.** From the project root: `cd vercel-deploy && vercel --prod`.

---

## Deploy

### Vercel (production)

```bash
# One-time: install Vercel CLI
npm i -g vercel

# Build the stripped production version
python3 scripts/build-vercel.py

# Deploy
cd vercel-deploy
vercel login         # first time — browser OAuth
vercel --prod
```

The `vercel.json` in the deploy folder sets `cleanUrls: true` and redirects `/` to `/design-system`, so the live URL serves the showcase at `/design-system`.

### GitHub

Standard `git push origin main`. The `.gitignore` excludes:

- `feedback/` — review-state JSON bundles + extracted attachments. Regenerated per round.
- `vercel-deploy/` — derived build output. Regenerated by `scripts/build-vercel.py`.
- `VideoDB Labs (ClaudeDesign)/` — reference material from the sibling Labs project.
- `.vercel/` — per-machine Vercel project linkage (not portable across collaborators).
- `__pycache__/` — Python bytecode cache.

---

## Design system versioning

Spec changes require a version bump in `videodb-design.md`'s `version` frontmatter (`videodb-design-vX.Y`) and a tight `status:` summary describing what changed. Substantive changes earn a minor bump (`v1.5 → v1.6`); token / typography / motion baseline changes earn a major bump. The showcase is the live reference for the current version — anything documented in the spec should render in the showcase, and vice versa.

**Current:** **v1.10** — sweep round following the v1.9 cross-page audit. Vercel deploy fix (build script now sentinel-bounded), heading-md locked at 32px with a new `.subsection-heading` class for 22–26px subheadings, `.section-heading.is-stacked` modifier for stacked subsection openers, `.frame` carries inner-frame padding via its own CSS rule (retires 14 inline `style="padding: 0 24px;"` overrides), `.article-hero-back-link` promoted from inline `onmouseover` hack to a real class, new `scripts/lint-font-sizes.py` enforces the 11px floor, showcase-only chrome documented as not-for-production. See the `## Changelog` section in `videodb-design.md` for the full v1.5 → v1.10 history.

**Recent rounds (full detail in spec changelog):**

- **v1.10** — Vercel deploy fix, heading-md lock, `.subsection-heading`, `.section-heading.is-stacked`, `.frame` padding refactor, lint script, showcase chrome documented.
- **v1.9** — Article ending nav, kicker category-collision rule, hub eyebrow redundancy rule, install snippet with copy button, project tile chip-hover rule. Walked back the v1.8 `pre:has(> code.language-text)` "code response" variant.
- **v1.8** — Article Page Template (article hero, shell, TOC). `mono-xs` floor lifted from 10px to 11px.
- **v1.7** — sections 22–30, celebratory sent-state pattern, `.is-static` modifier, `.on-light` form scope.
- **v1.6** — promoted Labs primitives: `.note-card`, `.build-card`, `.research-card`, global `::selection` rules.
- **v1.5** — initial release: anchor pill, tag chip, byline, binary toggle, diagram card, pill input + buzz, entry row, project tile, dispatch card.

---

## License

Internal — not yet public.
