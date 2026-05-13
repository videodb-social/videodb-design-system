# UI Review Flow — Integration Guide

Long-form reference for adding the review harness to any HTML showcase, and for handling the round-trip JSON bundle protocol on the AI side.

## File inventory

| File | Purpose |
|---|---|
| `SKILL.md` | Short skill description — what / when / why. |
| `INTEGRATION.md` | This file. Long-form how-to. |
| `review-mode.css` | The CSS block. Drop into any `<style>` in the target HTML. |
| `review-mode.js` | The JS block. Drop into a `<script>` near `</body>`. |
| `extract.py` | Re-extract from a source HTML if the canonical version evolves. |

## Adding to a new showcase — step by step

### 1. Make sure the target page has Iconify

The harness uses `iconify-icon` for the comment-panel icons, sidebar, and pin labels. Add this in the `<head>` if not present:

```html
<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
```

### 2. Inject the CSS

Open the target page's `<style>` block (or add one). Paste the contents of `review-mode.css` at the bottom, before `</style>`.

If the page uses CSS variables like `--color-primary`, `--charcoal`, `--neutral-dark`, `--ease-ui`, `--dur-ui`, `--dur-ext`, `--r-control`, `--r-surface-md`, `--r-card`, `--border-on-dark`, `--border-on-light`, `--text-on-dark`, `--text-on-dark-muted`, `--text-on-dark-subtle`, `--surface-light`, `--surface-light-hover`, `--primary-ring-soft`, `--primary-ring-strong`, `--shadow-overlay`, `--shadow-lift-light` — the harness will pick them up. If not, define them in `:root` or substitute literal values in `review-mode.css`.

Minimum variables the review harness needs:

```css
:root {
  --color-primary:        #F24E1E;
  --color-error:          #E5484D;
  --charcoal:             #161616;
  --neutral-dark:         #0A0A0A;
  --ease-ui:              cubic-bezier(0.4, 0, 0.2, 1);
  --dur-ui:               150ms;
  --dur-ext:              300ms;
  --r-control:            9999px;
  --r-surface-md:         16px;
  --r-card:               12px;
  --border-on-dark:       rgba(255, 255, 255, 0.08);
  --border-on-light:      rgba(0, 0, 0, 0.08);
  --shadow-overlay:       0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4);
}
```

### 3. Inject the JS

Place the contents of `review-mode.js` inside a `<script>` tag near the end of `<body>`, after any other scripts that mutate the DOM (so auto-tagging sees the final structure).

```html
  <!-- ...page content... -->

  <script>
    /* paste contents of review-mode.js here */
  </script>
</body>
```

### 4. Test

Open the page with `?review=1` appended:

```
file:///path/to/your-showcase.html?review=1
```

A pulsing **REVIEW MODE** pill should appear top-right. Hover any element to see its auto-generated `data-comment-id` label. Click to drop a pin.

## How auto-tagging works

On boot, the harness walks the DOM and assigns a `data-comment-id` attribute to every meaningful element it recognizes — sections, buttons, cards, pills, badges, code blocks, mega-menus, stats, icons, type samples, logo tiles, etc.

The label is human-readable, e.g.:

- `Section · 04 / Pills & Tabs`
- `Button · btn-primary · Start Building`
- `Card · card-soft · Tag chips — light python latency`
- `Tier marker · Free`

If two elements would produce the same label, a uniqueness pass adds a sibling-index suffix (`#1`, `#2`).

You can pre-set `data-comment-id` on an element manually to override the auto-tag — useful if the auto-generated label is awkward.

To add support for new component classes, edit the `autoTag()` function in `review-mode.js`.

## v3 changes (May 2026)

The harness now supports four interaction improvements:

1. **Sidebar-open gate.** Pin-drop / hover labels are dormant whenever the Feedback sidebar is closed — page clicks behave normally (links navigate, buttons fire, inputs focus). Toggling the FAB enables review mode. This means `?review=1` is no longer "review mode globally on"; it's "review mode available, currently off." Open the sidebar to activate pin-drop.
2. **ESC layered close.** ESC closes the active panel first; on a second press it clears any pending Cmd+click selection; on a third press it closes the sidebar.
3. **Cmd-hold for granular selection + multi-select.** Hold ⌘ (Mac) or Ctrl (Win) to switch from "closest tagged ancestor" to "deepest tagged descendant under the cursor." Cmd+click accumulates elements into a selection set — clicking off (or clicking the floating bottom-center chip) opens one comment panel that targets all selected elements at once. A multi-target comment writes `target.additional_targets[]` into the bundle.
4. **Threaded follow-ups.** Each comment now carries a `history[]` array. When Claude replies (response bundle import), the reply gets appended to history rather than overwriting a single `claude_reply` field. The panel shows the full timeline as alternating user/Claude bubbles. A "Didn't fix it" thumbs-down on any Claude reply prompts a follow-up that's saved as a new user entry in the same comment, with `in_response_to: <reply_index>`. Status flips back to `open`. Top-level `comment` and `claude_reply` fields stay populated with the latest values for backwards compat.

