# Architecture Decision Log — mx-prototype

A prototype for a future React app. Built with Cursor, deployed on Vercel.
This log records the decisions made before scaffolding, each with the choice
and the reasoning behind it. If a decision changes later, update this file —
it is the source of truth for "why is the project set up this way?"

---

## Decision 1: Scaffolding method — Untitled UI CLI (not manual install)

**Choice:** Scaffold with `npx untitledui@latest init --nextjs`, the official
Untitled UI CLI.

**Reasoning:** The CLI is built and maintained by the Untitled UI team
specifically for this stack (Next.js App Router + Tailwind CSS v4 + React
Aria). It creates the project with `theme.css` (the design tokens file),
`globals.css`, the Tailwind v4 PostCSS setup, dark-mode theming via
`next-themes`, and the base component utilities already wired together
correctly. A manual install would mean copying five-plus configuration steps
from the docs by hand, and any mistake (a wrong import order in CSS, a missing
PostCSS plugin) produces confusing styling bugs that are hard for a
non-developer to debug. Using the vendor's own scaffold means our setup
matches their documentation exactly, so every Untitled UI doc page and
component example "just works" without adaptation. There was no reason to
choose manual install; it exists for adding Untitled UI to an *existing*
project, which this is not.

---

## Decision 2: Package manager — npm

**Choice:** npm, exclusively. All commands in this repo are `npm install`,
`npm run dev`, `npm run build`.

**Reasoning:** Both npm and pnpm are installed on this machine, so this was a
genuine choice. npm wins for this project because it is the zero-configuration
default everywhere this project touches: it ships with Node.js, Vercel detects
and uses it automatically from `package-lock.json`, and virtually every
tutorial, Stack Overflow answer, and Untitled UI doc page shows npm commands
first — which matters when the person maintaining the repo is a designer
copy-pasting commands rather than a developer who can translate between
package managers. pnpm's advantages (disk space savings, stricter dependency
isolation) pay off in large monorepos, which this deliberately is not. The
constraint is consistency: `package-lock.json` is committed, and no
`pnpm-lock.yaml` or `yarn.lock` should ever appear in this repo.

---

## Decision 3: Icons — @untitledui/icons is primary, Phosphor supplements it

**Choice:** `@untitledui/icons` (free tier, 1,100+ line icons) is the default
icon set. `@phosphor-icons/react` (9,000+ icons, 6 weights) is installed as a
supplement, used **only** when Untitled UI lacks the icon needed.

**Reasoning:** Untitled UI's components are designed around their own icon
set — same stroke weight, same grid, same visual language as the Figma
library — so using it first keeps code visually consistent with the Figma
source of truth. But the free tier is line-style only and about 1,100 icons,
so gaps are inevitable in a real product (brand logos, domain-specific
symbols, filled variants). Phosphor is the supplement because its regular
weight is visually close to Untitled UI's line style (similar stroke, similar
minimalism), it is actively maintained, and both packages are tree-shakeable —
meaning the app only bundles the specific icons actually imported, so having
two icon packages installed costs nothing at runtime. **The rule for anyone
adding an icon: check `@untitledui/icons` first; reach for Phosphor only if
Untitled UI doesn't have it.** This is the "no duplicate icon set without a
stated reason" policy — the stated reason is coverage, not style preference.

---

## Decision 4: Tailwind v4 + brand colors — keep Untitled UI defaults for now, OKLCH when we customize

**Choice:** Ship the skeleton with Untitled UI's default `brand` color palette
untouched. When real brand colors are introduced later, define them in
`theme.css` in **OKLCH** format, replacing the `--color-brand-*` scale.

**Reasoning:** Tailwind v4 configures itself entirely in CSS (there is no
`tailwind.config.js` anymore — `theme.css` holds the design tokens as CSS
variables, similar to how Figma variables hold tokens). Untitled UI's default
palette is already defined and battle-tested, and this project has no final
brand colors yet — inventing placeholder ones now would just create tokens
that get thrown away. When brand colors do arrive, they should be authored in
OKLCH because that is the color space Tailwind v4's own default palette uses:
OKLCH is perceptually uniform, meaning a 50→950 shade ramp built in it has
visually even steps (the same reason Figma's newer color tools offer OKLCH).
Defining brand colors in hex next to a default palette in OKLCH would make the
ramps subtly inconsistent. The `--color-brand-*` variable names in `theme.css`
are the single place to swap; every component referencing `brand-500` etc.
updates automatically — exactly like changing a color variable in Figma.

---

## Decision 5: Deployment — Vercel via GitHub integration, no custom server

**Choice:** Deploy by connecting the GitHub repo to Vercel (the "Import
Project" flow on vercel.com), not via CLI uploads. No environment variables,
no `vercel.json`, no custom server code.

**Reasoning:** A stock Next.js App Router app is Vercel's first-class citizen:
Vercel detects the framework, runs `npm run build`, and deploys with zero
configuration. Connecting the GitHub repo (rather than pushing builds from a
laptop with the CLI) means every push to `main` auto-deploys to production and
every branch/PR gets its own preview URL automatically — which fits a
design-prototype workflow where you want a shareable link for every iteration.
This project intentionally has no database, no auth, and no API keys at this
stage, so there are no environment variables to manage. If that changes, the
variables get added in the Vercel dashboard and documented here.

---

## What was deliberately NOT added

- **No second component/primitives library** (no shadcn/ui, Radix, MUI,
  Chakra). Untitled UI is built on React Aria, which already provides
  accessible primitives (keyboard navigation, focus management, screen-reader
  behavior). Adding another would duplicate coverage and create two competing
  styling systems.
- **No monorepo tooling** (no Turborepo, Nx, workspaces). Single app, single
  `package.json`, conventional Next.js file layout.
- **No CSS-in-JS or extra styling systems.** Tailwind v4 + `theme.css` tokens
  only.
- **No state management library.** A prototype skeleton doesn't need one;
  React's built-ins suffice until proven otherwise.
