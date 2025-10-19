# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the single-page AR marketing experience; keep hero copy and CTA structure intact when updating sections.
- `style.css` layers Tailwind utility imports with custom effects; treat it as the source stylesheet and regenerate compiled output before publishing if you use Tailwind CLI locally.
- `organic-particles-simple.js` owns the Three.js particle background; changes here should maintain the WebGL fallback logic for unsupported devices.
- `assets/` stores production-ready imagery; optimize additions (≤1 MB) and respect existing Japanese filenames used in markup.
- `CLAUDE.md` documents prior agent conversations—consult it before altering flows already discussed with stakeholders.

## Build, Test, and Development Commands
- Preview locally with `python3 -m http.server 8000` and open `http://localhost:8000/index.html` to verify layout and AR callouts.
- If you need Tailwind preprocessing, run `npx tailwindcss -i style.css -o style.bundle.css --watch` from the repo root and update the `<link>` tag to the generated file for manual QA.
- Use your preferred static-file server (e.g., `npx serve`) for cross-device testing; no bundler or package install is required for baseline edits.

## Coding Style & Naming Conventions
- HTML and JavaScript use 4-space indentation; CSS uses 2 spaces within rule blocks.
- Favor descriptive IDs/classes that match customer-facing terminology (e.g., `hero-text-enhanced`).
- Keep console diagnostics concise and emoji-prefixed to match the existing logging pattern in `organic-particles-simple.js`.
- Stick to ASCII in new source files; retain existing UTF-8 content where already present (product copy and asset names).

## Testing Guidelines
- Manually test in latest Chrome, Safari, and a mobile emulator to validate responsive sections and the WebGL fallback (`hero-static-bg`).
- Before shipping visual changes, capture Lighthouse performance and accessibility scores; note deltas ≥5 points in PRs.
- Exercise the AR CTA flow end-to-end, including QR code asset references and Instagram links, after each content update.

## Commit & Pull Request Guidelines
- Follow the repo convention: imperative, sentence-case commit subjects (e.g., `Improve hero particle density`).
- Each PR should describe motivation, summarize UI/UX changes, and attach before/after screenshots for visible updates.
- Link relevant issue or task IDs and list browsers/devices used during manual QA; flag any skipped checks explicitly.
