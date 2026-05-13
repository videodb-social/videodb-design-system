#!/usr/bin/env python3
"""
lint-font-sizes.py — enforce the v1.8+ 11px microcopy floor in the showcase.

The spec rule (videodb-design.md, mono-xs token, v1.8 onwards):

    No microcopy below 11px sitewide.

This script scans homepage-showcase.html for any `font-size: Xpx` declaration
where X is below 11, and fails (exit 1) if it finds any. Declarations inside
the Review Mode CSS block are ignored — that block is stripped from the
production build by `scripts/build-vercel.py`, so its font-sizes never ship.

Run before publishing:

    python3 scripts/lint-font-sizes.py

Or wire it into the pre-publish checklist in CLAUDE.md.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_HTML = ROOT / "homepage-showcase.html"

# Sentinel comments that bound the Review Mode CSS block. Everything between
# the opener and the closer is ignored — see build-vercel.py's strip rule.
REVIEW_OPENER = re.compile(
    r"/\* =+\s*\n\s*Review Mode \(\?review=1\)", flags=re.MULTILINE
)
REVIEW_CLOSER = re.compile(
    r"End of Review Mode CSS[\s\S]*?\*/", flags=re.MULTILINE
)

# Match `font-size: Npx` where N is 1–10 (single-digit) — the floor is 11.
SUBELEVEN = re.compile(r"font-size:\s*([1-9]|10)px\b")


def main() -> int:
    if not SRC_HTML.exists():
        print(f"✗ Source HTML not found at {SRC_HTML}", file=sys.stderr)
        return 2

    html = SRC_HTML.read_text()

    # Carve out the Review Mode CSS block so its declarations are ignored.
    opener = REVIEW_OPENER.search(html)
    closer = REVIEW_CLOSER.search(html, opener.end() if opener else 0)

    if opener and closer:
        before = html[: opener.start()]
        after = html[closer.end() :]
        # Reassemble with a placeholder so line numbers stay roughly stable
        # for the post-Review portion.
        scanned = before + "\n" + after
        scanned_offset_after = closer.end() - opener.start()
    else:
        scanned = html
        scanned_offset_after = 0

    violations = []
    for match in SUBELEVEN.finditer(html):
        # Skip anything inside the Review Mode block.
        if opener and closer and opener.start() <= match.start() < closer.end():
            continue
        # Compute 1-based line number for the original file.
        line_no = html.count("\n", 0, match.start()) + 1
        # Grab the line text for context.
        line_start = html.rfind("\n", 0, match.start()) + 1
        line_end = html.find("\n", match.end())
        line_text = html[line_start:line_end].strip()
        violations.append((line_no, match.group(0), line_text))

    if violations:
        print(
            f"✗ {len(violations)} sub-11px font-size declaration"
            f"{'s' if len(violations) != 1 else ''} found in {SRC_HTML.name}:",
            file=sys.stderr,
        )
        for line_no, decl, line_text in violations:
            print(f"  L{line_no:>5}: {decl}    {line_text[:120]}", file=sys.stderr)
        print(
            "\nSpec rule (videodb-design.md, v1.8+): no microcopy below 11px sitewide.\n"
            "Either bump these to 11px, or move them inside the Review Mode CSS\n"
            "block (which is stripped from the production build).",
            file=sys.stderr,
        )
        return 1

    print(f"✓ {SRC_HTML.name} clean — no sub-11px font-sizes outside the Review Mode block.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
