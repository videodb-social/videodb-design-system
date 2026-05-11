---
version: "videodb-design-v1.5"
name: "VideoDB — Agentic Website Design System"
description: "Single source of truth for videodb.io. Editorial typography on Geist, deliberate 8px spacing, restrained motion, dual-radius shape language, and a confident dark↔light section alternation anchored by one brand orange (#F24E1E). Suited to product narratives, infrastructure storytelling, and interface-first landing experiences."
status: "v1.5 — folds in components ported from the VideoDB Labs page after a review pass: anchor pill, tag chip (light + dark with lift-on-parent-hover), byline, binary toggle, diagram card (with rows / fail / success states, side-by-side grid, row hover lift), pill input (with focus / error / buzz states), entry row, project tile (with hover-triggered motion patterns), dispatch card (with hover personality — surface lifts to white, subtle stroke, title + CTA flip to brand orange). Adds semantic error color (`--color-error: #E5484D`, distinct from brand orange) for destructive/invalid feedback only. Documents the buzz keyframe pattern. Future changes require a version bump."
supersedes:
  - "uploads/NEO-videodb-design.md (v1.1)"
  - "references/neu-videodb-DESIGN.md (Nexus / Vision & Logic ancestor)"
  - "references/Platform-Architecture-Hero-DESIGN 2.md (alpha ancestor)"

colors:
  # Brand
  primary: "#F24E1E"
  accent: "#D14016"
  primary-ring-soft: "rgba(242, 78, 30, 0.25)"
  primary-ring-strong: "rgba(242, 78, 30, 0.40)"
  primary-glow: "rgba(242, 78, 30, 0.35)"

  # Surfaces — light mode
  neutral-light: "#F5F5F7"          # section background
  surface-light: "#E8E8EA"          # soft cards
  surface-light-hover: "#DCDCDE"    # the one hover value — no near-clones
  surface-warm: "#FDF1E8"           # VideoDB-positive containers (the "unified" side
                                    # of the problem/solution comparison; future
                                    # callouts that visually claim ground for the
                                    # product). Soft tint of brand orange — sits
                                    # adjacent to surface-light without competing.
  surface-warm-border: "rgba(242, 78, 30, 0.16)"  # hairline for warm surfaces

  # Surfaces — dark mode (three-step hierarchy, strict roles)
  neutral-darker: "#050505"         # body fallback / deepest layer
  neutral-dark: "#0A0A0A"           # hero, V/02 divider, header backdrop
  charcoal: "#161616"               # cards-in-light, code blocks, mega-menus
  charcoal-hover: "#1F1F1F"         # interactive charcoal hover

  # Text — bounded opacity floors for accessibility
  text-on-dark: "#FFFFFF"
  text-on-dark-display: "rgba(255, 255, 255, 0.95)"
  text-on-dark-muted: "rgba(255, 255, 255, 0.75)"
  text-on-dark-subtle: "rgba(255, 255, 255, 0.65)"
  text-on-dark-second: "rgba(255, 255, 255, 0.45)"   # two-tone heading second clause
  text-on-light: "#111111"
  text-on-light-display: "rgba(0, 0, 0, 0.90)"
  text-on-light-muted: "rgba(0, 0, 0, 0.75)"
  text-on-light-subtle: "rgba(0, 0, 0, 0.60)"
  text-on-light-second: "rgba(0, 0, 0, 0.55)"        # two-tone heading second clause

  # Borders
  border-on-dark: "rgba(255, 255, 255, 0.08)"
  border-on-dark-strong: "rgba(255, 255, 255, 0.12)"
  border-on-light: "rgba(0, 0, 0, 0.08)"
  border-on-light-strong: "rgba(0, 0, 0, 0.12)"

  # Semantic error — a distinct red (NOT brand orange) for destructive
  # and invalid-input feedback. Hue is well-separated from #F24E1E so
  # error states remain unambiguous against an orange-leaning palette.
  # Never used for general accents, only error / destructive signaling.
  color-error: "#E5484D"
  color-error-soft: "rgba(229, 72, 77, 0.16)"

typography:
  # ALL display, body, and UI text uses Geist.
  # JetBrains Mono is reserved for technical chrome only: section codes
  # (N/01, V/01), uppercase labels, version stamps, code blocks.
  display-xl:
    fontFamily: "Geist"
    fontSize: "96px"
    fontWeight: 300
    lineHeight: "0.96 !important"
    letterSpacing: "-0.05em"
  display-lg:
    fontFamily: "Geist"
    fontSize: "64px"
    fontWeight: 300
    lineHeight: "1.05 !important"
    letterSpacing: "-0.04em"
  display-md:
    # Workhorse for section openers. line-height 1.15 (down from 1.25)
    # with !important is non-negotiable — see "Display line-height rule".
    fontFamily: "Geist"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: "1.15 !important"
    letterSpacing: "-0.03em"
  heading-md:
    fontFamily: "Geist"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: "Geist"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
  body-md:
    fontFamily: "Geist"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  label-md:
    fontFamily: "Geist"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  mono-sm:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.2"
    letterSpacing: "0.2em"
    textTransform: "uppercase"
  mono-xs:
    fontFamily: "JetBrains Mono"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: "1.2"
    letterSpacing: "0.2em"
    textTransform: "uppercase"
  label-bracketed-mono:
    # Terminal-style bracketed label, used for pricing prefixes
    # (`[$0 / MONTH]`), section identifiers in featured cards
    # (`[TODAY — THE FRANKENSTACK]`, `[VIDEODB — ONE BACKEND]`),
    # and other moments where the content "names itself" in
    # infrastructure voice. Brackets are part of the literal text.
    fontFamily: "JetBrains Mono"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "1.2"
    letterSpacing: "0.08em"
    textTransform: "none"
    bracketColor: "currentColor"
    contentColor: "currentColor"
    # Variant: when used as the highlighted/featured tier label,
    # brackets and content both render in {colors.primary}.

spacing:
  base: "8px"
  scale: ["8px", "12px", "16px", "24px", "32px", "48px", "64px", "96px"]
  gap-sm: "8px"
  gap-md: "16px"
  gap-lg: "32px"
  section-padding-y: "96px"
  section-padding-y-mobile: "64px"
  section-padding-x: "24px"
  section-padding-x-mobile: "16px"
  card-padding: "24px"
  card-padding-md: "28px"
  max-content-width: "1400px"

rounded:
  surface: "32px"        # hero feature surfaces, ≤2 per page
  surface-md: "16px"     # code blocks, mega-menu panels, large interactives
  card: "12px"           # inline content cards, soft cards
  control: "9999px"      # every button, pill, badge, slider thumb

shadows:
  # Two sanctioned uses only — never apply shadows to routine in-flow cards.
  active-card: "0 0 0 1px rgba(242,78,30,0.25), 0 16px 48px -16px rgba(242,78,30,0.35), 0 8px 32px -16px rgba(0,0,0,0.5)"
  overlay-panel: "0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)"
  lift-light: "0 8px 24px -12px rgba(0,0,0,0.15)"  # lifecycle hover only

motion:
  level: "moderate"
  duration-ui: "150ms"
  duration-ext: "300ms"
  duration-reveal: "1000ms"
  ease-ui: "cubic-bezier(0.4, 0, 0.2, 1)"
  ease-reveal: "power4.out"    # GSAP
  ease-fade: "power2.in/out"   # GSAP

breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"
  "2xl": "1400px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    backgroundColorHover: "{colors.accent}"
    textColor: "{colors.text-on-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    paddingX: "24px"
    paddingY: "12px"
    border: "none"
  button-secondary-dark:
    innerBackgroundColor: "{colors.charcoal}"
    innerBackgroundColorHover: "#181818"
    textColor: "{colors.text-on-dark-muted}"
    textColorHover: "{colors.text-on-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    paddingX: "24px"
    paddingY: "12px"
    borderRing: "1px gradient from rgba(255,255,255,0.20) via rgba(255,255,255,0.05) to transparent"
  button-ghost-dark:
    backgroundColor: "rgba(255,255,255,0.05)"
    backgroundColorHover: "rgba(255,255,255,0.10)"
    textColor: "{colors.text-on-dark-muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    paddingX: "20px"
    paddingY: "8px"
    border: "1px solid {colors.border-on-dark-strong}"
  card-soft:
    backgroundColor: "{colors.surface-light}"
    backgroundColorHover: "{colors.surface-light-hover}"
    textColor: "{colors.text-on-light}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  card-charcoal:
    backgroundColor: "{colors.charcoal}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
    border: "1px solid {colors.border-on-dark}"
  card-charcoal-active:
    backgroundColor: "{colors.charcoal}"
    border: "1px solid {colors.primary-ring-strong}"
    boxShadow: "{shadows.active-card}"
    transform: "translateY(-4px)"
  badge-mono:
    typography: "{typography.mono-sm}"
    paddingY: "14px"
    paddingX: "20px"
    pattern: "radial-gradient(circle, currentColor 0.6px, transparent 0.6px) / 3px 3px on full surface"
    dotOpacity: "0.30 on dark, 0.25 on light"
    textTreatment: "multi-offset text-shadow stroke matching the section background (~2px halo)"
    textOpacity: "0.90 on dark, 0.78 on light"
  nav-mega-menu:
    backgroundColor: "{colors.charcoal}"
    rounded: "{rounded.surface-md}"
    border: "1px solid {colors.border-on-dark}"
    boxShadow: "{shadows.overlay-panel}"
    widthVariants: { narrow: "280px", medium: "360px", wide: "540px" }
    openTransition: "opacity 200ms {motion.ease-ui}, transform 200ms {motion.ease-ui}"
    triggerGlyph: "+ rotates 45° and tints to {colors.primary} on hover"
    hoverBridge: "::after pseudo-element extends 16px below the trigger as transparent zone with pointer-events: auto during hover"
    typographyReset: "Geist with text-transform: none and letter-spacing: 0 — dropdown content is real prose, not chrome"
---

## Overview

VideoDB is the video database, rebuilt for agentic systems. It gives autonomous agents a queryable, programmable layer over video so they can search, edit, and reason about footage as easily as text.

This design system serves a single surface: the marketing site at `videodb.io`. No app, no docs site, no mobile app are shipped from this system. The vocabulary therefore covers landing-page primitives — headers with mega-menus, dark/light alternating sections, code blocks, pricing cards, comparison tables, lifecycle flows, the pricing tier finder.

The system alternates confidently between **dark** sections (atmospheric, infrastructure-feeling, WebGL-backed) and **light** sections (editorial, dense, content-forward) — never half-committing to either. The orange brand accent (`#F24E1E`) carries continuity across both modes; everything else flips.

**Composition cues:**
- **Layout:** Framed flex (max 1400px with vertical hairline borders).
- **Content width:** Centered with vertical frame borders.
- **Framing:** Solid surfaces with selective glass on floating chrome (header only).
- **Grid:** 12-column with mandatory left-column offset on light sections.
- **Mode:** Alternating dark ↔ light sections, full commitment per section.

---

## Brand & Voice

### Tone
The voice is **infrastructure-confident, editorial, declarative**. It reads like an engineer wrote it for other engineers, but it was edited by someone who reads The Economist.

- **No exclamation marks. No emoji.** Anywhere. Period.
- **Sentence case** for everything readable (display headings, body, list items, card titles). Title Case is reserved for two places: section labels in the nav ("Platform", "Agents", "Pricing"), and product/tier names ("Free", "Usage-Based", "Committed Annual").
- **UPPERCASE + 0.2em letter-spacing** lives only in mono chrome — section codes (`N/01`, `V/01`, `02 / THE PLATFORM`), badge labels, status text, footer meta. Never use uppercase for prose.
- Section codes mix slashes and line breaks: `02 /<br>The Platform`, `N/01 — VIDEO INFRASTRUCTURE`. This is signature.

### Person & address
- **Third-person product + second-person reader.** "VideoDB gives autonomous agents…", "you query filenames…", "your agent gets a video backend." Never "we" except in the explicit *About* fold where it's earned: "We don't just host video."
- Never apologetic, never effusive. No "powerful", "seamless", "robust", "best-in-class". The product is described by what it *does*, not by adjectives.

### Headlines — the two-tone declarative
Every section opener is a **two-tone display heading**: full-strength first clause, lower-opacity second clause, separated by `<br>`. Shape is *statement → consequence*, or *contrast → reframe*. Canonical examples:

