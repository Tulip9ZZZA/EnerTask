# EnerTask 🥕

> **Capture ideas. Manage tasks. Own the clock.** A productivity app with carrot-grade energy.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-FF8235?style=flat-square)](./LICENSE)
[![Build](https://img.shields.io/badge/build-passing-00A36C?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-1C1C1E?style=flat-square)](./CONTRIBUTING.md)
[![Made with React + Vite](https://img.shields.io/badge/React_18_+_Vite_6-61DAFB?style=flat-square&logo=react)]()

<pre>
      \ | /
       \|/
       .-.
      (o o)   ← the boss
       \_/
</pre>

</div>

EnerTask is a single-page productivity suite with a personality: a hand-rigged SVG mascot (the **Carrot Rebel**) that marches beside you during focus blocks, cheers when you clear your board, and lives across four poses — front, side-left, side-right, and back.

No accounts. No servers. No API keys. **Your data never leaves your browser.**

---

## ✨ Features

| Surface | What it does |
| --- | --- |
| **Today** | Daily dashboard — energy-charge meter, quick capture (`C` anywhere), up-next list, live stats, streak tracking |
| **Tasks** | Full task manager — priorities (low/med/high), tags, filters, animated check-off, "compost done" cleanup, progress bar |
| **Idea Garden** | Brain-dump capture (`Ctrl/⌘ + Enter`), starring, and one-click **promote-to-task** |
| **Focus Run** | Pomodoro timer (25 / 5 / 15 min) with an SVG progress ring — the mascot literally paces the track while the clock runs, with a chime + confetti on completion |

**Living details:** confetti harvests, speech-bubble commentary, session logging, daily streaks, toast feedback on every action, and full state persistence via `localStorage`.

---

## 🔒 Zero-Cost Architecture

This is the part you can flex in the README of any review:

- **No backend, no database, no API calls** — 100% client-side
- **No API keys anywhere in the codebase** (nothing to leak, nothing to rotate)
- **No environment variables required** — `npm install && npm run dev` and it works
- **No paid services** — fonts load from the public Google Fonts CDN, everything else is bundled
- State persists in the browser's `localStorage` under a single versioned key

> **Bring-your-own-key path:** if you fork this and want cloud sync later, the clean integration point is a storage adapter around the store (see `useStore` in `src/App.tsx`). Swap the `localStorage` read/write for Supabase/Firebase with *your own* keys — the UI layer doesn't change.

---

## 🚀 Quick Start

```bash
git clone https://github.com/Tulip9ZZZA/EnerTask.git
cd enertask
npm install
npm run dev        # → http://localhost:5173
```

Production build:

```bash
npm run build      # outputs static files to dist/ — deploy anywhere
npm run typecheck  # strict TypeScript check
```

Static hosting friendly: GitHub Pages, Netlify, Vercel, Cloudflare Pages — just point it at `dist/`.

---

## 🚢 Publish to GitHub (one command)

1. Create an **empty** repo named `enertask` on [github.com/new](https://github.com/new) — no README, no license checkbox; this repo brings its own.
2. Run the launch script from the project root:

```bash
chmod +x publish.sh
./publish.sh Tulip9ZZZA
```

The script inits git, commits everything, wires the remote, and pushes `main`. Git will ask you to authenticate once (browser SSO, PAT, or SSH).

**Then flip it open source + go live:**

- Repo → **Settings → General** → switch visibility to **Public**
- Repo → **Settings → Pages → Source: "GitHub Actions"**
- The included workflow (`.github/workflows/deploy.yml`) auto-builds on every push to `main` — your live demo lands at `https://Tulip9ZZZA.github.io/EnerTask/` in about a minute, and every future push redeploys it.

---

## 🧱 Tech Stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 (design tokens in `src/index.css`) |
| Animation | CSS keyframes + `canvas-confetti` |
| Type | Anton (display) · Space Grotesk (body) · JetBrains Mono (numerals) |

---

## 🎨 Brand System

The entire visual language is extracted from the mascot rig itself:

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#1C1C1E` | Body strokes, text, borders |
| `paper` | `#FAF9F6` | Canvas background |
| `carrot` | `#FF8235` | Primary action, accents |
| `carrot-deep` | `#D96820` | Pressed states, secondary accent |
| `leaf` / `leaf-bright` | `#00A36C` / `#00C888` | Success, growth, breaks |
| `mist` | `#E5E5EA` | Shadows, tracks, dividers |

**Motion vocabulary** (ported straight from the character's rig): arm swing, leg march, hat wobble, leaf sway, and dashed motion lines — reused for hover states, the focus timer, and transitions so the UI moves like the character does.

---

## 📁 Project Structure

```
├── index.html                  # entry, meta, fonts, favicon
├── src/
│   ├── main.tsx                # React root
│   ├── App.tsx                 # app shell, store, all four views
│   ├── index.css               # Tailwind + brand tokens + keyframes
│   └── components/
│       ├── Mascot.tsx          # the Carrot Rebel — 4-pose SVG rig
│       └── Icons.tsx           # hand-drawn stroke icon set + logo mark
├── .github/workflows/deploy.yml  # auto-deploy to GitHub Pages on push
├── publish.sh                  # one-command GitHub publish script
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

---

## 🗺️ Roadmap

- [ ] PWA / offline install
- [ ] Dark mode (tokens are already centralized)
- [ ] Optional cloud sync via bring-your-own-key Supabase adapter
- [ ] Keyboard-first navigation & shortcuts panel
- [ ] Export / import your data as JSON

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Short version: fork → branch → PR. Be kind, keep the carrot marching.

## 📄 License

[MIT](./LICENSE) — free to use, remix, and ship. Attribution appreciated, not enforced.
