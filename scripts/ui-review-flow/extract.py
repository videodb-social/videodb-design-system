#!/usr/bin/env python3
"""
extract.py — pull the review-mode CSS and JS out of any source HTML that
contains the canonical markers, into standalone reusable files.

Markers it searches for (added when the review flow was first authored):
  • CSS block opener:   '/* ============... \n   Review Mode (?review=1) ...'
  • JS block opener:    '<script>\n  /* ============... \n     Review Mode — activated only via ?review=1 ...'

By default, reads ../../homepage-showcase.html and writes:
  review-mode.css
  review-mode.js
to this folder. Use --source PATH to point at a different showcase file.
"""

import argparse
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_SOURCE = HERE.parent.parent / "homepage-showcase.html"

CSS_RE = re.compile(
    r"(/\* =+\n\s*Review Mode \(\?review=1\)[\s\S]*?)(?=\n</style>)",
    flags=re.MULTILINE,
)
SCRIPT_RE = re.compile(
    r"<script>\s*\n(/\* =+\s*\n\s*Review Mode — activated only via \?review=1[\s\S]*?)</script>",
    flags=re.MULTILINE,
)


def extract(source: Path):
    html = source.read_text()

    css_m = CSS_RE.search(html)
    if not css_m:
        sys.exit("ERROR: could not locate the review-mode CSS block in source.")
    js_m = SCRIPT_RE.search(html)
    if not js_m:
        sys.exit("ERROR: could not locate the review-mode <script> block in source.")

    css = css_m.group(1).rstrip() + "\n"
    js = js_m.group(1).rstrip() + "\n"

    (HERE / "review-mode.css").write_text(css)
    (HERE / "review-mode.js").write_text(js)

    return len(css.splitlines()), len(js.splitlines())


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help=f"Source HTML to extract from (default: {DEFAULT_SOURCE.relative_to(HERE.parent.parent)})",
    )
    args = p.parse_args()

    if not args.source.exists():
        sys.exit(f"ERROR: source HTML not found: {args.source}")

    css_lines, js_lines = extract(args.source)
    print(f"✔ Extracted review flow from {args.source.name}")
    print(f"  review-mode.css  ({css_lines} lines) → {HERE}/review-mode.css")
    print(f"  review-mode.js   ({js_lines} lines) → {HERE}/review-mode.js")


if __name__ == "__main__":
    main()
