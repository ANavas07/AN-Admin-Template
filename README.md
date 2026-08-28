# System Panel 2026

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Admin panel **template** built with React 19, TypeScript, Vite and Tailwind CSS 4.
It ships with a role-filtered module dashboard, an RBAC console, a task workspace
(board / list / timeline / calendar), a planning grid, a BPMN-style process
designer and a UI component catalog — all running on mock data, so you can clone
it and plug in your own backend.

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

> Everything prefixed with `VITE_` is inlined into the browser bundle. Never put
> secrets there.

## Project structure

```
src/
├── app/App.tsx              Shell: navbar, theme, mock session
├── routes/AppRoutes.tsx     Route table (lazy-loaded modules)
├── config/app.config.ts     Single configuration entry point
├── components/
│   ├── admin-panel/         Home dashboard + module catalog
│   ├── common/              Navbar, forms, modals, toasts
│   └── ui/                  Buttons, inputs, table, Gantt
├── pages/
│   ├── tasks/               Board, list, timeline, calendar (dnd-kit)
│   ├── planning/            Template grid with per-cell icons/images
│   ├── process/             Process repository + BPMN-style designer
│   ├── superuser/rbac/      Roles, permissions, groups, audit log
│   ├── users/               User management
│   ├── files/               Upload center
│   └── playground/          UI component catalog
├── services/                HTTP client + per-domain API services
├── context/ThemeContext.tsx Light/dark theme
└── css/styles.css           Tailwind entry + design tokens
```

## How the home dashboard works

The dashboard renders a **short, curated catalog** defined in
[`src/components/admin-panel/data/modules.ts`](src/components/admin-panel/data/modules.ts).
Every entry maps to a route that actually exists, so no card leads to a dead
screen. Cards are filtered by the active role via `requiredRoles`, and a module
without a `url` renders disabled instead of navigating nowhere.

To add a module:

1. Create the page under `src/pages/<module>/`.
2. Register the route in `src/routes/AppRoutes.tsx` using `lazy()`.
3. Add an entry to `MODULE_CATEGORIES` with its `url` and `requiredRoles`.

### Code splitting

Only `Login` and the dashboard ship in the initial bundle. Every other module —
Gantt, the process designer, dnd-kit boards, tables, the playground — is loaded
on demand through `React.lazy` behind a single `<Suspense>` boundary, so opening
the home page does not download code the user may never visit.

Inspect the resulting chunks with:

```bash
pnpm build
```

## Using it as a template

Places to touch when starting a new project:

- `src/config/app.config.ts` — name, organization, API base URL.
- `src/components/admin-panel/data/modules.ts` — your module catalog.
- `src/app/App.tsx` — replace `DEMO_USER` and `handleLogin` with real auth.
- `src/services/` — replace the mock services with your endpoints.
- `src/css/styles.css` — design tokens (colors, radii, dark mode).
- `index.html` — page title and favicon.

Mock datasets are isolated in `data/` folders (`src/pages/tasks/data/`,
`src/pages/planning/data/`) and in the `*Catalog.tsx` playground pages. Some of
them still carry sample naming from an earlier tournament-management project;
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