The bundle version is now `3`. Older v2 bundles still load — they're migrated on the fly: each pre-existing `comment` + `claude_reply` pair becomes a 2-entry history. Response bundles emitted by the AI are unchanged (the harness handles the migration on import).

## v4 changes (May 2026)

Six further upgrades layered on v3:

1. **Pin-mode toggle (the toolbar pill is now a real button).** Previously the `REVIEW MODE` pill in the top-right was decorative; clicking it did nothing. In v4 it's the on/off toggle for pin behavior while the sidebar is closed. Default state: **ON** (orange pulsing dot + bright label) — drop pins anywhere on first load. Click → **OFF** state (hollow dot + muted label "Review Mode · Off"), pin-drop pauses, page navigates normally. Click again → ON. Choice persists across reload via `localStorage` key `videodb-review-pin-mode`. The pill hides automatically while the sidebar is open (mode is implicit then). Drives a `body.review-sidebar-open` class for CSS hide/show.

2. **`isReviewActive()` gate updated.** Was `sidebar.classList.contains('is-open')`. Now `sidebar.classList.contains('is-open') || state.pinMode`. Translation: pinning is active when EITHER the sidebar is open OR the user has explicitly enabled pin mode via the toolbar. Solves the "right side of page blocked by sidebar" problem — close the sidebar, the right side is reachable, pins still drop.

3. **Edit-in-place panel UX.** Three flavors of comment panel:
   - **New comment** — empty textarea, no thread.
   - **Existing without Claude reply** (edit-in-place) — textarea is pre-populated with the existing comment text. NO thread display. Saving overwrites the existing comment. Matches the user mental model of "click into it to change."
   - **Existing with Claude reply** (follow-up) — full history thread shown as bubbles above an empty textarea. Saving appends a new user entry to history. Status flips back to `open`.
   
   Previously v3 always showed a follow-up framing on click — felt misleading when no Claude reply existed yet.

4. **Slim attachment persistence (localStorage quota fix).** Base64 image payloads inside attachments blow past localStorage's 5–10 MB cap with just a handful of pasted screenshots. v4 strips the heavy `data` field on persist (keeps `name` / `type` / `size` metadata). The in-memory state retains full data URLs so bundle submission still carries the images. Trade-off: a page reload loses attachment blobs (comment text and attachment names persist; user re-attaches if needed).

5. **Selection / caret visibility inside the review panel.** Page-level `::selection` rules can be invisible on the panel's charcoal surface. v4 scopes `caret-color: var(--color-primary)` and `::selection { background: var(--color-primary); color: #FFFFFF }` to `.review-panel input, .review-panel textarea` so the input affordances are visible.

6. **autoTag expansions for the Article Page Template.** Tags `.article-hero`, `.article-hero-kicker`, `.article-hero-deck`, `.article-toc`, `.article-toc-label`, `.article-shell-inner`, plus markdown-embedded blocks: `.article-diagram`, `.diagram-step`, `.split-cases`, `.case-card.success/.danger`, `.measurement-card`, `.decision-list`, `.callout`. Lets the user pin directly on a diagram step or case card instead of always landing on the article-body wrapper.

The bundle version field is still `3` — v4 changes are interaction + persistence, not schema. The pin-mode pref lives in its own localStorage key (`videodb-review-pin-mode`), not in the comments bundle.

## Feedback bundle schema (what gets exported)

When the user clicks **Submit feedback**, the harness writes this JSON shape to `feedback-bundle-LATEST.json`:

```json
{
  "version": 3,
  "exported_at": "ISO-8601 timestamp",
  "page_url": "file:///... or https://...",
  "page_title": "<title> of the page",
  "comment_count": 12,
  "open_count": 4,
  "needs_review_count": 0,
  "resolved_count": 8,
  "comments": [
    {
      "id": "c-001",
      "status": "open | needs-review | resolved",
      "target": {
        "comment_id": "Card · card-soft · Tag chips — light",
        "selector_path": "section.section-light > .frame > ...",
        "outerHTML_snippet": "<div class=\"card-soft\">...</div>",
        "pin_position": { "x_pct": 45.2, "y_pct": 30.1 },
        "additional_targets": [
          { "comment_id": "Card · ... · #2", "selector_path": "...", "outerHTML_snippet": "..." }
        ]
      },
      "comment": "(latest user follow-up text — convenience copy of the last user history entry)",
      "attachments": [
        {
          "name": "screenshot.png",
          "type": "image/png",
          "size": 23456,
          "data": "data:image/png;base64,..."
        }
      ],
      "links": ["https://figma.com/..."],
      "created_at": "ISO-8601",
      "updated_at": "ISO-8601",
      "claude_reply": "(latest Claude reply — convenience copy of the last claude history entry)",
      "history": [
        {
          "role": "user",
          "text": "Original comment text…",
          "attachments": [...],
          "links": [...],
          "created_at": "ISO-8601"
        },
        {
          "role": "claude",
          "text": "Claude's reply…",
          "created_at": "ISO-8601"
        },
        {
          "role": "user",
          "text": "Follow-up after Claude's first reply…",
          "attachments": [...],
          "in_response_to": 1,
          "created_at": "ISO-8601"
        }
      ]
    }
  ]
}
```

