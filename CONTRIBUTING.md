# Contributing to EnerTask 🥕

Thanks for wanting to help the carrot march further. Here's how:

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/enertask.git
cd enertask
npm install
npm run dev
```

## Workflow

1. **Fork** the repo and create a branch from `main`:
   - `feat/short-name` for features
   - `fix/short-name` for bug fixes
   - `docs/short-name` for documentation
2. **Keep it client-side.** EnerTask's core promise is *zero backends, zero API keys, zero cost*. PRs that introduce required external services or secrets won't be merged — optional integrations must stay opt-in via bring-your-own-key adapters.
3. **Match the brand.** Colors live as tokens in `src/index.css` — use them, don't hard-code new hex values. Motion should feel like the mascot: bouncy, committed, 150–400ms.
4. **Run the checks** before pushing:
   ```bash
   npm run typecheck
   npm run build
   ```
5. Open a **pull request** with a clear description and, for UI changes, a screenshot or GIF.

## Code style

- TypeScript strict — no `any` unless unavoidable (and commented why)
- Functional components + hooks only
- Custom SVG icons in `src/components/Icons.tsx` (stroke-based, ink-colored) — no icon-library imports for core UI
- The mascot rig in `src/components/Mascot.tsx` is pose-data-driven — extend the `POSES` record rather than copy-pasting SVG

## Reporting issues

Open an issue with:
- What you did, what you expected, what happened
- Browser + OS
- A screenshot if it's visual

## Code of conduct

Be the carrot: bold, friendly, and moving forward. No harassment, no gatekeeping.
