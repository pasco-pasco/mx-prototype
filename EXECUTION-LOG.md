# Execution Log — mx-prototype scaffold

Date: July 1, 2026
Every command run and file touched during initial scaffolding, in order.

## 1. Pre-flight checks (nothing modified)

| Command | Result |
|---------|--------|
| `node --version` / `npm --version` / `pnpm --version` | Node v22.17.1, npm 10.9.2, pnpm 10.26.1 (npm chosen — see ARCHITECTURE.md Decision 2) |
| `gh auth status` | Logged in as `pascalchenier` |
| `gh repo view pasco-pasco/mx-prototype` | Repo exists, public, **empty** — no repo creation needed |

## 2. ARCHITECTURE.md written first

- **File created:** `ARCHITECTURE.md` (decision log, 5 decisions)
- Paused for user confirmation before proceeding. User confirmed:
  proceed with scaffold; Vercel will be connected via dashboard by the user.

## 3. Scaffold

| Command | What it did |
|---------|-------------|
| `npx untitledui@latest init tmp-scaffold --nextjs --yes` | Official Untitled UI CLI (v0.1.64) scaffolded a Next.js project with Tailwind v4, theme.css, and the full free component set into `tmp-scaffold/` |
| `rsync -a tmp-scaffold/ ./ --exclude node_modules --exclude .git` | Moved scaffold files to the repo root (CLI can't scaffold into an existing non-empty directory) |
| `rm -rf .git tmp-scaffold bun.lockb` | Removed the starter kit's own git history, the temp folder, and the bun lockfile (we are npm-only; `package-lock.json` is the one lockfile) |
| `npm cache clean --force` + `rm -rf node_modules` | Recovered from a "no space left on device" error mid-install (npm cache was 3.8 GB); clean reinstall afterward |
| `npm install` | Installed all dependencies fresh with npm |

## 4. Dependency changes

| Command | Why |
|---------|-----|
| `npm install next@16.2.10` | The starter pinned Next.js 16.2.0, which had known security advisories (`npm audit` flagged 1 high + 1 moderate). 16.2.10 is the patched release in the same minor line. |
| `npm install @phosphor-icons/react` | Supplemental icon set (ARCHITECTURE.md Decision 3) — v2.1.10 |
| `npm install -D @react-types/overlays` | Build fix: `nav-account-card.tsx` (starter kit component) imports a type from this package but the starter didn't declare it. Types-only, dev dependency, zero runtime cost. |
| `npm install react-aria-components@1.16.0 react-aria@3.47.0 --save-exact` | Build fix: npm resolved `^1.16.0` to 1.19.0, which introduced a type change that breaks the starter kit's `calendar.tsx`. Pinned to the exact versions the starter kit was written against. Unpin when Untitled UI ships updated components. |

## 5. Files touched (beyond the untouched scaffold)

| File | Change |
|------|--------|
| `ARCHITECTURE.md` | Created (before anything else) |
| `EXECUTION-LOG.md` | Created (this file) |
| `src/app/home-screen.tsx` | Rewrote as the smoke-test page: Untitled UI `BadgeWithDot` + `Button`, Untitled UI icons (`CheckCircle`, `ArrowRight`), Phosphor icon (`Sparkle`) |
| `src/app/layout.tsx` | Updated `metadata` title/description from starter-kit defaults to mx-prototype |
| `package.json` | Renamed package from `untitledui-nextjs-starter-kit` to `mx-prototype`; dependency changes listed above |
| `README.md` | Replaced starter-kit boilerplate with project-specific readme |

Kept as-is from the scaffold: `src/styles/globals.css`, `src/styles/theme.css`,
`src/styles/typography.css` (the token wiring — deliberately untouched),
all of `src/components/`, `src/providers/`, `src/hooks/`, `src/utils/`,
`next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `.prettierrc`,
`CLAUDE.md` (starter kit's AI-agent guidance — useful in Cursor too).

## 6. Validation

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Zero errors (after the two dependency fixes above), all routes static |
| `npm run dev` + browser check at localhost:3000 | ✅ Smoke-test page renders: badge, heading, both icon sets, button |
| Second headless/component library installed? | ❌ None — React Aria (bundled with Untitled UI) is the only primitives layer |
| Duplicate icon set without stated reason? | ❌ Phosphor's role is documented in ARCHITECTURE.md Decision 3 |

## 7. Git

| Command | What it did |
|---------|-------------|
| `git init -b main` | Fresh repository, `main` as default branch |
| `git remote add origin git@github.com:pasco-pasco/mx-prototype.git` | Pointed at the existing empty GitHub repo |
| `git add -A` + `git commit` | Initial commit of the full skeleton |
| `git remote set-url origin https://github.com/pasco-pasco/mx-prototype.git` | SSH push was rejected (no SSH key for this account); switched to HTTPS which uses the GitHub CLI login |
| *(pause)* | First push attempt returned 403: the logged-in account `pascalchenier` had read-only access to `pasco-pasco/mx-prototype`. Stopped and asked the user, who added `pascalchenier` as a collaborator with write access. |
| `git rm -r .github` + commit | Second push attempt was rejected because the starter kit's bundled GitHub Actions workflow (`sync-components.yml`, an optional component-update automation) requires a token with `workflow` scope, which this machine's login doesn't have. Removed it — not needed for the skeleton. |
| `git push -u origin main` | ✅ Pushed — `main` created on GitHub with both commits |

## 8. Vercel (handed to user)

Per user decision: connect the repo at vercel.com → Add New Project →
Import `pasco-pasco/mx-prototype` → Deploy. No env vars, no custom
settings needed — Vercel auto-detects Next.js and `npm`.