- "The video database, **rebuilt for agentic systems.**"
- "Beyond storage. **A foundation for agents that see.**"
- "A single backend for the **entire video lifecycle.**"
- "Searching MP4s is **searching filenames.**"
- "Same content. **Stronger interaction.**"
- "Free → usage-based → **committed annual.**"

The second clause never softens the first; it sharpens it.

### Lexicon — use these words
- **Primitives** (the six: Ingest, Index, Memory, Search, Director, RTStream). Always capitalized as proper nouns.
- **Agents**, **agentic systems**, **autonomous agents** — the audience.
- **Queryable, programmable, composable, indexable** — the verbs of the product.
- **Foundation, infrastructure, backend, layer** — the metaphor.
- **Sub-second**, **petabytes**, **moments**, **scenes** — concrete units.

### Lexicon — don't use
- "Solution", "platform" (except in section labels), "leverage", "empower", "unlock", "supercharge", "next-gen", "AI-powered".
- "MP4" is used pejoratively — as the unit of *what we're replacing*. Don't position MP4 as a feature.
- Avoid feature-bullet "value props". Comparisons use parallel sentences against a "today" baseline.

### Microcopy patterns
- **CTAs**: two words, sentence case. `Start Building`, `Get Access`, `Watch the Demo`, `Read about Ingest`. The chevron is part of the CTA, not decoration.
- **Footer meta strings** in dropdowns: short fact + ellipsis if needed. "Six primitives. One SDK.", "OSS, MIT licensed", "Updated daily · v2.4.0", "Cancel any time".
- **Status strings** in code chrome: `Idle`, `Running`, `Ready` — one word, no punctuation.

### Numerical facts
The page shows hard numbers in display weight. They are concrete and unbranded — no "+", no "M+", just the integer with the unit underneath in mono caps:
- `2.4M` / HOURS INDEXED · `120ms` / MEDIAN QUERY · `38` / SDK METHODS · `∞` / AGENT READY.

The `∞` glyph in brand orange is the only place a symbol replaces a number.

---

## Logo & Wordmark

The brand ships five official files in `assets/logos/`. **Always use the PNG; never re-render the wordmark in HTML/CSS.** Re-rendering the wordmark in text was an early workaround when no logo existed; with the official lockup in hand, it's retired.

| File | Use when |
|---|---|
| `wordmark-dark.png` | Header / footer / any chrome on `#0A0A0A` or `#161616`. White "Video", orange "DB". |
| `wordmark-light.png` | Anything on `#F5F5F7` / `#E8E8EA` / white. Black "Video", orange "DB". |
| `icon.png` | The standalone V-glyph (orange triangle + ink slash). Use when space is tight — sidebar, OG card corner, doc-row prefix. |
| `square-dark.png` | Square tile, dark background variant — app icon, favicon, social avatars. **This is the favicon for the site.** |
| `square-light.png` | Square tile, light background variant. |

**HTML pattern:**
```html
<a href="/" class="brand-link" aria-label="VideoDB home">
  <img src="/assets/logos/wordmark-dark.png" alt="VideoDB" />
</a>
```

**Rules:**
- The wordmark image scales freely but should never render smaller than 16px tall (legibility) or larger than ~64px in any header.
- The square tile must always be presented in a perfect 1:1 aspect ratio.
- **All logo images must preserve their source aspect ratio.** Never set both `width` and `height` to fixed values that would distort the image. Use `object-fit: contain` inside any fixed-size container, or constrain only one dimension (typically `height: <px>; width: auto`). This applies to the wordmark, the V-glyph (`icon.png`), and square variants alike.
- Never re-color, re-space, re-letterspace, or place inside a tinted container.
- Use the **dark** variant on dark surfaces, the **light** variant on light surfaces — the wordmark's ink stroke must contrast with its background; the orange "DB" stays constant.
- **In running prose**, write **VideoDB** (single word, capital V, capital DB). Never `Videodb`, `Video DB`, `VIDEO DB`, or `videoDB`. The URL `videodb.io` keeps the lowercase form because it's a domain.

---

## Color

The palette is anchored by a single bold accent — orange `#F24E1E` — that survives across both dark and light modes. All other roles flip based on section mode.

### Brand
- **Primary `#F24E1E`** — Primary CTAs, accent labels inside cards, focal highlights, selection, the cursor in code blocks. Used sparingly so it always reads as a signal.
- **Accent `#D14016`** — Hover state for primary, deeper emphasis. Never a base color on its own.

### Light-mode surfaces (two-step + one hover)
- **Neutral Light `#F5F5F7`** — Light section background. Slightly off-white for editorial warmth.
- **Surface Light `#E8E8EA`** — Soft surface for cards inside light sections.
- **Surface Light Hover `#DCDCDE`** — The single hover value. No `#E0E0E2` or other near-clones.

### Dark-mode surfaces (three-step hierarchy)
Three distinct dark tones with strict role discipline. This is what gives dark moments depth without harshness.

- **Neutral Darker `#050505`** — Body fallback / deepest layer.
- **Neutral Dark `#0A0A0A`** — Hero section background, V/02-style divider sections, the floating header backdrop. The "atmospheric" black, paired with WebGL.
- **Charcoal `#161616`** — All cards-in-light-sections, dark featured cards, code blocks, mega-menu panels. Reads as "dark surface" against `#F5F5F7` without the harshness of full near-black on near-white.
- **Charcoal Hover `#1F1F1F`** — Hover state for charcoal interactive surfaces (e.g., synchronized comparison rows).

**Discipline rule:** Pick the right dark token for the role. A code block sitting in a light section is `#161616`, not `#0A0A0A`. A hero section background is `#0A0A0A`, not `#161616`. Mixing breaks the depth hierarchy.

### Text contracts (accessibility-tested floors)
On dark surfaces, body text never goes below white at **75%** (primary) or **65%** (utility/meta). On light surfaces, body text never goes below `#111` at **75%** (primary) or **60%** (utility labels). Display headings can sit at 90–95%. Only decorative chrome (dot patterns, hairlines, fade gradients) may use 25–35% — never for glyphs the user needs to read. Never use `/30`, `/40`, or `/50` on actual readable text.

### Borders
- **Decorative hairlines:** 5–8% opacity (`border-on-dark`, `border-on-light`).
- **Interactive elements** (buttons, inputs, slider thumbs): minimum 12% opacity (`border-on-dark-strong`).

### Brand orange contrast caveat
`#F24E1E` on `#0A0A0A` passes AA for large text and UI components but **fails for body text**. Never use orange for body copy. It's an accent surface and CTA color only — text *on* the orange is white at 100%.

### Semantic error red (destructive / invalid feedback)

Brand orange leans warm and could be mistaken for an error indicator. To keep error states unambiguous, the system has a distinct red:

- **`--color-error: #E5484D`** — a true red, well-separated in hue from brand orange.
- **`--color-error-soft: rgba(229, 72, 77, 0.16)`** — low-saturation background tint.

**Rules:**
- Use **only** for destructive actions (delete confirmations) and invalid-input feedback (form errors, validation messages).
- Never as a general accent, never on decorative chrome.
- Pairs with a **buzz animation** on invalid inputs (see Form Controls).
- Body-text minimums still apply — never use as text below `body-lg` size.

This is the only chromatic color in the system besides brand orange. Everything else is a value of black or white.

---

## Typography

Geist carries the entire system — display, body, and UI. JetBrains Mono is reserved exclusively for technical metadata: section codes (`N/01`, `V/01`), uppercase labels, timestamps, code blocks. This single-family discipline (with one mono exception) is what makes the type feel editorial rather than SaaS.

### Scale
- **Display XL** — Geist 96px / 300 / line-height 0.96 / -0.05em. Hero moments only — once per page.
- **Display LG** — Geist 64px / 300 / 1.05 / -0.04em. Section openers in dark contexts.
- **Display MD** — Geist 48px / 400 / **1.15 `!important`** / -0.03em. Workhorse for light-section openers.
- **Heading MD** — Geist 32px / 400 / 1.2 / -0.02em. In-flow titles.
- **Body LG** — Geist 18px / 400 / 28px. Lead paragraphs.
- **Body MD** — Geist 16px / 400 / 1.6. Default body.
- **Label MD** — Geist 14px / 400 / 20px. UI labels, button text, nav links.
- **Mono SM** — JetBrains Mono 12px / 500 / 0.2em / **uppercase**. Section codes and chrome.
- **Mono XS** — JetBrains Mono 10px / 500 / 0.2em / uppercase. Card meta-labels and tier markers.

Display weights stay light (300–400) at large sizes — the tight tracking does the work. Never go above weight 400 except in mono labels and lifecycle titles (500).

### Critical: no widows or orphans on display headings

Every `display-*` class **must** carry `text-wrap: balance` so the browser rebalances line lengths automatically, eliminating the orphan-single-word-on-a-line bug. A heading like `All of today's video infrastructure was<br>designed for human playback.` would otherwise wrap to:

```
All of today's video infrastructure
was                              ← widow
designed for human playback.
```

With `text-wrap: balance`, the browser rebalances each wrap context (each side of a `<br>` is its own context) so the first clause wraps as two visually-similar-length lines, no widow:

```
All of today's video
infrastructure was
designed for human playback.
```

The rule applies to **every** display class — `display-xl`, `display-lg`, `display-md`, and `heading-md` — not just the ones with two-tone splits. If a heading is ever rendered without `text-wrap: balance`, it will eventually trip over a widow.

`text-wrap: balance` is broadly supported (Chrome 114+, Firefox 121+, Safari 17.5+). For belt-and-braces support of older browsers, `text-wrap: pretty` can be added as an enhancement (Chrome 117+) but is not required.

### Critical: heading font loading rule
Tailwind CDN's preflight resets all `h1–h6` elements to system fonts, which **silently overrides** any `font-family` declaration on `body`. To prevent headings from rendering as system serif:

- Apply `font-family: 'Geist', sans-serif;` **explicitly** on every `display-*` class.
- Add a global `h1, h2, h3, h4, h5, h6 { font-family: 'Geist', sans-serif; }` fallback rule.

If a heading ever renders as a system font, this is the bug.

### Critical: the display line-height rule
Tailwind text utilities like `text-3xl`, `text-4xl`, etc. ship a **bundled line-height** alongside their font-size (`text-3xl` = `font-size: 1.875rem; line-height: 2.25rem`). When an arbitrary value like `md:text-[3.25rem]` overrides only the font-size at the md breakpoint, the bundled line-height **stays applied** silently and produces collapsed lines on large displays.

**The fix is two-pronged:**

1. **`!important` on every display class line-height.** Without it, Tailwind's utility specificity wins.
2. **`display-md` line-height is `1.15`.** Iterated downward across rounds: 1.25 original (too airy) → 1.20 → 1.15 (current). 1.15 lands correctly with current Geist rendering. Anything below 1.15 reintroduces descender/ascender collisions on two-tone `<br>`-split headings — that is the floor.

```css
.display-md {
  font-family: 'Geist', sans-serif;
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.15 !important;  /* must beat text-3xl, text-4xl, etc. */
}
```

If a section heading ever looks vertically cramped, the cause is one of:
- The display class's line-height is missing `!important`.
- The line-height value itself is below 1.15.
- Two-tone splits are using stacked `<div>` blocks instead of single text run + `<br>` + `<span>`.

---

## Layout

The page reads as a **centered framed composition**: a 1400px max-width column with vertical hairline borders running the full height. This frame is the spine of the system and persists through every section, light or dark.

- **Content width:** 1400px max, with `border-x` hairlines on the frame.
- **Base unit:** 8px.
- **Scale:** 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- **Section padding:** 96px vertical, 24px horizontal (mobile scales to 64px / 16px).
- **Card padding:** 24px (small cards), 28px (large/comparison cards).
- **Gaps:** 8px (tight UI), 16px (related elements), 32px (sections within section).
- **Internal frame:** 1px hairline `border-x` on the inner column, dark or light variant per mode.

### Mandatory column offset (light sections)

Every light section content area uses the same 12-column offset structure as the canonical "About" fold. **Content does not span the full 12 columns.**

