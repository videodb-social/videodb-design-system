---
name: ui-review-flow
description: A Figma-style point-and-click review overlay for any single-page HTML showcase. Drop pins on elements, leave threaded comments with attachments and links, submit a JSON bundle that an AI can read and respond to with a matching bundle. Round-trip review for design systems and showcases.
user-invocable: true
---

# UI Review Flow

Drop-in point-and-click commenting layer for HTML showcases.

## When to use this skill

Trigger this when the user:

- Is building or iterating a **design system showcase**, **component preview page**, **landing page mockup**, or **any single-page HTML artifact** where feedback needs to be left on specific elements.
- Says things like "let me leave comments on this page", "I want to review this design", "set up a review flow", "give me a way to comment on individual elements", or anything that smells like back-and-forth design feedback on a static page.
- Already has a showcase built and asks to add the review capability to it.

**Don't use this for:** application UIs with real state (the harness is a static overlay, not a CMS), multi-page sites (it scopes to one HTML file), or production-facing pages (it's a dev/review-time tool only).

## What it does

The harness adds, when the URL has `?review=1`:

- **Point-and-click commenting** — hover any element to see its label, click to drop a pin and open a comment panel.
- **Three pin statuses** — open (orange), needs-review (blue, set when an AI response arrives), resolved (grey).
- **Attachments per comment** — file picker, plus clipboard paste (Cmd/Ctrl+V) for screenshots. Attachments timestamped to avoid filename collisions.
- **Reference links per comment** — paste URLs, Enter to add multiple.
- **Sidebar with filter tabs** — Open / Needs review / Resolved / All.
- **Submit feedback bundle** — writes a JSON file to a folder you pick once (persisted across reloads via IndexedDB-stored FileSystemDirectoryHandle).
- **Load Claude responses** — import a JSON response bundle and the matching pin statuses flip to needs-review with replies attached.
- **Auto-tagging** — every meaningful element on the page gets a human-readable `data-comment-id` label so the pin's target is unambiguous in the JSON.

## How to apply it to a new showcase

1. Open the target showcase's HTML.
2. **CSS** — paste the contents of `review-mode.css` inside the `<style>` block, before `</style>`.
3. **JS** — paste the contents of `review-mode.js` inside a `<script>` block placed just before `</body>`.
4. Make sure the page already has an Iconify CDN tag — the harness uses `iconify-icon` for review UI icons:
   ```html
   <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
   ```

That's it. Open the page with `?review=1` appended to the URL and the harness activates.

## Production deploy — strip the harness

The harness is for review only. Before pushing to production:

- Use `scripts/build-vercel.py` (in this same project) as a reference — it strips the review CSS and JS blocks by regex.
- Or copy the two markers it looks for and write a similar stripper for your build pipeline.

## How the round-trip review works

1. User opens the showcase with `?review=1`, drops pins, writes comments.
2. User clicks **Submit feedback** in the sidebar → JSON bundle saves to a folder of their choice.
3. They tell the AI "the bundle is ready"; AI reads `feedback-bundle-LATEST.json`, processes each comment.
4. AI writes a response bundle (`response-bundle-LATEST.json`) with `{ comment_id, new_status, reply }` per resolved comment.
5. User clicks **Load Claude responses…** in the sidebar, picks the JSON; statuses flip to needs-review with replies attached to each pin.
6. User reviews the pins, marks resolved (or pushes back with a new comment).
7. Loop until all pins are resolved.

The JSON bundle schema is documented in `INTEGRATION.md`.

## Reuse across projects

Copy this entire `ui-review-flow/` folder to a shared location (e.g. `~/Documents/Claude/Skills/ui-review-flow/`) so future Claude sessions on other projects can reference it.
