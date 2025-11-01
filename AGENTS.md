# Repository Guidelines

## Project Structure & Module Organization
- `index.html` — single-page experience for the AR marketing landing site.
- `style.css` — layered Tailwind imports plus custom effects; treat as the source stylesheet.
- `organic-particles-simple.js` — Three.js particle background with WebGL fallback logic.
- `assets/` — production-ready imagery (≤1 MB, many filenames in Japanese); respect existing naming.
- `CLAUDE.md` — historical agent conversation notes; check before changing agreed flows.

## Build, Test, and Development Commands
- `python3 -m http.server 8000` — serve the site locally at `http://localhost:8000/index.html`.
- `npx tailwindcss -i style.css -o style.bundle.css --watch` — compile Tailwind utilities when iterating on styles; swap the `<link>` tag to the bundle for manual QA.
- Use any static-file server (e.g., `npx serve`) for cross-device testing; no bundler required for baseline edits.

## Coding Style & Naming Conventions
- HTML/JavaScript: 4-space indentation. CSS: 2 spaces inside rules.
- Prefer descriptive classes that match customer-facing language (`.hero-text-enhanced`, `.btn-primary-alt`).
- Console diagnostics in JavaScript should stay concise and emoji-prefixed, mirroring existing logs.
- Keep new source files ASCII; retain UTF-8 text where already present (marketing copy, asset names).

## Testing Guidelines
- Manual smoke test in latest Chrome, Safari, and a mobile emulator; verify the WebGL fallback (`hero-static-bg`) and AR CTA flow end-to-end.
- Run Lighthouse before shipping visual changes; highlight perf/accessibility deltas ≥5 points in PRs.
- After content updates, scan QR/Instagram links and confirm AR entry points remain valid.

## Commit & Pull Request Guidelines
- Commit messages use imperative, sentence-case subjects (e.g., `Improve hero particle density`).
- Pull requests should explain motivation, summarize UI/UX changes, attach before/after screenshots for visual updates, link relevant issues, and list browsers/devices tested; call out skipped checks explicitly.

## Agent Tips
- Preserve existing IDs and Tailwind utility patterns to avoid breaking animations or CTA tracking.
- Before heavy refactors, skim `CLAUDE.md` for stakeholder constraints.
- Treat `.DS_Store` changes as noise—restore them before committing.