- **Left column (`md:col-span-3 lg:col-span-2`):** Section label in `mono-sm`, often broken across two or three lines (`02 /<br>The Platform`).
- **Right column (`md:col-span-9 lg:col-span-10 max-w-5xl`):** All content — headings, cards, body, lists.

Inside the right column, secondary heading + supporting copy uses an **8/4 grid split**: heading on cols 1–8, body on cols 9–12, body aligned to the bottom of the heading via `self-end`.

This offset is what makes the system feel editorial rather than dashboard-like. Skipping it (full-bleed content within the 1400px frame) creates the "cramped" feeling — content runs too long horizontally and loses the magazine cadence.

---

## Section Heading Pattern (light sections)

Every light section opens with the same three-element rhythm:

1. **Mono section code** (`02 /<br>The Platform`, `Pricing`) — JetBrains Mono 11px uppercase, letter-spacing 0.2em, `text-black/60`. Lives in the left column. Often broken across lines.
2. **Two-tone display heading** — `display-md` (48px+), 90% black first line, 55% black second line. Use a single text run with `<br>` and a `<span>` for the second-tone color. **Do not** use stacked `<div>` blocks — they have no inter-block leading.

   ```html
   <h3 class="display-md md:text-[3.25rem] text-3xl text-black/90 js-reveal-text">
     Searching MP4s is<br><span class="text-black/55">searching filenames.</span>
   </h3>
   ```

3. **Supporting body copy** — col 9–12 of an 8/4 split, aligned to the bottom of the heading via `self-end`. Body opacity at 75%.

Below this header, content blocks (cards, code, lists) sit with 64–96px of breathing room.

---

## Section Modes (Dark ↔ Light)

The system's defining move. Each section commits fully to its mode — no in-between greys, no half-measures.

### Dark sections
- Background: `#0A0A0A`.
- Vertical frame: `border-white/[0.05]`.
- Header (when over a dark section): glass with `bg-[#0A0A0A]/80 backdrop-blur-md` — the only glass surface in the system. 80% opacity is required so dropdowns rendering above stay legible.
- Body text: white at 95% / 75% / 65% (primary / muted / subtle).
- WebGL particle dome (top + bottom faded) is allowed and encouraged in hero.
- Use for: hero, immersive feature reveals, infrastructure narratives, full-dark pricing fold.

### Light sections
- Background: `#F5F5F7`.
- Vertical frame: `border-black/[0.05]`.
- Body text: `#111` at 90% / 75% / 60%.
- Cards: `#E8E8EA` surface with 12px radius.
- Dark featured cards inside light sections use **charcoal `#161616`**, not `#0A0A0A`.
- Use for: editorial copy blocks, content density, "about" / explanatory sections, comparison.

Transitions between modes use a 1px horizontal border (`border-black/10` or `border-white/5`) — no gradient blends.

---

## Shapes

Four radii, used with strict role discipline:

- **`32px` (surface)** — Hero feature cards, large content surfaces. Use sparingly — once or twice per page max.
- **`16px` (surface-md)** — Code blocks, calculator/finder cards, mega-menu panels, large interactive surfaces. The "engineered surface" radius.
- **`12px` (card)** — Inline content cards, image containers, soft `#E8E8EA` blocks.
- **`9999px` (control)** — All buttons, pills, badges, slider thumbs. Every interactive control is fully rounded.

Never mix radius families on adjacent elements. A pill button next to a 12px card is correct; a 12px card next to a 32px card is wrong unless the 32px is clearly a containing surface.

---

## Elevation & Depth

Depth comes from **material contrast**, not shadows. The system has very few drop shadows. Instead it relies on:

- **Border hairlines** to separate surfaces (`rgba/0.05`–`0.1`).
- **WebGL particle haze** as ambient depth in dark hero sections (the only atmospheric effect).
- **Mask-image gradients** to fade WebGL into both top AND bottom edges.
- **Backdrop blur** on the floating header only.
- **The three-step dark hierarchy** (`#0A0A0A` → `#161616` → cards) provides perceived layering without shadows.

Drop shadows are reserved for three specific use cases:
- **Highlighted/active pricing cards** — a focused orange-tinted glow signalling selection (`shadows.active-card`).
- **Floating overlay panels** (mega-menus) — a deep neutral shadow establishing overlay semantics (`shadows.overlay-panel`).
- **Lifecycle hover** on light sections — a tiny `shadows.lift-light` for lift-on-interaction only.

Never use shadows as routine card decoration on in-flow surfaces.

---

## Components

### Buttons

- **Primary CTA** — Orange `#F24E1E` background, white text, full pill radius, 24px×12px padding. Hover deepens to `#D14016`. Use once per viewport — this is the focal action.
- **Secondary (gradient-bordered)** — Charcoal `#161616` background with a 1px gradient ring (`from-white/20 via-white/5 to-transparent`) wrapping the button. Used as the dark-section secondary action paired with primary. Hover lightens background to `#181818`.
- **Ghost (dark sections)** — `rgba(255,255,255,0.05)` background with 12% hairline border, used for header CTAs and tertiary actions.
- **Ghost (charcoal cards)** — `rgba(255,255,255,0.08)` background, hover lifts to `0.12`. Used for in-card secondary CTAs (pricing card actions).
- **Disabled state** — Reduce opacity to 0.45 + `cursor: not-allowed` + `aria-disabled="true"`. Never make a disabled element look like an interactive primary.
- **Loading state** — Replace label with inline spinner (16px) at current text color; `aria-busy="true"`; disable interaction.

Buttons always use `label-md` typography. Never use display weights on buttons.

### Pill Tab Group

A row of pill buttons used for primitive selectors, category filters, or step navigation. **Two states only — no third "outlined" state**:

- **Selected (filled)** — `#0A0A0A` background, white text, no visible border (transparent border for box-sizing parity).
- **Unselected (soft)** — `#E8E8EA` background, `text-black/75`, transparent border. Hover `#DCDCDE`.

All pills in a row share **identical box dimensions** — every pill has `border border-transparent` (or a real border on the selected one) so the 1px doesn't cause height drift. Padding 20px×10px, full pill radius, `label-md` typography, `gap-3` between pills.

### Anchor Pill (`.anchor-pill`)

In-page section navigation pill — used in hero composition to advertise the page's named sections ("Engineering · Research · Projects"). **Not a button** — it's navigation chrome that lives in body content.

- **Default = dark surface variant.** `rgba(255,255,255,0.04)` background, 1px hairline `rgba(255,255,255,0.10)`, text `rgba(255,255,255,0.85)`. Full pill radius, 10px×20px padding, `label-md` typography.
- **Light variant via explicit `.on-light` opt-in.** Do NOT auto-scope by section type — a `.section-light` may host dark inset cards whose anchor pills should stay dark. The wrapping element must declare its surface mode via `.on-light` or default to dark.
- **Arrow icon** (`solar:arrow-right-up-linear`) sits inline at the right edge, painted in brand orange. On parent hover the arrow translates `+2px, -2px` over 300ms.
- **Hover** — background lifts to `0.08` white (dark) or `0.08` black (light), border to `0.18`, text to full white / black. Subtle, fast (150ms).

Use this pattern any time a page has named sections you want to advertise upfront. Don't confuse with a button — anchor pills are *navigational* hints; buttons are *actions*.

### Tag Chip (`.tag-chip-light`, `.tag-chip-dark`)

Small, lowercase mono chip for inline metadata: `python`, `latency`, `infra`, `agents`. Smaller and quieter than mono badges (which are featured chrome). Used inline alongside titles, on entry rows, dispatch cards, project tiles.

