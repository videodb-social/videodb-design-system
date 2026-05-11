# VideoDB Design System

The canonical design system for [videodb.io](https://videodb.io) — tokens, typography, components, motion, accessibility rules, and a live showcase.

**Live showcase:** [videodb-design-system.vercel.app/design-system](https://videodb-design-system.vercel.app/design-system)

---

## What's in here

| File / Folder | What it is |
|---|---|
| **`videodb-design.md`** | The spec. Single source of truth — tokens, typography, components, hero variants, WebGL recipes, accessibility floors, do's & don'ts. Versioned (currently v1.5). |
| **`homepage-showcase.html`** | Single-page interactive showcase of every component in the system. Includes a built-in **Review Mode** (see below). Run it locally or open the deployed version. |
| **`assets/logos/`** | Official VideoDB logo lockups (wordmark dark/light, V-glyph icon, square dark/light). PNG only — never re-render the wordmark in HTML/CSS. |
| **`scripts/build-vercel.py`** | Build script. Strips the Review Mode CSS + JS, retitles, copies assets, writes `vercel.json`, and outputs a deploy-ready `vercel-deploy/` folder. |

The deployed production version (`vercel-deploy/design-system.html`) is regenerated from the source HTML by the build script — it doesn't live in the repo committed.

---

## View locally

Open `homepage-showcase.html` directly in a browser. Everything loads from CDNs (Google Fonts, Iconify, GSAP, Three.js); no build step required.

```bash
open homepage-showcase.html              # macOS
xdg-open homepage-showcase.html          # Linux
start homepage-showcase.html             # Windows
```

Or serve over HTTP if your browser blocks local file:// requests for CDN scripts:

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

What you get:
- A pulsing "REVIEW MODE" indicator in the top-right.
- Hover any element to see a label of what you're about to select; click to drop a numbered pin.
- A side panel for each comment: text, attachments (paste screenshots directly with Cmd/Ctrl+V), reference links.
- Statuses: **open** (orange pin) · **needs-review** (blue) · **resolved** (grey).
- A bottom-right floating button opens the comments sidebar with filters and a **Submit feedback** button that writes a JSON bundle to a folder you pick (via the File System Access API).

The folder pick is persisted to IndexedDB so future submits go to the same location automatically.

To import responses from Claude, use the **Load Claude responses…** button in the sidebar — pick the JSON bundle, comments flip to needs-review with the response attached.

This entire system is excluded from the production Vercel deploy.

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

Standard git push to whatever remote you configure. The `.gitignore` excludes the `feedback/` review-state folder, the `vercel-deploy/` build output, and OS-level cruft.

---

## Design system versioning

Spec changes require a version bump in `videodb-design.md`'s `version` frontmatter (`videodb-design-vX.Y`) and a one-line note in `status:` describing what changed. The showcase is the live reference for the current version — anything documented in the spec should render in the showcase.

Current: **v1.5** — adds anchor pill, tag chip, byline, binary toggle, diagram card, pill input + buzz, entry row, project tile, dispatch card. See `videodb-design.md` `status:` for the full changelog.

---

## License

Internal — not yet public.
