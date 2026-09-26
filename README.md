# System Panel 2026

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Admin panel **template** built with React 19, TypeScript, Vite and Tailwind CSS 4.
It ships with a personal workspace home, a mail center, an AI assistant, a
support center with knowledge base, API key management, an RBAC console, a task
workspace (board / list / timeline / calendar), a planning grid, a BPMN-style
process designer, account settings, error and maintenance pages and a UI
component catalog — all running on mock data, so you can clone it and plug in
your own backend.

🇪🇸 [Versión en español](README.es.md)

---

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | >= 20.19 (developed on 24.x) |
| pnpm | 10.x (`corepack enable pnpm`) |

npm or yarn work too, but the lockfile is `pnpm-lock.yaml`.

## Quick start

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm dev
```

The dev server prints a local URL (Vite defaults to `http://localhost:5173`).
Any email + password gets you in — login is mocked and just writes a token to
`localStorage`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server with HMR |
| `pnpm build` | Type-check (`tsc -b`) then production build into `dist/` |
| `pnpm preview` | Serve the built `dist/` locally |
| `pnpm lint` | ESLint over the whole project |

Two helper scripts regenerate the planning icon set:

```bash
node scripts/generate-planning-icons.mjs
```

```bash
node scripts/rasterize-planning-icons.mjs
```

## Configuration

All template-level settings live in one place: [`src/config/app.config.ts`](src/config/app.config.ts),
backed by environment variables declared in [`.env.example`](.env.example).

| Variable | Default | Used for |
| --- | --- | --- |
| `VITE_APP_NAME` | `System Panel 2026` | Application name |
| `VITE_APP_ORGANIZATION` | `Mi Organizacion` | Organization shown in the dashboard sidebar |
| `VITE_APP_LOCATION` | `Sede principal` | Location shown in the dashboard sidebar |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Base URL for `src/services/http.ts` |
| `VITE_SUPPORT_EMAIL` / `_PHONE` / `_HOURS` | sample values | Support channels (support center, 403 and error pages) |
| `VITE_MAINTENANCE_MODE` | `false` | `true` replaces the whole app with the maintenance page |
| `VITE_MAINTENANCE_MESSAGE` / `_UNTIL` | empty | Optional message and estimated end (ISO 8601) |
| `VITE_STATUS_PAGE_URL` | empty | Optional link to your status page |

> Everything prefixed with `VITE_` is inlined into the browser bundle. Never put
> secrets there.

## Project structure

Pages are grouped exactly like the navigation: `src/pages/<section>/<module>/`.
Every module follows the same split: the page composes presentational
components, a hook (`hooks/useX.ts`) owns state and actions, and a service in
`src/services/<domain>/` owns business rules and persistence.

```
src/
├── app/                     App shell, error boundary
├── routes/                  Route table (lazy) + role-based route guard
├── navigation/              Module registry, queries, quick actions
├── config/app.config.ts     Single configuration entry point
├── context/                 Theme, account and workspace providers
├── services/                Per-domain services (mail, support, api-keys, assistant,
│                            knowledge-base, account, workspace, process, rbac…)
├── components/
│   ├── common/              Shell, sidebar, navbar, command palette, layouts,
│   │                        drawer, confirm dialog, markdown, attachments
│   └── ui/                  Buttons, inputs, switch, segmented control, table,
│                            charts, badge, alert, avatar, empty state, tones
├── pages/
│   ├── workspace/           Home, modules, favorites, recent activity
│   ├── operations/          Tasks, planning, processes, documents, gantt
│   ├── communication/       Mail center, AI assistant, support center
│   ├── administration/      API keys, users, roles (RBAC), audit log
│   ├── help/                Knowledge base, documentation, UI catalog
│   ├── account/             Profile, preferences, security
│   ├── system/              404, 403, 500 and maintenance pages
│   └── auth/                Login
├── utils/                   Small shared helpers (cn, format, attachments, text)
└── css/
    ├── theme.css            Design tokens (light + dark), the single source of truth
    ├── components.css       Reusable classes: card, eyebrow, page-title…
    └── styles.css           Tailwind entry, base layer, third-party bridges
```

## Modules