- **Padding** 4px×10px, full pill radius.
- **Typography** JetBrains Mono 10px, weight 400, letter-spacing **0.08em** (looser than `mono-sm`'s 0.2em — these are not chrome-shouty), `text-transform: lowercase`.
- **Light variant** — `rgba(0,0,0,0.04)` background, 1px `rgba(0,0,0,0.08)` border, text `rgba(0,0,0,0.70)`.
- **Dark variant** — `rgba(255,255,255,0.04)` background, 1px `rgba(255,255,255,0.08)` border, text `rgba(255,255,255,0.65)`.

**Parent-hover lift rule.** When a tag chip sits inside an interactive container (`.card-soft`, `.entry-row`, `.dispatch-card`, `.card-charcoal`, `.project-tile`) and that container hovers, the chip **lifts to a lighter surface**, not darker:

- Light chip on parent hover → background to `rgba(255,255,255,0.85)` (near-white), border `0.10` black, text `0.85` black.
- Dark chip on parent hover → background to `rgba(255,255,255,0.14)`, border `0.22` white, text pure white.

Direction is non-negotiable: chips **pop forward** as their host card recedes, not the other way around. 150ms transition keeps the lift in sync with the host.

### Byline (`.byline`, `.byline.is-dark`)

Inline metadata string: *Author · kind · date · read-time*, with small circular dots as separators. Used on field-note entries, version stamps, dispatch cards, anywhere an author or version context belongs inline.

- **Container** `display: inline-flex`, gap 12px, JetBrains Mono 10px uppercase 0.2em letter-spacing, color `rgba(0,0,0,0.55)` (light) or `rgba(255,255,255,0.55)` (dark).
- **`.byline-name`** the author name only — Geist 13px, letter-spacing -0.01em, `text-transform: none`, color `rgba(0,0,0,0.78)` (light) or `rgba(255,255,255,0.85)` (dark). Higher visual weight than the surrounding mono bits.
- **`.byline-dot`** 3px × 3px circle, `currentColor` at 0.6 opacity — subtle visual punctuation between fields.

Use the dark variant inside `.section-dark` or any `.card-charcoal` host. In all other cases use the light default.

### Binary Toggle (`.mode-toggle` inside `role="group"`)

A two-option segmented control. Use when a UI needs a single binary choice: List/Grid, Compact/Comfortable, All/Open, etc.

**Anatomy:**
- Wrap two `.mode-toggle` buttons in a container with `role="group"` and a 4px-padded pill-shaped chrome (`rgba(255,255,255,0.04)` background + 1px hairline border, full pill radius).
- Each button is a `<button class="mode-toggle">` with a Solar icon and label. JetBrains Mono 10px, 0.2em letter-spacing, uppercase, color `rgba(255,255,255,0.65)`.
- The active button carries `.is-active` — background brightens to `rgba(255,255,255,0.10)`, text to full white.
- Click-to-switch behavior: a JS handler on `[role="group"]` removes `.is-active` from all siblings and applies it to the clicked button.

**Don't use this for Light/Dark mode toggles.** The system intentionally mixes both modes per section; there's no global "light mode" to toggle. Reserve the pattern for genuinely binary content/view choices.

### Cards

- **Soft card (light sections)** — `#E8E8EA` background, 12px radius, 24px padding, hover `#DCDCDE` with `transition-colors`. Often paired with a small orange mono-label header.
- **Charcoal card** — `#161616` background, 12px radius, 24px padding, hairline `border-white/[0.08]`. Used for code blocks, dark featured cards in light sections, pricing tier cards in dark sections.
- **Charcoal card — active state** — Adds 0.4-opacity orange border, soft inner ring at 0.25, orange-tinted drop shadow, `translateY(-4px)` lift. Used to highlight a selected tier or featured option. Inactive sibling cards drop to `opacity: 0.55` to reinforce focus.
- **Numbered row card** — Wide horizontal card. Left: 64×64 white square with 16px radius containing step number in JetBrains Mono, brand orange `#F24E1E`, weight 500. Center: title + body. Right: brand-orange "Read about X →" link with chevron that translates 2px on hover.
- **Lifecycle card** — `#E8E8EA` background, hover flips to white + adds `shadows.lift-light` + expands description `max-height` from 2.5em to 5em over 300ms. Pure CSS, no JS.
- **Entry row (`.entry-row`)** — Wide horizontal list-row card, used for blog/doc/changelog/field-note lists. Three-column grid: arrow indicator left (`↳`, 56px wide column), title + category + description + tag-chip-row center, mono-meta column right (author + kind + date · read). Default surface `#E8E8EA`, hairline `border-top: rgba(0,0,0,0.08)` between rows. Hover: subtle `rgba(0,0,0,0.025)` background, arrow translates `+2px, -2px` and tints brand orange, title goes from `text-black/88` to full black. Title typography is Geist 24px / 400 / -0.02em / 1.25. Renamed from the Labs page's `.row-card` to avoid colliding with the **numbered row card** above — they're distinct patterns. Group multiple entries inside an `.entry-row-list` wrapper (`#E8E8EA` background, `r-surface-md` radius, `overflow: hidden`).
- **Project tile (`.project-tile`)** — Card with an abstract SVG art panel on top (`200px` tall, `#0A0A0A` background, hairline bottom border) and content below (eyebrow + name + description + mono CTA). Card surface `#161616`, 16px radius, hairline `border-on-dark`. Hover lifts `translateY(-2px)`, border brightens to `0.18` white, CTA flips to brand orange. The art SVG is composed from system tokens — solid fills only (no gradients), interior padding so elements never touch the container edges, and **hover-triggered CSS animation** unique per tile (bars pulse, rings rotate, code-lines blink, dashed lines flow). See "Project tile motion" below.
- **Dispatch card (`.dispatch-card`)** — Issue / changelog / newsletter card with an absolutely-positioned mono tag (`#001 · Dispatch`, top-right). Surface `#E8E8EA`, 16px radius, padding 36px, `border: 1px solid transparent` by default. **Hover personality (mandatory):** surface lifts to **white** (NOT to `surface-light-hover` — that's wrong direction), the transparent border becomes visible (`border-on-light`), and both the card title and the trailing CTA flip to brand orange. 300ms transitions. The hover should feel like the card "wakes up" — surface brightens, an outline appears, and the orange highlights mark where the card speaks.

#### Project tile motion

Each project tile carries a different hover-triggered animation so the four tiles read as distinct moments rather than uniform decoration. All effects are CSS-only, run only while `.project-tile:hover`, and respect `prefers-reduced-motion: reduce`. Reference set used on the showcase:

- **Waveform tile** — SVG `<rect>` bars pulse via `scaleY` with a three-phase stagger (`animation-delay: 0.14s / 0.28s / 0.42s` via `:nth-child(3n / 3n+1 / 3n+2)`). 1.4s loop, ease-in-out. Playhead dot pulses scale + opacity on a 1.2s loop.
- **Concentric-rings tile** — the entire `<g>` group of rings rotates `360°` over 14s linear infinite. Center dot pulses scale 1 → 1.35 over 2.4s ease-in-out.
- **Two-pane tile** — only one element (a single orange code-line in the right pane) blinks via `scaleX` 1 → 0.55 + opacity 1 → 0.6 over 1.6s ease-in-out, implying the right pane is the "live" one.
- **Streams tile** — `<line>` strokes flow via `stroke-dashoffset` animation. Alternating lines flow in opposite directions for visual texture. 3.2s linear loop.

**Rules:**
- Always require interior padding around art elements (minimum 32px from the SVG viewBox edges).
- No gradients. Solid fills only. Brand orange + white opacities.
- Each tile's motion should be **distinct** — don't reuse the same animation across tiles. The mechanic should connect to the project's metaphor (waveform = audio, rings = bloom, code lines = pair programming, streams = flowing data).
- Use `transform-box: fill-box; transform-origin: center;` on SVG children that need to scale or rotate around their own center.

### Code Blocks

- **Background** `#161616` (charcoal — softer than hero black against light sections).
- **Radius** 16px (surface-md). **Padding** 24–32px. **Border** hairline `rgba(255,255,255,0.08)`.
- **Font** JetBrains Mono, 13px, line-height 1.75.
- **Internal structure** Tab bar (top) → code body → status bar (bottom). Each separated by hairline `border-white/[0.06]`.
- **Tab bar** Pill tab group on left (`npx`, `pip`, `typescript`), copy/replay button on right.
- **Status bar** Pulsing orange dot + "Running"/"Ready" status on left; file label on right.
- **Syntax palette** — only system colors. Comments `white/30`, default `white/85`, shell `$` prompt `white/40`, keywords `#F24E1E`, success markers `✔` `#F24E1E`. **No blue, green, or tan syntax themes** — those introduce illegal accent colors.
- **Cursor** orange `#F24E1E`, 7×15px solid block. Blinks at 0.85s during idle, stays solid during active typing.

#### Implementation pattern — animated code blocks

Multiple code blocks on a single page (hero + in-page) must share the typing animation without colliding. The architecture:

- **Shared class** `.code-block-animated` marks every block that should auto-type on viewport entry. The hero code block and Section 07's demo block both carry it.
- **Class-based internal selectors, not IDs.** Each block's typing target is `.typed-out`, cursor `.cursor`, status indicators `.status-dot` and `.status-text` — all queried *within* the block, never globally. This is non-negotiable: two animated blocks on one page require unique elements, which IDs cannot provide.
- **Per-block state.** The in-flight tween is stored in a `WeakMap` keyed by the block element, so killing one block's tween (on tab switch or new ScrollTrigger fire) never touches another's.
- **Block-scoped ScrollTrigger.** Each `.code-block-animated` registers its own `ScrollTrigger` (`top 75%`, `once: true`). Hero blocks fire on page load (they're in the initial viewport); in-page blocks fire on scroll.
- **Opt-in chip activation.** A code block that drives a chip group declares it via `data-chips="#chip-container-id"`. The typing tween's `onUpdate` reads the attribute and toggles `.is-active` on chips whose `data-threshold` is crossed by progress. Blocks without the attribute (the hero code block) run typing alone, no chips.
- **Block-scoped copy button.** Each block's `.code-copy` reads the block's own `data-current-tab` to know what to copy.
- **Current tab persists on the element.** Tab switching writes `block.dataset.currentTab = name`, which both the copy button and any re-fire of the typing animation read from.

This pattern scales to any number of code blocks on one page without cross-talk. The signature `typeSnippet(block, name)` (not `typeSnippet(name)`) is the API.

### Diagram Card (`.diagram-card`)

A composable "diagram from tokens" primitive — used to render small technical diagrams (request paths, build pipelines, state machines, capacity bars) without a chart library. Lives on dark surfaces; pairs naturally with code blocks in side-by-side compositions.

**Anatomy:**
- Surface `#0A0A0A`, 1px hairline `border-on-dark`, 16px radius, padding 28px.
- A subtle 24px grid background painted via a CSS `::before` (two crossed `linear-gradient`s at `0.025` opacity). The grid sits behind the content (`z-index: 0`); a `position: relative; z-index: 1;` on child elements keeps text crisp.
- **Header row** — `.diagram-head`: a flex row with one or two `.diagram-tick` labels (mono-xs uppercase, 0.2em letter-spacing, `0.45` white) at the corners. Variants: `.is-muted` (0.30 white) and `.is-primary` (brand orange).
- **`.diagram-rows`** — vertical stack of `.diagram-row` pill-shaped status lines (grid gap 10px).
- **`.diagram-bar`** — optional thin horizontal bar at the bottom, 8px tall, pill radius, with an inner `.diagram-bar-fill` that uses a `linear-gradient(to right, rgba(242,78,30,0.30), var(--color-primary))`. The fill can extend past `100%` width to express overflow.

**Row states (three sanctioned variants):**
- **Default** — `rgba(255,255,255,0.04)` background, 1px `rgba(255,255,255,0.08)` border, JetBrains Mono 12px / `rgba(255,255,255,0.78)`. Anatomy: `dot` (6px circle, 40% white) + `label` (flex-1) + `value` (Geist 500, 0.95 white).
- **`.is-fail`** — orange-tinted: `rgba(242,78,30,0.08)` background, `rgba(242,78,30,0.30)` border, brand orange dot, brand orange value. Use for error / failure / blocked states.
- **`.is-success`** — lifted neutral: `rgba(255,255,255,0.06)` background, `rgba(255,255,255,0.14)` border, green dot (`#4ADE80`). Use for confirmed / passed / OK states.

**Hover (subtle, mandatory):**
Every row gets a 150ms lift on hover: background +3% white, border +6% white. The `is-fail` and `is-success` variants brighten their respective tints. Don't skip this — without hover, the rows read as static decoration rather than an inspectable surface.

**Layout — `.diagram-grid`:**
Multiple diagrams on one page sit in a 2-column grid (`grid-template-columns: 1fr 1fr; gap: 24px`) that collapses to a single column below `900px`. The two diagrams can serve different purposes (one path, one architecture) and read as a paired view.

### Mono Badges (dotted texture)

The `radial-gradient` dot pattern reads as a **texture** across the badge surface; text "punches through" via a multi-offset text-shadow stroke matching the section background.

- Dot pattern fills the full badge surface at low opacity (25–30%), using `radial-gradient(circle, currentColor 0.6px, transparent 0.6px)` with a tight `3px 3px` size on dark, `5px 5px` on light. Sub-pixel size is what makes it read as texture rather than as a competing graphic.
- Text sits on top with a 2–3px text-shadow halo in the section background color (`#0A0A0A` on dark, `#E8E8EA` on light), creating a clean stroke around each glyph.
- Text opacity: 90% on dark, 78% on light.

This applies to every mono-badge — `N/01`, `V/01`, `V/02`, section codes, version stamps.

### Header

- Sticky / floating, 1400px max-width, glass treatment (the only glass surface in the system).
- Glass recipe: `bg-[#0A0A0A]/80 backdrop-blur-md`. 80% opacity is required so dropdowns rendering above read cleanly; earlier 50% allowed too much WebGL bleed-through.
- `z-index: 50` on the header so it sits above section content; mega-menus go to `z-index: 60`.
- Wordmark PNG left (`wordmark-dark.png` on dark sections, `wordmark-light.png` on light), nav center (JetBrains Mono uppercase), ghost-style CTA right.
- Bottom hairline border separates it from the section below.

### Footer

A full-width dark footer at the bottom of every page. Pure black `{colors.neutral-darker}` (#050505) — slightly deeper than the hero black to read as a definite end-of-page boundary.

**Structure (5 columns at desktop: brand + 4 nav-column-groups; collapses gracefully):**

1. **Brand column** (left, fixed **360px** wide on desktop):
   - Wordmark PNG (`wordmark-dark.png`), height ~28px.
   - One-line tagline in `body-md` color `text-on-dark`: **"Data infrastructure for video, built for machines and agents."** (Canonical brand tagline as of v1.3 — supersedes earlier "The Perception Layer for AI".)
   - Address blocks in `body-md` color `text-on-dark-subtle`. Multiple offices stack vertically with `gap: 16px`.
   - Contact email below addresses, `body-md`, color `text-on-dark-subtle`.

2–5. **Nav column groups** (4 link columns):
   - Each column has one or more **group headers** in `mono-sm` uppercase color `text-on-dark` — these are the section categories (USE-CASES, DEVELOPERS, RESOURCES, LEGAL, etc.).
   - Beneath each header: stack of page links in `14px Geist 400` at **`rgba(255,255,255,0.50)`** (50% white) by default. Hover lifts to full white `#FFFFFF`. The muted default ensures the mono group heads anchor the visual hierarchy.
   - A column may contain multiple groups stacked vertically (e.g. AUTOMATION below USE-CASES). Groups are separated by **vertical space alone** — 40px gap between stacked groups, no hairline divider. The mono-caps style of group heads + the muted Geist of page links is sufficient hierarchy on its own.
   - Group header to first link: `20px` gap. Link-to-link: `14px` gap. Group-to-next-group inside a column: `40px` gap.
   - **All group heads share identical visual treatment.** No underline on any group head; no "current section" indicator on static marketing pages. The hierarchy is: group-header (mono caps, white) → page links (Geist sans, 50% white). Style and color alone carry the rank.

**Brand column separation.** The brand column (logo + tagline + addresses) is a fixed `360px` wide on desktop, followed by a wider `56px` column gap before the first nav column. This explicit separation makes the brand block read as a distinct unit from the nav grid, not as the first item in a row of equals.

6. **Group columns (continued)** — same rules. Canonical column groupings for videodb.io (post-v1.3 trim):

   | Col | Groups | Links |
   |---|---|---|
   | 2 | USE-CASES / AUTOMATION | Real Time Monitoring, Search Media Archives / VideoDB MCP, Zapier, n8n |
   | 3 | DEVELOPERS / ENTERPRISE | Quickstart, Advocate Program, Director, Python SDK, Node SDK, Examples / Media, Pricing |
   | 4 | RESOURCES | About us, Labs, Showcase |
   | 5 | LEGAL | DPA, Terms, Security, Privacy, Trust Centre |

**Footer baseline strip** (below the columns, separated by 1px hairline `border-on-dark`):
- Left: compliance/trust badges (AICPA SOC, GDPR, HIPAA, etc.) — small monochrome SVGs at ~24px height, `text-on-dark-subtle` color.
- Right: social icon row — X, Discord, GitHub, YouTube, LinkedIn. Each icon sits inside a 36px square pill (`{rounded.card}` 12px radius, `rgba(255,255,255,0.04)` background, 1px `border-on-dark`), 16px Solar icon centered. Hover: background lifts to `rgba(255,255,255,0.08)`.

**Copyright row** (bottom, separated by 1px hairline):
- Centered single line, `body-md` color `text-on-dark-subtle`: `© Copyright VideoDB <year>. All Rights Reserved.`

**Padding:** 64px top, 24px bottom, 32px horizontal. **Column gap:** **56px** between the brand column and the first nav column-group (and between subsequent nav column-groups) — wider than typical content gaps so the brand block reads as a distinct unit.

**Responsive:** at `<lg`, collapse to 3 columns (brand spans full width, nav columns 2-cols wide). At `<md`, brand stacks, nav columns become an accordion or a vertical stack of headed groups.

### Navigation Mega-menus

Each top-level nav item is a hover-triggered mega-menu. The dropdown panel is positioned absolutely below the nav row, opens with a fade + 8px slide-down, and is dismissed when the cursor leaves both the trigger and the panel.

**Trigger anatomy:**
- Nav label followed by a `+` glyph in `text-white/40`.
- On hover, `+` rotates 45° to read as `×` and tints to brand orange `#F24E1E`.
- Label text transitions from `text-white/70` to `text-white` on hover.
- Padding 20px×10px around each trigger.

**Hover bridge (mandatory):**
A `::after` pseudo-element on each `.nav-item` extends 16px below the trigger as a transparent zone with `pointer-events: auto` during hover. Without this, the dropdown closes the instant the cursor leaves the trigger box on its way down to the panel.

**Panel anatomy:**
- Background `#161616` (charcoal). Border 1px hairline `rgba(255, 255, 255, 0.08)`. Radius 16px.
- Shadow `shadows.overlay-panel`.
- Position `absolute; top: calc(100% + 12px); left: 50%; transform: translate(-50%, ...)`. The 12px gap is what the hover bridge spans.
- Z-index 60. Overflow hidden.

**Open state transition:**
- Initial: `opacity: 0; transform: translate(-50%, 8px); pointer-events: none`.
- Hovered: `opacity: 1; transform: translate(-50%, 0); pointer-events: auto`.
- Duration 200ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`.

**Width variants:**
- **narrow** 280px — Used for short tier-row lists (Pricing).
- **medium** 360px — Used for vertical lists (Agents) and 2-column quick-link grids (Docs).
- **wide** 540px — Used for 3-column primitive grids (Platform).

**Inner row patterns** (all with `padding: 12–16px`, radius `10–12px`, hover `bg-white/[0.04]`):
- **Mega cell** (Platform 3×2 grid): orange mono number → Geist title (14px / 500) → `white/55` description (12px / 1.45).
- **List row** (Agents): Geist title (13px / 500) → `white/55` one-line description. No icon, no number.
- **Quick link** (Docs 2×3 grid): leading 14px Solar icon (`white/55`, transitions to brand orange on row hover) + title + small description.
- **Tier row** (Pricing): mono uppercase tier label in orange + Geist description on the left, Geist amount on the right.

**Footer row (every dropdown):**
- Border-top hairline `rgba(255, 255, 255, 0.06)`.
- Background tint `rgba(255, 255, 255, 0.02)`.
- Padding 12px 18px.
- Left: mono utility text in `white/45`.
- Right: brand-orange `nav-mega-cta` link with text + Solar arrow icon. Hover lifts to `#FF6633`.

**Typography reset inside dropdowns:**
The nav itself is JetBrains Mono uppercase, but inside each dropdown the cells switch to **Geist with `text-transform: none` and `letter-spacing: 0`** — they're real content, not chrome.

### Stats / Numerical Row

Horizontal row of 4 stats. Each stat: large display number (Geist 48px / 300 / -0.03em) + small mono label below (JetBrains Mono 10–12px, uppercase, 0.2em). Numbers are integers with units inline (`2.4M`, `120ms`, `38`, `∞`). The `∞` is in brand orange — the only orange numeral.

### Ticker

Horizontally scrolling marquee for stats, customer logos, or status banners. Continuous loop, slow (`60s` per full traversal), `linear` timing. Pauses on hover. Two copies of the content in the strip so the loop is seamless. Dark ticker on `#0A0A0A` with 1px top/bottom hairlines `rgba(255,255,255,0.05)`; light ticker on `#F5F5F7` with `rgba(0,0,0,0.05)` hairlines. Content uses `mono-sm` for status-style or `label-md` for prose-style.

### Loaders

- **Status dot** — 8px circle in brand orange, `animation: pulse 1.2s ease-in-out infinite`. Used in code-block status bar, live-feed indicators.
- **Inline spinner** — 16px circular SVG, 2px stroke, current color, `animation: spin 800ms linear infinite`. Used inside buttons and form fields.
- **Skeleton shimmer** — Block of `#E8E8EA` (light) or `#1F1F1F` (dark) with a diagonal gradient shimmer sweeping every 1.6s. Use for content-loading placeholders.
- **Linear progress** — 2px tall, full-width, `#E8E8EA` track (light) or `rgba(255,255,255,0.08)` (dark), orange fill. Indeterminate variant sweeps a 30% segment across the track on a 1.4s loop.

### Slider

Horizontal range slider used for the pricing tier finder and similar configurators.

- **Track** — 4px tall, `rgba(255,255,255,0.08)` on dark or `rgba(0,0,0,0.08)` on light, full-width.
- **Filled track** — Brand orange `#F24E1E`, from 0 to thumb position.
- **Tier zones** — Optional 1/N segments behind the track in `rgba(255,255,255,0.04)`. The active zone fills with `rgba(242,78,30,0.12)`.
- **Thumb** — 20×20 brand orange circle with a 2px `#0A0A0A` border (dark sections) or `white` border (light), orange-tinted box-shadow ring, glow. Scales 1.2× on hover, 1.1× on active drag. Cursor `grab` / `grabbing`.
- **Markers (optional)** — small 6px dots beneath the track at zone boundaries. Active marker flips from `white/30` to brand orange.

### Form Controls — Pill Input (`.input-pill`)

The canonical text input pattern for VideoDB surfaces. Used for email capture, search, auth, any single-line text entry. Pairs naturally with a primary pill button to form an inline form (subscribe band, login, search bar).

**Anatomy:**
- **Surface** `rgba(255,255,255,0.04)` (dark sections) or `rgba(0,0,0,0.04)` (light sections).
- **Border** 1px `rgba(255,255,255,0.10)` / `rgba(0,0,0,0.10)`.
- **Radius** full pill (`r-control`, `9999px`).
- **Padding** 14px × 22px.
- **Typography** Geist 14px, color `#fff` / `#111`.
- **Placeholder** color at `0.40` opacity.
- 150ms transition on `border-color` and `background`.

**States:**
- **`:focus` (or `.is-focused` for demo purposes)** — border lifts to `rgba(242,78,30,0.5)` (soft orange ring), background to `0.06` white / black.
- **`.is-error`** — border becomes `var(--color-error)` (#E5484D), background `var(--color-error-soft)`. **Never use brand orange for the error state** — orange and red are too close in hue to read as distinct semantics.
- **`.is-buzz`** — short-lived class applied alongside `.is-error` to trigger the buzz animation (see below). Removed after 400ms so it can replay on next invalid attempt.

**Companions:**
- **`.input-pill-label`** — JetBrains Mono 10px / 0.2em / uppercase, color `0.55` white (or `0.55` black on light), shown above the input as the field label.
- **`.input-pill-helper`** — JetBrains Mono 10px / 0.18em / uppercase below the input. Default color `0.40` white. The `.is-error` modifier on the helper text flips it to `var(--color-error)`.

#### Buzz animation — invalid input feedback

A short horizontal shake that runs once when an invalid submit is attempted. Reinforces the red error state without being intrusive.

```css
@keyframes input-buzz {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-6px); }
  30% { transform: translateX( 6px); }
  45% { transform: translateX(-5px); }
  60% { transform: translateX( 5px); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX( 3px); }
}
.input-pill.is-buzz {
  animation: input-buzz 360ms cubic-bezier(0.36, 0, 0.66, -0.56);
}
```

**Trigger pattern:**
- On form submit, validate via `input.checkValidity()` (HTML5 constraints).
- If invalid: add `.is-error` and `.is-buzz` classes; remove `.is-buzz` after 400ms via `setTimeout` so the animation can replay on the next attempt.
- On `input` event (user starts typing again): remove `.is-error` automatically.

**Reduced motion:** the global `@media (prefers-reduced-motion: reduce)` rule kills the buzz animation but the red `.is-error` styling stays — error remains visually communicated, just without motion.

### Highlighter

Text emphasis effects:

- **Selection highlight** — `::selection { background: #F24E1E; color: #fff; }`. Brand-orange selection across the whole site.
- **Underline highlight** — Animated `border-bottom: 1px solid #F24E1E` that draws from left to right on hover via `background-size` trick on a linear-gradient pseudo-element. Used on in-prose links inside light sections.
- **Marker highlight** — A wide, low-opacity orange bar (`rgba(242,78,30,0.18)`) sitting behind a phrase, drawn from baseline up ~60% of cap height. Used to mark a single key term in a heading. One per page max.
- **Search match highlight** — `background: rgba(242,78,30,0.25); color: inherit; padding: 0 2px; border-radius: 2px;`. Used in docs/search results.

### Iconography
- **Treatment** Linear (stroke-based, never filled).
- **Set** Solar (Iconify).
- **Sizing** 16px inline with body, 20px in nav, 14px in tight UI / dropdown quick-links, 12px in mega-menu footer CTAs.
- **Color** Inherits `currentColor` from surrounding text — never tinted orange unless the icon sits inside an orange surface or on an active dropdown row.

CDN load:
```html
<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
<iconify-icon icon="solar:arrow-right-linear" width="16" height="16"></iconify-icon>
```

**Catalogue used on the marketing site:**

| Icon | Usage |
|---|---|
| `solar:arrow-right-linear` | Primary CTAs, "Read about X" links, dropdown footer CTAs |
| `solar:arrow-right-up-linear` | External-link CTAs (`docs.videodb.io`) |
| `solar:play-circle-linear` | "Watch the Demo" secondary CTA |
| `solar:copy-linear` | Code block copy button |
| `solar:check-circle-linear` | Copy success state |
| `solar:rocket-2-linear` | Docs → Quickstart |
| `solar:code-square-linear` | Docs → API Reference |
| `solar:widget-add-linear` | Docs → Skills SDK |
| `solar:transfer-horizontal-linear` | Docs → Migration |
| `solar:notes-linear` | Docs → Changelog |
| `solar:chat-round-line-linear` | Docs → Discord |

**Glyph rules:**
- **No emoji.** Anywhere — not in CTAs, cards, body, chrome, or marketing copy.
- **No unicode glyph icons** except a few editorial dashes: `—` as a list bullet on the light comparison column, `→` (brand orange) as the matching bullet on the dark column. `∞` appears once, in the stat row, as a brand-orange numerical replacement for "Agent ready".
- **No bespoke SVGs** for branding — the wordmark and V-glyph are PNGs in `assets/logos/`. Do not re-trace the wordmark.

---

## Interactive Patterns

### Masked word reveal (every section heading)

Every display heading marked with `js-reveal-text` animates in word-by-word when scrolled into view. The system's signature heading entrance.

**Mechanics:**
- ScrollTrigger fires when the heading enters viewport at 90% from top.
- Each word wrapped in an outer `.reveal-wrapper` (`display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.15em;`) and inner `.reveal-inner` (`display: inline-block`).
- Inner starts at `transform: translateY(105%)` (off-screen below the mask).
- GSAP tweens `y: 0%` with `duration: 1, stagger: 0.04, ease: power4.out`. Words rise into view one after another.

**Critical: descender clipping.** The wrapper needs `overflow: hidden` during the animation (so the inner word stays masked while sliding up), but `overflow: hidden` will also **clip descenders** (the tails of `g`, `y`, `p`, `j`, `q`) permanently — especially on display-xl/lg sizes where tight line-height + heavy descenders compound. Two-pronged fix:

1. **`padding-bottom: 0.15em` on `.reveal-wrapper`** — gives the descenders room without changing the visual line-height of the heading. This is the primary fix.
2. **`overflow: visible` on completion** — GSAP's `onComplete` callback on the master tween toggles the wrapper to `overflow: visible` after the reveal so subsequent reflows can't re-clip. Belt-and-braces.

If the second clause of a two-tone heading (`<span class="tone-2">`) ever looks like it's missing its descender tails, this is the bug.

**Critical implementation — DOM walking:**
The naive approach (`textEl.innerText` then split-by-space rebuild) **destroys** any `<br>` line breaks and `<span>` color spans. Two-tone headings would lose both their break and their second-tone color.

The correct implementation walks the heading's DOM tree recursively:
- **Text nodes** → split into words, each wrapped in `.reveal-wrapper > .reveal-inner`.
- **`<br>` elements** → preserved as real line breaks in the rebuilt structure.
- **`<span>` and `<code>` elements** → recursed into, with their `class` and inline `style` inherited onto the resulting word wrappers (so `text-black/55` second-tone color and `<code>`'s JetBrains Mono font survive the rebuild).

### Typing code block

**Trigger:** ScrollTrigger fires once when the code block enters viewport at 70–75% from top.

**Animation:**
- Snippet types in character-by-character at ~14ms/char (capped at 1.2–3.0s total).
- Cursor stays solid (`is-typing` class disables blink) during animation.
- Status dot pulses orange at 1.2s ease-in-out.
- On complete: syntax coloring is applied via `colorize()` (regex-based, system-color only), cursor resumes blinking, status dot stops pulsing, status text changes to "Ready".

**Tab switching:** Clicking a tab kills any in-flight tween and re-types the new snippet from scratch.

**Copy button:** On click, copies the current snippet's plain text. Icon swaps to checkmark, label to "Copied", text turns brand orange for 1.6s, then resets.

### Live annotation chips

The typing tween fires `onUpdate` callbacks at percentage thresholds (e.g., 18%, 65%, 92%). Each threshold activates a chip on the right by adding `is-active`. Active chip:
- Background flips from `#E8E8EA` to white.
- Border gains a soft orange ring (`rgba(242,78,30,0.25)`).
- Soft orange-tinted drop shadow.
- Mono label color flips from `black/40` to brand orange.

Only one chip active at a time.

### Pricing (light-mode tier cards) — canonical

The default pricing presentation is a **light section** with three equal-height tier cards laid out as adjacent columns inside the framed content column. Centered section heading above (mono `PRICING` code → display-md two-tone), centered subhead.

**Tier card anatomy:**
- Background: `{colors.neutral-light}` for outer cards; the **featured/middle tier** uses `{colors.surface-light}` to lift it visually. (Alternative: keep all three on `neutral-light` and use a 1px orange hairline on the featured card.)
- Border: 1px `{colors.border-on-light}` between adjacent cards. The cards sit edge-to-edge — no inter-card gap.
- Padding: `28px` (card-padding-md).
- Top row: `label-bracketed-mono` price prefix on the left (e.g. `[$0 / MONTH]`); tier name in `mono-sm` uppercase on the right (e.g. `FREE`).
  - Featured tier renders the bracketed mono in brand orange `#F24E1E`; the plan name stays in default text color.
- Description: `body-md`, color `{colors.text-on-light-muted}`, max 2 lines. 16px top margin.
- Feature list: `body-md`, vertical bar bullet (`▌` 2×16px) before each item, gap 12px between items. Featured tier uses brand orange bars; non-featured cards use `{colors.text-on-light-subtle}` bars.
- Bottom CTA: **full-width pill button** using the existing `.btn-primary` (featured / enterprise) or a dark-bg pill (`#0A0A0A` with white label, full-width) for the entry tier. CTAs in sentence case ("Get started", "Subscribe", "Contact sales") — not uppercase.

**Equal-height row rule.** All three cards align to the height of the tallest card by default — use `display: grid; grid-template-columns: repeat(3, 1fr); align-items: stretch;` (or flex equivalent). Don't truncate; if a card has more content, all cards grow.

### Pricing tier finder (dark-mode interactive variant — secondary)

A horizontal slider sitting on top of three equally-weighted tier zones (Free / Usage / Annual), inside a full dark-mode section. Use this as a secondary/educational variant — e.g., interactive page about how billing scales. The default pricing presentation is the light-mode tier cards above.

- Slider value 0–33 → "Free", 34–66 → "Usage", 67–100 → "Annual".
- Dragging highlights the matching pricing card (orange ring, glow, +1 translateY) and dims sibling cards to `opacity: 0.55`.
- Matching tier zone fills with soft orange tint.
- Matching tier marker flips from `white/30` to brand orange.
- All three cards remain fully readable at all times — the slider is a *navigator*, not a content morpher.

### Lifecycle flow

Six primitive cards visible simultaneously in a horizontal grid (2 cols mobile → 6 cols desktop). The first card is subtly emphasized via `#DCDCDE` background as the "starting point".

**Equal-height row rule.** Cards stretch to match the tallest card's content (`align-items: stretch` on the grid). **No `max-height` clipping** on the description — the default state shows the full text. The card cannot grow on hover; only the chrome changes.

**Hover state:**
- Background flips from `#E8E8EA` to `#FFFFFF`.
- Adds `shadows.lift-light`.
- No height change. The card was already sized to the longest description in the row, so hover only swaps surface and adds the lift shadow.

Pure CSS, no JS state.

### Synchronized comparison (row-paired)

Row-paired comparison inside a container with two side-by-side cells per row. The painful version on the left and the VideoDB version on the right at the same vertical position.

- Left column: surface-light background, `—` markers in `black/40`, body in `black/75`.
- Right column: charcoal `#161616` background, `→` markers in brand orange, body in `white/85`.
- A 16px **gap** separates the two columns so they read as distinct containers (each gets its own rounded corner set), but the comparison is preserved through synchronized hover: hovering *either* half of a row lifts both halves together. Use a JS-paired `group-hover` mechanism (since CSS sibling hover doesn't cross containers).
- Hovering any row pair: left side gains `bg-white/40`, right side darkens to `#1F1F1F` (charcoal-hover).

Mobile: rows stack but preserve pair grouping via row borders.

### Problem / Solution comparison containers (alt variant)

A second comparison pattern, sitting **side-by-side at the container level rather than the row level**. Use this when the two sides aren't strictly parallel — e.g., "8 stitched-together services" vs. "1 unified backend". Cards are independent units, each with its own header chrome and footer status pill.

**Layout:**
- Two cards side by side inside the framed content column. 16px gap between them (or `gap-md`).
- Equal-height row (`align-items: stretch`).

**LEFT card — "The problem" / status quo.**
- Background: `{colors.surface-light}` (#E8E8EA).
- Radius: `{rounded.surface-md}` (16px). Padding: `28px`.
- Top row: `label-bracketed-mono` left (e.g. `[TODAY — THE FRANKENSTACK]`); `mono-sm` uppercase right tag (e.g. `BRITTLE`), both in default `text-on-light` color.
- Body: subhead in `body-md` muted; row list with vertical bar bullets, item name left + category mono caps right (`{colors.text-on-light-subtle}`).
- Bottom: full-pill mono caps footer pill on `{colors.neutral-dark}` with status dot in `white/40` and mono text in `white/70` (e.g. `8 SERVICES · 4 VENDORS · ~6 WEEKS TO SHIP A FEATURE`).

**RIGHT card — "The solution" / VideoDB.**
- Background: `{colors.surface-warm}` (#FDF1E8) — the new VideoDB-positive surface.
- Border: 1px `{colors.surface-warm-border}` hairline.
- Same structural shape as the left card.
- Top row: `label-bracketed-mono` in brand orange (e.g. `[VIDEODB — ONE BACKEND]`); `mono-sm` uppercase right tag in brand orange (e.g. `UNIFIED`).
- Body row bullets render in brand orange; category mono caps in `{colors.text-on-light-muted}`.
- Bottom: full-pill mono caps footer pill with brand orange background, white pulse dot, and white mono caps text (e.g. `1 API · 1 MENTAL MODEL · ~5 MINUTES TO FIRST QUERY`).

**Rules:**
- Use `surface-warm` only for VideoDB-positive containers. Never for chrome, body backgrounds, or as a substitute for `surface-light`.
- The bracketed label is the new `label-bracketed-mono` style — literal brackets, mono, slight letter-spacing.
- The contrast is content-level, not via heavy chrome — both cards share the same skeleton; the color and bullet treatment carry the meaning.

---

## Hero variants

Two sanctioned hero compositions. Pick **one** per page; never run both on a production page (the showcase intentionally runs both for side-by-side evaluation).

### Hero — primary (left-aligned, breathing dome)
The canonical hero. Display-xl heading aligned to the left of the framed column, stats row beneath, WebGL **dome** (upper-hemisphere particle field, ~15,000 points at `size: 0.08`, `opacity: 0.4`) behind, **shifted right** (+22 on x) so it doesn't sit behind the heading text. Hero pill above the heading carries a live status string (`Live · v2.4.0`). CTA pair (primary + gradient-bordered secondary) sits below the heading. Use when the page wants editorial weight, the kind of confident infrastructure-product fold that runs alongside a magazine-style narrative.

**Primary-hero heading is singular white** — the only declarative heading in the system where the two-tone treatment does NOT apply. The opening fold leads with full-strength type to assert the product; tone-2 muting is a section-opener pattern, not a hero-opener pattern.

**Hero subtext variant.** Below the heading, between the body and the CTAs. Sits slightly above `body-lg` to read with presence against `display-xl`:
- Font-size: **20px** (vs body-lg's 18px).
- Line-height: **30px** (vs 28px).
- Color: `text-on-dark-muted`.
- Max-width: 640px.
- Weight: 400.

Use this variant only for hero subtext. In-flow body copy stays on standard `body-lg` / `body-md`.

**Sizing.** Display-xl on the hero uses `clamp(52px, 7vw, 88px)` (reduced from the earlier 56–96 range) so the stats row sits inside the first viewport fold on standard 13–16" laptops. The stats row's top margin is 48px (down from 72px) for the same reason.

#### Dome atmospherics — three coupled effects

The primary hero dome is not a static, single-axis rotation. Three effects run concurrently, all coupled to the same time clock:

1. **Size oscillation (the breath).**
   - Formula: `scale = 1.03 + cos(t * 0.39) * 0.25`.
   - The `cos` form (not `sin`) is non-negotiable — it guarantees t=0 sits at the **peak** (≈1.28×), so the dome enters the page at its largest size and shrinks from there.
   - Cycle: peak (~1.28×) → trough (~0.78×) → peak, period ≈ 16 seconds.

2. **Size-coupled distortion (the roil).**
   - Each particle stores a base position, a precomputed radius, and a random phase offset (`basePositions`, `radii`, `phases` arrays — these are not optional; the dome can't distort without them).
   - Per-frame, each particle's radial position is displaced by a sine wave: `wave = sin(t * 0.85 + radius * 0.16 + phase) * distortionAmp`.
   - Distortion amplitude is **inversely tied to current scale**:
     ```
     sNorm = (scaleVal - 0.78) / 0.50    // 0 at smallest, 1 at largest
     distortionAmp = (1 - sNorm) * 4.0 + 0.4
     ```
     End-to-end range ≈ **0.4 at the largest size, 4.4 at the smallest** — a 10× contrast. Largest moment of the dome is the calmest; smallest moment is the most turbulent. Big-and-serene → small-and-roiling, on a continuous oscillation.

3. **Multi-axis varying rotation (the drift).**
   - Each axis carries an independent sine-driven speed; the dominant rotation axis drifts smoothly between y, x, and z over ~40–60 second cycles.
   - Speeds (radians per frame):
     - `ySpeed = 0.0012 + sin(t * 0.13) * 0.0008` (period ≈ 50s, always positive — y is always rotating)
     - `xSpeed = sin(t * 0.09 + 1.05) * 0.0010` (period ≈ 70s, π/3 offset, direction reverses)
     - `zSpeed = sin(t * 0.07 + 2.10) * 0.0006` (period ≈ 90s, 2π/3 offset, direction reverses)
   - The dome never reads as a fixed-axis spin.

**Reduced motion.** All three effects (size oscillation, distortion, multi-axis rotation) are disabled under `prefers-reduced-motion: reduce`. The dome renders at scale 1.0 with zero rotation; particles sit at their base positions.

**Why these three together.** The size oscillation alone would feel mechanical; the distortion alone would feel like noise; multi-axis rotation alone would feel arbitrary. Coupled, they produce a breathing, axially-drifting cloud that reads as natural ambient motion rather than a programmed effect.

### Hero — centered (abstract cloud, code-led)
An alternative composition for product/builder-led pages where the immediate read should be "this is software you install". Differences from the primary hero:

- **Display heading is `display-lg` (64px), not `display-xl`.** The smaller size buys vertical room for the code block below.
- **Heading uses a four-line, two-group structure with three tonal steps.** Group 1 (the premise) sits in tone-2 muted (`text-on-dark-second`, 45% white) across both lines. Group 2 (the reframe) sits in full-strength white for its first line and brand-orange `.tone-orange` for its final phrase. The pattern is *muted-muted | white-orange* — three tonal steps without any weight or size variation. All four lines share `display-lg`'s 300 weight; color alone carries hierarchy.
- **Subtext line** sits directly below the heading with a tightened gap (`margin-top: -8px` adjustment on the first sibling, so the heading and subtext read as a single paragraph block rather than two separate elements). Style: `hero-subtext` (20px / 30px / 400 / `text-on-dark-muted`, max-width 640px, `text-wrap: balance`).
- **Content is centered** in an ~880px column inside the framed column. Heading, subtext, CTAs, and code block all align to center.
- **Background is `#050505` (`neutral-darker`)**, not the primary hero's `#0A0A0A`. The darker base gives the cloud room and keeps the centered composition clutter-free.
- **WebGL is an abstract distorted point cloud, not a clean half-sphere.** Seeded from an upper-hemisphere base, then immediately deformed by static turbulence — the rendered shape is intentionally abstract, not a recognizable dome. See "Centered hero cloud — composition" below.
- **Mask is less aggressive** — fades start at 18% and end at 85% (vs the primary hero's 35%/78%) so more of the cloud reads.
- **Code block sits directly below the CTA pair.** Same component as the in-page code blocks — `code-block-animated` with typing reveal on viewport entry. Use a copy-pasteable Quickstart (the `npx create-videodb-app` snippet works well). The earlier "static, no typing animation on the hero" rule has been retired: both hero and in-page code blocks share the typing pattern.
- **No stats row** under the heading (the primary hero owns that pattern).
- **No hero pill** above the heading (centered composition doesn't need a status badge to lead in).

#### Centered hero cloud — composition

The cloud has two distortion layers — one **static** (baked into the base shape) and one **animated** (per-frame). Both are needed; the static layer makes the base read as abstract before any motion, the animated layer keeps it alive.

**Base shape:**
- ~8,500 particles (sparser than any earlier version) at `size: 0.085`, `opacity: 0.22` so text reads clearly through it.
- Seeded on an upper-hemisphere distribution with phi range slightly widened (`Math.acos(random * 1.0 - 0.05)`) so the shape spills a touch below the equator and reads less like a literal cap.
- Y-offset of −6 to keep the cloud low enough not to crowd the heading.

**Static turbulence (applied once at init):**
- Each base position is radially displaced by a sum-of-three-sines turbulence function:
  ```
  turbulence(x, y, z) =
    sin(x*0.18) * cos(y*0.22) * sin(z*0.25) * 4.0
  + sin(x*0.42) * cos(y*0.38) * sin(z*0.51) * 2.0
  + sin(x*0.71 + y*0.30) * 1.2
  ```
- The displaced positions are then stored as the new base — animated waves layer on top of an already-irregular cloud.

**Animated distortion (per-frame, two waves summed):**
- Wave 1 (radial): `sin(t * 0.55 + rad * 0.18 + phase[i]) * 3.0` — large-amplitude radial breathing keyed to each particle's radius and a random phase.
- Wave 2 (planar): `sin(t * 0.31 + x * 0.12 + y * 0.09) * 1.6` — secondary wave at a different frequency keyed to xy coordinates.
- Summed, the displacement reads as **turbulence** rather than a single beat.

**Rotation:** slow base rotation `y += 0.00040`, `x += 0.00008`. A fixed `rotation.z = 0.12` tilt prevents the cloud from reading as axially symmetric.

**Reduced motion:** disables both the animated waves and the rotation. Static turbulence stays (it's part of the base shape).

Both variants use `js-reveal-text` on the heading so the masked word reveal applies.

**Rule:** when building a page, choose primary OR centered — don't run both. Showcases that demo both are explicitly off-spec for production.

### Punchline orange — bounded exception

Brand orange `#F24E1E` may appear in a **display heading** under one specific condition: as the **final phrase of a hero/declarative heading**, marking the punchline. This is a deliberate, contained exception to the general rule that orange never appears in text.

**Rules:**
- **One punchline phrase per page, maximum.** Never used twice on the same page.
- **Only on hero and primary declarative headings.** Not in section openers, not in body, not in cards, not in nav.
- **Applied as a `.tone-orange` class** on the trailing `<span>` of a heading.
- **Weight stays at the parent's display weight** (e.g., `display-lg`'s 300). Color alone carries the punch — no weight bump. This keeps every line of the heading reading at the same visual size; the orange contrast is enough emphasis on its own.
- Contrast check: `#F24E1E` on `#050505` or `#0A0A0A` passes WCAG large-text AA easily (>10:1). Body-text minimums still apply: never use orange below `body-lg` size.

**Canonical heading structure** (centered hero):

```html
<h1 class="display-lg js-reveal-text">
  <span class="tone-2">Video was built for<br>people to watch.</span><br>
  VideoDB makes it usable for<br>
  <span class="tone-orange">machines to understand.</span>
</h1>
```

The first group ("Video was built for / people to watch.") sets the premise — **both lines** in `tone-2` (45% white). The second group reframes ("VideoDB makes it usable for / machines to understand."): line 3 full white, line 4 in `tone-orange` (brand orange, same weight as parent) landing as the punchline.

The pattern is *muted-muted | white-orange* — three tonal steps without any weight or size variation. The contrast verbs ("watch" vs "understand") are the point of the heading; orange does the work, no weight bump needed.

## ASCII / WebGL Atmospherics

Dark hero sections use a **Three.js particle field** as the signature atmospheric layer. Two sanctioned variants — the **primary hero's breathing dome** and the **centered hero's abstract cloud** — each documented below as a reference implementation.

### Primary hero — breathing dome

Upper-hemisphere point cloud, shifted right of the heading, with size oscillation, size-coupled per-vertex distortion, and multi-axis varying rotation. See the "Hero — primary" section for the design rationale; this is the canonical implementation.

```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // throttle DPR
renderer.setSize(w, h);

const count = 15000;
const positions     = new Float32Array(count * 3);
const basePositions = new Float32Array(count * 3);  // pristine, never mutated post-init
const phases        = new Float32Array(count);
const radii         = new Float32Array(count);

for (let i = 0; i < count; i++) {
  const r = 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.8 + 0.2); // upper hemisphere
  // +22 x-offset shifts the dome right of the heading text;
  // -20 y-offset makes it rise from a low horizon.
  const x = r * Math.sin(phi) * Math.cos(theta) + 22;
  const y = r * Math.cos(phi) - 20;
  const z = r * Math.sin(phi) * Math.sin(theta);
  basePositions[i*3]     = positions[i*3]     = x;
  basePositions[i*3 + 1] = positions[i*3 + 1] = y;
  basePositions[i*3 + 2] = positions[i*3 + 2] = z;
  radii[i]  = Math.sqrt(x*x + y*y + z*z);
  phases[i] = Math.random() * Math.PI * 2;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.08,
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const startTime = Date.now();
const positionAttr = geometry.attributes.position;

function animate() {
  if (!reducedMotion) {
    const t = (Date.now() - startTime) / 1000;

    // (1) Size oscillation — cos(0)=1, so starts at peak (≈1.28×).
    const scaleVal = 1.03 + Math.cos(t * 0.39) * 0.25;
    points.scale.set(scaleVal, scaleVal, scaleVal);

    // (2) Distortion amplitude — inversely tied to scale.
    //     Smallest scale → max distortion (≈4.4); largest → min (≈0.4).
    const sNorm = (scaleVal - 0.78) / 0.50;
    const distortionAmp = (1 - sNorm) * 4.0 + 0.4;
    for (let i = 0; i < count; i++) {
      const bx = basePositions[i*3];
      const by = basePositions[i*3 + 1];
      const bz = basePositions[i*3 + 2];
      const rad = radii[i];
      const wave = Math.sin(t * 0.85 + rad * 0.16 + phases[i]) * distortionAmp;
      const s = (rad + wave) / rad;
      positions[i*3]     = bx * s;
      positions[i*3 + 1] = by * s;
      positions[i*3 + 2] = bz * s;
    }
    positionAttr.needsUpdate = true;

    // (3) Multi-axis varying rotation — dominant axis drifts y → x → z.
    const ySpeed = 0.0012 + Math.sin(t * 0.13)        * 0.0008;
    const xSpeed =          Math.sin(t * 0.09 + 1.05) * 0.0010;
    const zSpeed =          Math.sin(t * 0.07 + 2.10) * 0.0006;
    points.rotation.y += ySpeed;
    points.rotation.x += xSpeed;
    points.rotation.z += zSpeed;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

**Container mask (mandatory both edges):**

```css
#webgl-container {
  mask-image: linear-gradient(to bottom,
    transparent 0%, black 35%, black 78%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom,
    transparent 0%, black 35%, black 78%, transparent 100%);
  opacity: 0.9;
}
```

### Centered hero — abstract distorted cloud

Sparser point cloud seeded on an upper-hemisphere base, then statically deformed by turbulence to break the recognizable shape, then animated by two-frequency wave distortion. See the "Hero — centered" section for the design rationale.

```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(w, h);

const count = 8500;
const positions     = new Float32Array(count * 3);
const basePositions = new Float32Array(count * 3);
const phases        = new Float32Array(count);
const radii         = new Float32Array(count);
const baseR = 26;

// Static turbulence — 3-frequency sum of sines, deforms the hemisphere
// into a bumpy, non-uniform cloud BEFORE any animation runs.
function turbulence(x, y, z) {
  return Math.sin(x * 0.18) * Math.cos(y * 0.22) * Math.sin(z * 0.25) * 4.0
       + Math.sin(x * 0.42) * Math.cos(y * 0.38) * Math.sin(z * 0.51) * 2.0
       + Math.sin(x * 0.71 + y * 0.30) * 1.2;
}

for (let i = 0; i < count; i++) {
  const theta = Math.random() * Math.PI * 2;
  // phi range widened slightly so the shape spills below the equator
  const phi = Math.acos(Math.random() * 1.0 - 0.05);
  let x = baseR * Math.sin(phi) * Math.cos(theta);
  let y = baseR * Math.cos(phi) - 6;
  let z = baseR * Math.sin(phi) * Math.sin(theta);
  // Apply static turbulence to the base position
  const noise = turbulence(x, y, z);
  const r = Math.sqrt(x*x + y*y + z*z);
  const s = (r + noise) / r;
  x *= s; y *= s; z *= s;
  basePositions[i*3]     = positions[i*3]     = x;
  basePositions[i*3 + 1] = positions[i*3 + 1] = y;
  basePositions[i*3 + 2] = positions[i*3 + 2] = z;
  radii[i]  = Math.sqrt(x*x + y*y + z*z);
  phases[i] = Math.random() * Math.PI * 2;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.085,
  color: 0xffffff,
  transparent: true,
  opacity: 0.22,  // low — text reads cleanly through it
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const points = new THREE.Points(geometry, material);
points.rotation.z = 0.12; // fixed tilt — prevents axially-symmetric read
scene.add(points);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const startTime = Date.now();
const positionAttr = geometry.attributes.position;

function animate() {
  if (!reducedMotion) {
    const t = (Date.now() - startTime) / 1000;
    // Two animated waves summed — reads as turbulence not pulsation
    for (let i = 0; i < count; i++) {
      const bx = basePositions[i*3];
      const by = basePositions[i*3 + 1];
      const bz = basePositions[i*3 + 2];
      const rad = radii[i];
      const w1 = Math.sin(t * 0.55 + rad * 0.18 + phases[i]) * 3.0;
      const w2 = Math.sin(t * 0.31 + bx * 0.12 + by * 0.09) * 1.6;
      const wave = w1 + w2;
      const s = (rad + wave) / rad;
      positions[i*3]     = bx * s;
      positions[i*3 + 1] = by * s;
      positions[i*3 + 2] = bz * s;
    }
    positionAttr.needsUpdate = true;
    points.rotation.y += 0.00040;
    points.rotation.x += 0.00008;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

**Container mask (less aggressive than primary hero):**

```css
#webgl-container-2 {
  mask-image: linear-gradient(to bottom,
    transparent 0%, black 18%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom,
    transparent 0%, black 18%, black 85%, transparent 100%);
  opacity: 1;
}
```

### Common rules

Particles must never cut off abruptly at section edges — the bottom fade is non-negotiable on both variants.

- **One scene per page in production.** Don't run two heavy WebGL scenes simultaneously. (The showcase intentionally runs both for side-by-side evaluation.)
- **Never mouse-reactive.** Motion is autonomous and continuous.
- **DPR capped at 2** (`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`) — higher hurts performance with no visible gain.
- **Text never sits directly on the particle field** without a backdrop pill, contained card, or ≥85% opacity in the faded zone.
- **`prefers-reduced-motion: reduce` disables** all per-frame motion (rotation, distortion, size oscillation). Static geometry remains visible — the page does not go blank.
- **Performance.** CPU-side per-vertex distortion comfortably handles ~15k particles per frame on modern hardware. For higher counts (>30k) move displacement to a vertex shader.

ASCII-style dotted patterns (`radial-gradient` at small sizes) also apply to mono badges and section codes — a tactile, low-fi callback to terminal/infrastructure heritage.

---

## Motion

Motion is **interface-led and restrained**. No bouncy springs, no decorative wiggling. Every animation reads as confidence, not enthusiasm.

- **Motion Level:** moderate
- **Default duration:** 150ms (UI), 300ms (transitions, max-height expansions), 1000ms (text reveals)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for UI, `power4.out` for GSAP text reveals, `ease` for hover color transitions, `power2.in/out` for cross-fades.
- **Hover patterns:** color shifts, text opacity changes, 1.1–1.2× transform on accent surfaces only (orange bubbles, slider thumbs).
- **Scroll patterns:** Parallax for WebGL layers; GSAP-driven masked word reveals on **every section heading** (`.js-reveal-text`); ScrollTrigger-once typing reveals on code blocks.
- **Page entry:** No load animation on the section frame — only the WebGL fade-in and the staggered word reveal on the first display heading.
- **Particle motion:** Continuous, slow, autonomous — never reacts to mouse.
- **Tap feedback:** Visual response within 100ms on every interactive element (color shift, opacity, ring). Don't rely on hover-only feedback.
- **Reduced motion:** Respect `prefers-reduced-motion: reduce`. Disable the masked word reveal, the typing code block animation, the WebGL rotation, and the ticker scroll. Content must still be fully accessible.

---

## Accessibility (Non-negotiable)

These rules exist because earlier iterations failed real legibility tests.

### Text opacity floors
- **Body (dark):** minimum white at 75% — never `/40`, `/50`, `/55`.
- **Body (light):** minimum `#111` at 75%.
- **Utility / meta labels (mono-sm):** minimum 60% on either mode.
- **Display headings:** 90–95%.
- **Decorative chrome only:** 25–35% is permitted *only* for non-textual elements (dot patterns, hairlines, fade gradients).

### Contrast pairs
- Body text vs background: WCAG AA (≥ 4.5:1).
- Large text and UI components: WCAG AA Large (≥ 3:1).
- Brand orange `#F24E1E` body text on `#0A0A0A` — **fails AA**. Never use orange for body. Accent surfaces and CTAs only; text *on* orange is white 100%.

### Touch targets
- Minimum interactive area 44×44px (Apple) / 48×48dp (Android). Use `hit-area` padding if the visual element is smaller (e.g. icon-only nav button).
- Minimum 8px gap between touch targets.

### Focus states
- Every interactive element shows a visible focus ring on keyboard nav: 2px solid brand orange offset 2px (`outline: 2px solid #F24E1E; outline-offset: 2px`).
- Never use `outline: none` without an explicit replacement.

### Dotted-pattern badges
- Dot field fills full badge at 25–30% opacity, sub-pixel size (`3px 3px` dark, `5px 5px` light).
- Text uses 2–3px text-shadow halo in section background to punch through.
- Text opacity 90% on dark, 78% on light.

### Text over busy backgrounds
When text sits over WebGL, gradient meshes, or any non-uniform background, it must do **one** of:
- Sit in a contained pill/card with a solid or 80%+ opaque backdrop (`bg-[#0A0A0A]/80 backdrop-blur-sm`).
- Use a section-matching backdrop element behind it.
- Sit at 85%+ opacity *and* inside the WebGL mask's faded zone (upper 50%).

The hero `LIVE · v2.4.0` pill is the canonical pattern.

### Screen reader support
- All interactive elements have descriptive labels (visible text or `aria-label`).
- Icon-only buttons require `aria-label`.
- Mega-menu rows are `<a>` elements with real `href` targets — keyboard-tabbable. Hover state never gates critical functionality; tap/click on mobile simply navigates.
- Heading levels are sequential — never skip levels.

### Reduced motion
Honor `@media (prefers-reduced-motion: reduce)`. Disable: word-reveal animation, typing code animation, WebGL rotation, ticker scroll, hover transforms beyond 1× (keep color shifts).

---

## Do's and Don'ts

### Do
- Commit fully to dark or light per section — don't blend the modes within one section.
- Keep the orange `#F24E1E` rare and load-bearing.
- Use Geist for everything except mono labels.
- Preserve the centered 1400px frame with vertical hairlines on every section.
- Use the WebGL particle dome once per page, in the primary hero, with both top AND bottom mask fades.
- Use the 2/10 column offset on every light-section content body.
- Use a single text run with `<br>` and a `<span>` for two-tone display headings — never stacked `<div>` blocks.
- Use `#161616` charcoal for cards-in-light-sections, code blocks, AND mega-menu panels.
- Use 9999px radius for every button, no exceptions.
- Explicitly set `font-family: Geist` on every display class to override Tailwind CDN's heading reset.
- Mark every section heading with `js-reveal-text` so the masked word reveal applies uniformly.
- Declare display class line-heights with `!important` to win over Tailwind utility line-height bundles.
- Reset typography inside mega-menu panels to Geist + `text-transform: none`.
- Use the wordmark PNG (`wordmark-dark.png` / `wordmark-light.png`) with `alt="VideoDB"` in every header and footer.
- Use `VideoDB` in running prose (capital V, capital DB). The URL stays lowercase.
- Provide a visible 2px brand-orange focus ring on every interactive element on keyboard nav.
- Respect `prefers-reduced-motion`.

### Don't
- Don't introduce a third accent color. Orange is the only brand color.
- Don't use Inter, Roboto, or system fonts. Geist + JetBrains Mono only.
- Don't introduce syntax-theme colors (blue, green, tan) in code blocks. Only white opacities + brand orange.
- Don't apply glass to surfaces other than the floating header.
- Don't use drop shadows for routine card decoration. Reserve them for active pricing cards, floating mega-menu panels, and the lifecycle hover lift.
- Don't mix dark tones (`#0A0A0A` and `#161616`) interchangeably. Hero is `#0A0A0A`; cards / code blocks / mega-menus are `#161616`.
- Don't break the vertical frame border — it persists through every section.
- Don't run more than one heavy WebGL scene at a time.
- Don't use orange on body text or borders — only accent surfaces, CTAs, and the bounded "punchline orange" exception on hero display headings (see Hero variants → Punchline orange).
- Don't use brand orange for error states. Use `var(--color-error)` (#E5484D, a distinct red) — orange and red are too close in hue to read as separate semantics. Error red is reserved for destructive actions and invalid-input feedback only; never as a general accent.
- Don't darken tag chips on parent hover. Chips must always lift to a *lighter* surface when their host card hovers — light chips go to near-white, dark chips brighten toward white. Direction matters: chips pop forward as their host recedes.
- Don't auto-scope component variants by section type. Use explicit opt-in classes like `.on-light` instead of `.section-light .component` selectors — a light section may host dark inset cards whose children should keep dark styling. Anchor pills, tag chips, byline, and form controls all follow this rule.
- Don't apply the dotted-pattern background directly to a text element. Pattern on the wrapper; text uses a text-shadow stroke to punch through.
- Don't use text opacities below 75% for readable body copy, or below 60% for utility labels.
- Don't place text directly over the WebGL field without a backdrop pill, contained card, or 85%+ opacity at minimum.
- Don't use `<div>` block elements for two-tone heading splits.
- Don't use a third "outlined" pill tab state. Two states only: filled (selected) and soft (unselected).
- Don't let `display-md` line-height drop below 1.15.
- Don't omit `!important` on display line-height declarations.
- Don't write a custom GSAP word-reveal handler that uses `innerText`/`textContent` to rebuild the heading.
- Don't open a mega-menu without a hover bridge.
- Don't re-render the VideoDB wordmark in HTML/CSS — use the PNG.
- Don't write `videodb` in running prose (use `VideoDB`); the URL `videodb.io` keeps lowercase because it's a domain.
- Don't use emoji anywhere.
- Don't use `outline: none` without a replacement focus indicator.

---

## Guardrails (Non-negotiable structural DNA)

- The dual dark/light alternation is mandatory for any new section. Pick one and commit.
- The 1400px frame with vertical hairlines is non-negotiable structural DNA.
- Geist + JetBrains Mono are the only two typefaces — no third family.
- The orange `#F24E1E` is the single brand accent.
- The three dark tones (`#050505` / `#0A0A0A` / `#161616`) have non-overlapping roles.
- WebGL effects are dark-section-only and used at most once per page, with both top and bottom mask fades.
- All buttons are pills (`9999px`). All inline cards are 12px. Code blocks, mega-menu panels, and large interactive surfaces are 16px. Hero feature surfaces are 32px.
- Light sections always use the 2/10 column offset for content. No exceptions.
- Two-tone display headings always use single-text-run + `<br>` + `<span>`, never stacked blocks.
- Display class line-heights always carry `!important` to defeat Tailwind utility line-height bundles.
- Every section heading carries `js-reveal-text` for uniform entrance animation.
- The official wordmark PNG is the only correct rendering of the brand name in chrome.

---

## Implementation Notes

### Asset locations
- **Logos** — `assets/logos/wordmark-dark.png`, `wordmark-light.png`, `icon.png`, `square-dark.png`, `square-light.png`.
- **CSS tokens** — every color/spacing/radius/shadow listed above is exported as a CSS custom property and as a semantic class in `colors_and_type.css` (originally shipped in `Claude Design - VideoDB/videodb Design System Claude Design/colors_and_type.css`).
- **Icons** — Solar via Iconify CDN (`https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js`). For offline shipping, mirror from `https://api.iconify.design/solar:<icon>.svg`.

### Fonts
- **Geist** is loaded from Google Fonts CDN for the showcase and for production. URL: `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap`.
- **JetBrains Mono** is loaded from Google Fonts CDN. URL: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&display=swap`.
- The previously self-hosted `.woff2` files in `Claude Design - VideoDB/.../fonts/` had opaque Google-Fonts-style hashed filenames; the weight mapping (300 / 400 / 500) was a best guess and has been retired in favor of CDN delivery. If self-hosting is required later, re-download fresh files from the Geist GitHub release where filenames encode the weight.

### Stack assumptions
- Tailwind via CDN is supported but be aware of the heading-font and line-height bundle issues described above.
- GSAP + ScrollTrigger for the word reveal and typing code block.
- Three.js for the WebGL particle dome (r128 confirmed working).
- The system is mobile-responsive but desktop-first in its editorial cadence — the 2/10 offset collapses on `<md`, the WebGL keeps DPR ≤ 2, and the mega-menu hover bridge is desktop-only (tap navigates directly on mobile).
