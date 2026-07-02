<div align="center">

# 🧪 ChemMaster AI

**A JEE & board-exam chemistry revision platform.**
Interactive periodic table · chapter-wise notes · progress tracking · zero backend to manage.

Built with Next.js 15 (App Router) + Tailwind CSS · deploys on Vercel in one click · no API keys, no database to provision.

</div>

---

## Contents

- [What this is](#what-this-is)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Deploying on Vercel](#deploying-on-vercel)
- [Project structure](#project-structure)
- [How data & state work](#how-data--state-work)
- [API reference](#api-reference)
- [Design system](#design-system)
- [Extending the app](#extending-the-app)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)

---

## What this is

ChemMaster AI is a focused, working slice of a much larger vision: an
offline-friendly, AI-flavored chemistry learning platform for Class 11,
Class 12, JEE Main, and JEE Advanced students. This build covers three
pillars end-to-end — a **dashboard**, a **fully interactive periodic
table**, and **complete chapter notes for both years** — rather than
spreading effort thin across many half-finished modules. See
[Roadmap](#roadmap) for what's deliberately not here yet.

Every page in this repo renders real content and has been build-tested
and boot-tested; there are no placeholder screens.

## Features

### 📊 Dashboard (`/`)
- Study streak, total XP, chapters completed, and bookmark count
- A quote of the day and a daily "identify the element" challenge
- Recent activity feed and a "suggested next chapter" list based on what
  you haven't completed yet

### 🧪 Interactive Periodic Table (`/periodic-table`)
- All **118 elements** with real data: atomic number & mass, period,
  group, block, electronic configuration, oxidation states, valency,
  discoverer & year, common uses, and a fact
- **Search** by name or symbol, **filter** by category (alkali metal,
  halogen, noble gas, transition metal, lanthanide, actinide, etc.)
- **Browse mode** — click any tile for a full inspector panel
- **Comparison mode** — any two elements side by side, field by field
- **Flashcard mode** — flip-to-reveal drilling, respects your current
  filters
- **Quiz mode** — auto-generated multiple choice from your filtered
  selection, awards XP for correct answers
- Per-element **bookmarking**

### 📘 Class 11 & 12 Notes (`/notes/class-11`, `/notes/class-12`)
- All **29 NCERT chapters** across both years
- Each chapter: key concepts, key formulae, and memory tricks
- Searchable, with per-chapter **completion tracking** (awards XP) and
  **bookmarking**
- A live progress bar per class level

### 🎨 Theming
- Dark / light mode toggle, persisted per browser

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 18 + Tailwind CSS |
| Data | Static JSON (`lib/data/`), served via API routes |
| State | Browser `localStorage` (see below) |
| Fonts | Space Grotesk, IBM Plex Sans, IBM Plex Mono (loaded via `<link>`, not `next/font`) |
| Hosting | Vercel (or any Node ≥18.18 host) |

No OpenAI, Gemini, Claude, Groq, HuggingFace API, Firebase, or Supabase
calls anywhere in this codebase.

## Quick start

Requires **Node.js 18.18+**.

```bash
git clone <this-repo>
cd chemmaster-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # next lint
```

## Deploying on Vercel

**Via GitHub (recommended):**
1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js. Click **Deploy** — no environment
   variables, no build config, no database setup required.

**Via CLI:**
```bash
npm install -g vercel
vercel
```

Every subsequent `git push` to your default branch redeploys
automatically.

## Project structure

```
chemmaster-web/
├── app/
│   ├── layout.js                 # Root layout: fonts, sidebar shell, providers
│   ├── globals.css               # Design tokens & Tailwind base layer
│   ├── page.js                   # Dashboard ("/")
│   ├── periodic-table/
│   │   └── page.js               # Periodic table page (all 4 modes)
│   ├── notes/
│   │   ├── class-11/page.js
│   │   └── class-12/page.js
│   └── api/
│       ├── elements/route.js     # GET /api/elements?search=&category=
│       └── notes/route.js        # GET /api/notes?class=&search=
├── components/
│   ├── Sidebar.js                # Nav, student stats, theme toggle
│   ├── UI.js                     # Card, Card2, Metric, Chip, PageHeader
│   ├── ElementGrid.js            # CSS-grid periodic table layout
│   ├── ElementDetailPanel.js     # Inspector panel for selected element
│   ├── ComparisonMode.js
│   ├── FlashcardMode.js
│   ├── QuizMode.js
│   ├── ChapterCard.js            # Single collapsible chapter card
│   └── NotesView.js              # Shared list view for both class levels
├── lib/
│   ├── store.js                  # Client state: theme, XP, streak, bookmarks, progress
│   ├── categoryColors.js         # Flame-test color mapping
│   └── data/
│       ├── elements.json         # 118-element dataset
│       └── notes.json            # 29-chapter dataset
├── public/
│   └── robots.txt
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── jsconfig.json                 # "@/" import alias
└── package.json
```

## How data & state work

This matters because it's the main structural difference from a typical
full-stack app, and it's *why* this deploys cleanly on Vercel:

**Content data is static and read-only.** `lib/data/elements.json` and
`lib/data/notes.json` are bundled with the app and served through
`app/api/elements/route.js` and `app/api/notes/route.js`. These routes
just filter and return JSON — no writes, no external calls, so they work
fine as Vercel serverless functions.

**Per-student state lives in the browser**, not a database. XP, streak,
coins, bookmarks, chapter completion, and theme are all managed in
`lib/store.js` via a React context (`AppStateProvider`) backed by
`localStorage`. Why not SQLite, like the original prototype used?
Vercel's serverless functions don't have a persistent, writable
filesystem — a SQLite file would silently reset on every cold start or
redeploy. `localStorage` sidesteps that with zero infrastructure, at the
cost of state being per-browser rather than synced across devices.

If you later want cross-device sync, swap the internals of
`lib/store.js` for calls to a hosted database (Vercel Postgres, Supabase,
etc.). The exported functions — `toggleBookmark`, `setProgress`, `addXp`,
`logActivity`, `toggleTheme` — are the seam to do that without touching
any component.

## API reference

### `GET /api/elements`

| Query param | Type | Description |
|---|---|---|
| `search` | string | Matches against element name or symbol (case-insensitive) |
| `category` | string | Exact match against category, e.g. `Noble Gas`, `Halogen` |

```bash
curl "https://your-app.vercel.app/api/elements?search=oxy"
# { "count": 1, "elements": [{ "atomic_number": 8, "symbol": "O", ... }] }
```

### `GET /api/notes`

| Query param | Type | Description |
|---|---|---|
| `class` | string | `"Class 11"` or `"Class 12"` |
| `search` | string | Matches chapter title or key concepts |

```bash
curl "https://your-app.vercel.app/api/notes?class=Class%2011"
# { "count": 13, "notes": [{ "chapter": "Some Basic Concepts of Chemistry", ... }] }
```

## Design system

The visual identity is deliberately grounded in chemistry rather than a
generic dashboard template:

- **Palette** — accent colors are drawn from real flame-test chemistry
  (`flame-crimson` ≈ lithium, `flame-gold` ≈ sodium, `flame-copper` ≈
  copper, `flame-violet` ≈ potassium), and the same set doubles as the
  periodic table's category coding — see `lib/categoryColors.js`.
- **Typography** — Space Grotesk for display headings, IBM Plex Sans for
  body text, and IBM Plex Mono as a signature face for anything that's
  chemistry *notation* (atomic numbers, electron configurations,
  formulae) — reflecting that this data is naturally monospace-shaped.
- **Surfaces** — `ink` (dark) / `paper` (light) base tokens with two
  card elevations (`.surface`, `.surface-2`) defined in
  `app/globals.css`.

Full token definitions live in `tailwind.config.js` (`colors.ink`,
`colors.paper`, `colors.flame`, `fontFamily`) and `app/globals.css`.

## Extending the app

**Add or edit elements / notes** — edit the JSON files directly in
`lib/data/`. No migration step needed; the API routes and pages read the
files at request/build time.

**Add a new page** — follow the pattern in `app/notes/class-11/page.js`:
a thin page file that renders a shared component, so class-11 and
class-12 stay in sync by construction.

**Add a new API route** — follow `app/api/elements/route.js`: import the
JSON, filter by query params, return `NextResponse.json(...)`.

**Add a new piece of student state** (e.g. a new stat) — add a field to
`DEFAULT_STATE` in `lib/store.js`, then a getter/setter following the
existing pattern (`addXp`, `setProgress`, etc.), then consume it via
`useAppState()` in any client component.

## Roadmap

Transparently, the full original vision included ~20 modules (practice
question bank, smart test generator, an offline AI doubt solver, a PYQ
database, an ML-based recommendation engine, analytics dashboards,
gamification/leaderboards, a formula book, reaction library, mechanism
visualizer, exam predictor, global search, and more). None of those are
in this build. The architecture — API route + JSON data pattern, the
`lib/store.js` state seam, shared components like `NotesView` — is set
up so each of those can be added the same way, as a genuinely working
feature rather than a stub.

## Troubleshooting

**Fonts don't load in a restricted/offline dev environment.** Fonts are
loaded via `<link>` tags to Google Fonts in `app/layout.js` (not
`next/font`), specifically so the *production build* never depends on
network access. In the browser, if you're fully offline, fonts will fall
back to the system sans-serif/monospace stack — the app remains fully
functional.

**My progress/XP reset.** State lives in `localStorage` per browser
(see [How data & state work](#how-data--state-work)). Clearing site data,
using a different browser, or private/incognito mode will not carry
state over.

**`npm run build` fails with a font fetch error.** This shouldn't happen
with the current `app/layout.js` (which avoids `next/font`), but if
you've modified it to use `next/font/google`, that fetches font files
*during the build*, which fails without network access. Revert to
`<link>` tags or ensure the build environment has internet access.