| Section | Module | Route | Highlights |
| --- | --- | --- | --- |
| Workspace | Home, Modules, Favorites, Recent activity | `/dashboard`, `/workspace/*` | Favorites per user, visit history, usage charts |
| Communication | Mail | `/mail/:folder` | Inbox, starred, sent, drafts, archive, trash; threads; compose, reply, reply all, forward; search, filters, labels, attachments |
| Communication | AI assistant | `/assistant` | Multiple conversations, search, pin, rename; streaming Markdown with highlighted code; copy, regenerate, stop; attachments |
| Communication | Support center | `/support/*` | Tickets with status tracking, priority, category, assignment, internal notes, attachments; knowledge base; contact page with response targets |
| Administration | API keys | `/admin/api-keys` | Generate or register, rotate, revoke, activate/deactivate, scopes, expiration, usage, audit trail |
| Administration | Users, Roles, Audit | `/users`, `/superuser/rbac/*` | RBAC console |
| Help | Knowledge base, Documentation | `/help/*`, `/playground` | Accent-insensitive search, article feedback, template guide, UI catalog |
| Account | Profile, Preferences, Security | `/account/*` | Theme (light/dark/system), notifications, password, 2FA, sessions, security log |

### API key security

- The full key is shown **once**, masked until revealed, and the dialog only
  closes after the user confirms it was stored.
- Storage keeps a SHA-256 hash, the prefix and the last four characters —
  lists and details only ever show `sk_live_••••••••••••a1B2`.
- Rotation issues a new secret for the same key and invalidates the old one
  immediately; revocation is permanent.
- Every action (create, register, edit, (de)activate, rotate, revoke, copy) is
  written to the key's audit trail and to the actor's security log.

### Status pages and permissions

`requiredRoles` in the navigation registry drives access everywhere: the module
disappears from the sidebar, palette and home, and `ModuleAccessGuard` answers
**403** if its URL is opened directly (with a "contact support" action that
prefills a ticket). Unknown routes show **404** with search and suggestions.
Render errors are caught by `AppErrorBoundary`, which shows **500** with a
copyable reference (`ERR-YYYYMMDD-XXXXXX`) that can be attached to a ticket.
`VITE_MAINTENANCE_MODE=true` shows the **maintenance** page instead of the app
(preview it at `/maintenance`).

### AI engine

The assistant depends on the `AssistantEngine` contract in
[`assistantEngine.ts`](src/services/assistant/assistantEngine.ts). The template
ships a local simulation; to use a real model, implement the contract against
**your backend**, which holds the model credentials. Never call a model provider
with a key from the browser.

## How the home dashboard works

The home is a **personal workspace**, not a grid of static cards. In order of
priority it shows the user's favorite modules, the recently visited pages,
quick actions, system information, usage analytics and, last, the full catalog.
Favorites and quick actions are ordered by how often the user opens each module.

### One navigation registry

[`src/navigation/modules.ts`](src/navigation/modules.ts)
is the single source of navigation. The sidebar, the command palette, the home,
the RBAC sub-navigation and the activity tracking all read it through
[`navigation.ts`](src/navigation/navigation.ts). Every entry
maps to a real route, is filtered by the active role (`requiredRoles`), and may
declare nested pages (`children`) and search `keywords`.

To add a module:

1. Create the page under `src/pages/<section>/<module>/`.
2. Register the route in `src/routes/AppRoutes.tsx` using `lazy()`, inside
   `ModuleAccessGuard`.
3. Add an entry to `MODULE_CATEGORIES` with its `url`, `requiredRoles`, an
   `icon` key from `ModuleIcon.tsx` and, optionally, `children` and `keywords`.

It then appears in the sidebar, the palette, the catalog and the metrics.

### Workspace: favorites, history and metrics

`WorkspaceProvider` ([`src/context/WorkspaceContext.tsx`](src/context/WorkspaceContext.tsx))
loads the workspace of the signed-in user when the session starts and records a
visit on every route change. Persistence goes through
[`workspaceService`](src/services/workspace/workspace.service.ts): localStorage
today, keyed by user id, with an async API ready for a backend
(`load`, `recordVisit`, `toggleFavorite`). Metrics are pure functions in
[`metrics.ts`](src/services/workspace/metrics.ts).

The first time, the workspace is seeded with ~6 months of generated activity so
the charts are not empty. It is flagged as demo data and the home offers a
"Borrar demo" link that removes it while keeping favorites and real visits.

### Sidebar and command palette

- **Sidebar** (`AppSidebar`): user, role and organization; favorites; every
  module with nested pages; active route; collapses to an icon rail on desktop
  (remembered per browser) and becomes a drawer on tablet and mobile.