- `target.additional_targets` is only present on multi-element comments (Cmd+click chain). For single-element comments, omit.
- `history[].in_response_to` is the index (0-based) of the Claude reply this follow-up is replying to. Useful when Claude's response addressed only part of the original ask — the AI knows which prior reply the user found insufficient.
- `comment` and `claude_reply` at the top level are convenience mirrors of the last user / last Claude history entries respectively. AI processors that haven't been updated to read `history` keep working; the most recent exchange is still in the canonical fields.

### AI-side processing — recommended pattern

When the user says "the bundle is ready" or similar:

1. Read `feedback-bundle-LATEST.json` from the agreed folder.
2. For each comment with `attachments`, extract the base64 data URLs to `feedback/attachments/<comment-id>/<filename>` (sanitize filenames; append `-1`, `-2` if multiple).
3. Process each non-resolved comment.
4. Write a response bundle (next section) when done.

## Response bundle schema (what the AI writes back)

```json
{
  "version": 1,
  "type": "response",
  "responded_at": "ISO-8601",
  "in_reply_to_bundle": "feedback-bundle-... or descriptive label",
  "responses": [
    {
      "comment_id": "c-001",
      "new_status": "needs-review",
      "reply": "Markdown-friendly response text. Multi-paragraph OK."
    }
  ]
}
```

Save as `response-bundle-LATEST.json` in the same folder the user submitted from. They click **Load Claude responses…** in the sidebar and the harness:
- Finds each comment by `comment_id`
- **Appends** a `{ role: 'claude', text: reply, created_at: now }` entry to `comment.history` (preserving the prior thread). Also writes the same value to the top-level `claude_reply` field for backwards compat.
- Flips `status` to whatever `new_status` says (typically `needs-review`)
- Re-renders pins (now blue) and the sidebar list

If the user follows up via the "Didn't fix it" thumbs-down, the next bundle submission will carry the prior Claude reply AND the follow-up user entry in `history`. Claude can see the full thread when responding the next round — no need to rebuild context from a separate "previous attempts" channel.

## Saving target — File System Access API

First-time the user clicks **Submit feedback** (or the **Change…** button next to "Save to:"), the browser prompts them to pick a folder. The chosen folder handle is stored in IndexedDB under the key `feedback-dir-handle` in the database `videodb-review`, store `handles`.

On subsequent submits, the harness reads the stored handle, requests permission if needed (the browser may prompt the first time per session), and writes `feedback-bundle-LATEST.json` inside that folder. No filename prompt, no Downloads detour.

If the browser doesn't support `showDirectoryPicker` (Safari, Firefox), the harness falls back to a regular file download with a timestamped filename.

## Stripping the harness for production

The harness is dev/review-time only. For production deploys, strip the CSS and JS blocks via regex on the marker comments. See `scripts/build-vercel.py` in this project for a reference implementation — it uses these patterns:

- CSS strip: regex matches the `/* ===... Review Mode (?review=1) ...` comment opener and removes everything up to (but not including) the next `</style>`.
- JS strip: regex matches the `<script>` block containing `Review Mode — activated only via ?review=1` and removes the whole script element.

After stripping, validate the output HTML still parses and contains no leftover review classes (`review-pin`, `review-panel`, `mode-toggle` are unrelated; the review-specific ones all start with `review-`).

## Updating the harness in this project

If you make changes to the review system in `homepage-showcase.html` and want to refresh this bundle:

```bash
python3 scripts/ui-review-flow/extract.py
```

That re-extracts `review-mode.css` and `review-mode.js` from the current `homepage-showcase.html`.

To extract from a different source HTML:

```bash
python3 scripts/ui-review-flow/extract.py --source path/to/other-showcase.html
```

## Reuse across projects

This whole `ui-review-flow/` folder is self-contained. To use it on a sibling project:

```bash
cp -r scripts/ui-review-flow ~/Documents/Claude/Skills/
```

Future Claude sessions opening a different project can be told:

> "Use the UI review flow skill at `~/Documents/Claude/Skills/ui-review-flow/` for this showcase."

And Claude will read the SKILL.md, find the CSS/JS, and inject them.
