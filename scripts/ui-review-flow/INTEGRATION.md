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

## Feedback bundle schema (what gets exported)

When the user clicks **Submit feedback**, the harness writes this JSON shape to `feedback-bundle-LATEST.json`:

```json
{
  "version": 2,
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
        "pin_position": { "x_pct": 45.2, "y_pct": 30.1 }
      },
      "comment": "Free-form user comment text.",
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
      "claude_reply": "(present after a response bundle is imported)"
    }
  ]
}
```

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
- Sets `claude_reply` on the comment object
- Flips `status` to whatever `new_status` says (typically `needs-review`)
- Re-renders pins (now blue) and the sidebar list

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
