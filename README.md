# mx-prototype

A prototype for a future React app. Built with Cursor, deployed on Vercel.

## Stack

- [Next.js](https://nextjs.org) (App Router) — React framework
- [Untitled UI React](https://www.untitledui.com/react) — component library, built on React Aria
- [Tailwind CSS v4](https://tailwindcss.com) — styling; design tokens live in `src/styles/theme.css`
- [`@untitledui/icons`](https://www.npmjs.com/package/@untitledui/icons) — primary icon set
- [`@phosphor-icons/react`](https://phosphoricons.com) — supplemental icons, only for what Untitled UI lacks

See `ARCHITECTURE.md` for why each of these was chosen, and
`EXECUTION-LOG.md` for how the repo was scaffolded.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local dev server (hot-reloads as you edit) |
| `npm run build` | Production build — must pass before deploying |
| `npx untitledui@latest add` | Add more Untitled UI components interactively |

## Project layout

- `src/app/` — pages and layout (App Router)
- `src/components/` — Untitled UI components (base, application, foundations)
- `src/styles/` — `globals.css`, `theme.css` (design tokens), `typography.css`
- `src/providers/` — theme (dark mode) and router providers

This repo uses **npm only**. Do not add pnpm or yarn lockfiles.