- **Command palette** (`Ctrl + K`, `⌘ + K` on macOS): searches modules, pages,
  routes and actions, lists favorites and recent history. Arrows to move, Enter
  to open, `Ctrl/⌘ + D` to toggle a favorite, Esc to close. It follows the ARIA
  combobox pattern. Quick actions are defined once in
  [`quickActions.ts`](src/navigation/quickActions.ts) and shared
  with the home.

### Charts

`src/components/ui/charts/` holds small SVG charts with no extra dependency
(`ColumnChart`, `AreaLineChart`, `BarList`, `Sparkline`, `StatTile`). Their data
API uses TanStack-style accessors (`x={(row) => …}`), and `ChartCard` offers a
**Table** view rendered with TanStack Table from regular `ColumnDef`s, so every
value is reachable without the chart. Marks use the `--color-chart-*` tokens,
support hover and keyboard exploration (arrow keys), and work in both themes.

### Code splitting

Only `Login` and the dashboard ship in the initial bundle. Every other module —
Gantt, the process designer, dnd-kit boards, tables, the playground — is loaded
on demand through `React.lazy` behind a single `<Suspense>` boundary, so opening
the home page does not download code the user may never visit.

Inspect the resulting chunks with:

```bash
pnpm build
```

## Design system

The whole visual language lives in **one file**:
[`src/css/theme.css`](src/css/theme.css). It declares every color, shadow,
radius, font, motion curve, z-index and layout size, with a light value and a
dark override. Components never hardcode values.

| Layer | Where | What it gives you |
| --- | --- | --- |
| Tokens | `src/css/theme.css` | CSS variables + Tailwind utilities (`bg-surface`, `text-fg-muted`, `border-line`, `text-danger`, `shadow-md`, `rounded-lg`) |
| Component classes | `src/css/components.css` | Recurring patterns: `card`, `card-interactive`, `eyebrow`, `page-title`, `surface-header` |
| Tones | `src/components/ui/tone.ts` | One map for every status / category color: `toneSoft`, `toneTint`, `toneSolid`, `toneText`, `toneBorder` |
| Primitives | `src/components/ui/` | `ButtonComponent`, `InputComponent`, `Select`, `DataList`, `Badge`, `Alert`, `Avatar`, `PopUp`, `TableTs` |

**Color roles**

- Neutrals: `canvas` (app background), `canvas-subtle` (hover, wells),
  `surface` (cards, inputs), `surface-muted` (table headers), `line` /
  `line-strong` (borders), `fg` / `fg-muted` / `fg-subtle` (text).
- Brand and status follow the same triad: `X` for text, icons and borders,
  `X-soft` for tinted backgrounds, `X-solid` for filled backgrounds with
  `text-on-solid`. Available for `brand`, `success`, `warning`, `danger`, `info`.
- Categorical accents (`accent-emerald`, `accent-sky`, …) only tell data apart
  (process nodes, tags, avatars, file types); their names match the values
  stored in data.

Tailwind's default palette is disabled (`--color-*: initial`), so a class like
`bg-red-500` generates no CSS: use a semantic token instead. Every text/background
pair meets WCAG AA (4.5:1) in both themes.

**Rebranding** means editing `theme.css` only: change `--color-brand*` (and the
dark overrides) and every button, link, focus ring and active state follows.

The previous variable names (`--color-bg`, `--color-text`, `--color-border`,
`--color-highlight`, …) remain as aliases for backward compatibility.

## Using it as a template

Places to touch when starting a new project:

- `src/config/app.config.ts` — name, organization, API base URL.
- `src/navigation/modules.ts` — your module catalog.
- `src/app/App.tsx` — replace `DEMO_USER` and `handleLogin` with real auth.
- `src/services/` — replace the mock services with your endpoints.
- `src/css/theme.css` — design tokens (see [Design system](#design-system)).
- `index.html` — page title and favicon.

Mock datasets are isolated in `data/` folders (`src/pages/operations/tasks/data/`,
`src/pages/operations/planning/data/`), in the `seed` functions of the services
and in the `*Catalog.tsx` playground pages. Some of them still carry sample naming from an earlier tournament-management project;
they are demo fixtures only and are safe to delete.

## Authentication note

Auth is **simulated**. `handleLogin` in `src/app/App.tsx` writes a fake token to
`localStorage` and `ProtectedRoute` only checks that the token exists. Role
filtering in the UI is presentational — it is not a security boundary. Enforce
permissions on your server before shipping anything real.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) and
[NOTICE](NOTICE).

```
Copyright 2026 Ariel Navas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Third-party dependencies keep their own licenses; see [NOTICE](NOTICE).
