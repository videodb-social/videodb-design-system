#!/usr/bin/env python3
"""
build-vercel.py — produce a clean, production-ready copy of the showcase
for Vercel deployment.

Strips:
  • The Review Mode CSS block (between the "Review Mode" comment opener
    in the <style> block and the closing </style>).
  • The Review Mode <script> block (the second <script> in the file,
    which contains the IIFE gated by ?review=1).

Outputs:
  vercel-deploy/
    ├── design-system.html      ← stripped, retitled
    ├── assets/logos/*.png      ← copied from source
    └── vercel.json             ← cleanUrls + / → /design-system redirect

Run from the project root:
  $ python3 scripts/build-vercel.py
"""

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_HTML = ROOT / "homepage-showcase.html"
DEPLOY = ROOT / "vercel-deploy"
SRC_ASSETS = ROOT / "assets"

VERCEL_JSON = """{
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/", "destination": "/design-system", "permanent": false }
  ]
}
"""

def strip_review_css(html: str) -> str:
    """
    Remove the Review Mode CSS block from inside <style>...</style>.

    The block starts at the comment '/* ==... Review Mode (?review=1) ...'
    and ends at the matching sentinel comment
    '/* ==... End of Review Mode CSS ... */' — NOT at '</style>'. Earlier
    versions terminated at '</style>' which silently consumed any component
    CSS that lived between the Review Mode block and the closing tag —
    including the v1.6 card additions (.note-card, .build-card,
    .research-card) added after Review Mode was authored. The sentinel
    makes the strip range explicit and self-documenting.
    """
    pattern = re.compile(
        r"\n\s*/\* =+\s*\n\s*Review Mode \(\?review=1\)[\s\S]*?End of Review Mode CSS[\s\S]*?\*/",
        flags=re.MULTILINE,
    )
    new, n = pattern.subn("\n", html, count=1)
    if n != 1:
        raise RuntimeError(
            "Could not locate the Review Mode CSS block (expected exactly 1 match). "
            "Check that the '/* ... End of Review Mode CSS ... */' sentinel still "
            "exists in homepage-showcase.html immediately after the Review Mode block."
        )
    return new


def strip_review_script(html: str) -> str:
    """
    Remove the entire <script>...</script> block that contains the
    Review Mode IIFE (identified by the 'Review Mode — activated only via ?review=1' comment).
    """
    pattern = re.compile(
        r"\n<script>\s*/\* =+\s*\n\s*Review Mode — activated only via \?review=1[\s\S]*?</script>\n",
        flags=re.MULTILINE,
    )
    new, n = pattern.subn("\n", html, count=1)
    if n != 1:
        raise RuntimeError(
            "Could not locate the Review Mode <script> block (expected exactly 1 match)."
        )
    return new


def retitle(html: str) -> str:
    """Update the <title> for the production deploy."""
    return html.replace(
        "<title>VideoDB — Component Showcase</title>",
        "<title>VideoDB — Design System</title>",
        1,
    )


def main():
    assert SRC_HTML.exists(), f"Source HTML not found: {SRC_HTML}"
    assert SRC_ASSETS.exists(), f"Assets dir not found: {SRC_ASSETS}"

    html = SRC_HTML.read_text()
    src_lines = len(html.splitlines())

    html = strip_review_css(html)
    html = strip_review_script(html)
    html = retitle(html)

    out_lines = len(html.splitlines())
    saved = src_lines - out_lines

    # Build into the deploy folder. **In-place update** — never `rmtree` the
    # whole folder because Vercel keeps `.vercel/project.json` (its project
    # link) here, plus `.env.local` and `.gitignore`. Wiping the folder
    # disconnects the project from `vercel --prod`. Instead: overwrite the
    # files we own; refresh the assets folder only.
    DEPLOY.mkdir(parents=True, exist_ok=True)

    (DEPLOY / "design-system.html").write_text(html)
    (DEPLOY / "vercel.json").write_text(VERCEL_JSON)

    # Refresh assets/ — remove + recopy only the assets subtree
    assets_dst = DEPLOY / "assets"
    if assets_dst.exists():
        try:
            shutil.rmtree(assets_dst)
        except PermissionError as e:
            # Some sandboxes can't delete protected files inside the deploy
            # folder. If assets haven't changed since the last build this
            # is harmless — skip and let the existing copy stand.
            print(f"  (skipped assets refresh: {e})")
        else:
            shutil.copytree(SRC_ASSETS, assets_dst)
    else:
        shutil.copytree(SRC_ASSETS, assets_dst)

    print(f"✔ Built → {DEPLOY.relative_to(ROOT)}/")
    print(f"  design-system.html   ({out_lines} lines, stripped {saved} review-mode lines)")
    print(f"  assets/              (copied verbatim)")
    print(f"  vercel.json          (cleanUrls + / → /design-system redirect)")
    print()
    print(f"To deploy:")
    print(f"  cd {DEPLOY.relative_to(ROOT)}")
    print(f"  vercel --prod")


if __name__ == "__main__":
    main()
