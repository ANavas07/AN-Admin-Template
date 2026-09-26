# System Panel 2026

[![Licencia: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**Plantilla** de panel administrativo construida con React 19, TypeScript, Vite y
Tailwind CSS 4. Incluye un dashboard de módulos filtrado por rol, una consola
RBAC, un espacio de tareas (tablero / lista / cronograma / calendario), una
grilla de planificación, un diseñador de procesos tipo BPMN y un catálogo de
componentes de UI — todo sobre datos simulados, para que puedas clonarlo y
conectar tu propio backend.

🇬🇧 [English version](README.md)

---

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Node.js | >= 20.19 (desarrollado en 24.x) |
| pnpm | 10.x (`corepack enable pnpm`) |

npm o yarn también funcionan, pero el lockfile del repo es `pnpm-lock.yaml`.

## Puesta en marcha

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm dev
```

El servidor de desarrollo imprime la URL local (Vite usa `http://localhost:5173`
por defecto). Entra con cualquier correo y contraseña: el login está simulado y
solo escribe un token en `localStorage`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Verifica tipos (`tsc -b`) y compila a `dist/` |
| `pnpm preview` | Sirve localmente el build de `dist/` |
| `pnpm lint` | ESLint sobre todo el proyecto |

Dos scripts auxiliares regeneran el set de iconos de planificación:

```bash
node scripts/generate-planning-icons.mjs
```

```bash
node scripts/rasterize-planning-icons.mjs
```

## Configuración

Toda la configuración de plantilla vive en un solo archivo:
[`src/config/app.config.ts`](src/config/app.config.ts), alimentado por las
variables de entorno declaradas en [`.env.example`](.env.example).

| Variable | Valor por defecto | Para qué sirve |
| --- | --- | --- |
| `VITE_APP_NAME` | `System Panel 2026` | Nombre de la aplicación |
| `VITE_APP_ORGANIZATION` | `Mi Organizacion` | Organización del panel lateral |
| `VITE_APP_LOCATION` | `Sede principal` | Ubicación del panel lateral |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | URL base de `src/services/http.ts` |

> Todo lo que empieza con `VITE_` queda incrustado en el bundle del navegador.
> Nunca pongas secretos ahí.

## Estructura del proyecto

```
src/
├── app/App.tsx              Shell: navbar, tema, sesión simulada
├── routes/AppRoutes.tsx     Tabla de rutas (módulos con carga diferida)
├── config/app.config.ts     Punto único de configuración
├── components/
│   ├── admin-panel/         Espacio de trabajo del home + registro de navegación
│   ├── common/              Navbar, sidebar, paleta de comandos, formularios, modales, toasts
│   └── ui/                  Botones, inputs, tabla, gráficos, badge, alert, avatar, tonos
├── pages/
│   ├── tasks/               Tablero, lista, cronograma, calendario (dnd-kit)
│   ├── planning/            Grilla de plantillas con iconos/imágenes por celda
│   ├── process/             Repositorio y diseñador de procesos
│   ├── superuser/rbac/      Roles, permisos, grupos, auditoría
│   ├── users/               Gestión de usuarios
│   ├── files/               Centro de carga de archivos
│   └── playground/          Catálogo de componentes de UI
├── services/                Cliente HTTP + servicios por dominio
├── utils/                   Utilidades compartidas (p. ej. `cn` para clases)
├── context/ThemeContext.tsx Tema claro/oscuro
└── css/
    ├── theme.css            Tokens de diseño (claro + oscuro), fuente única de verdad
    ├── components.css       Clases reutilizables: card, eyebrow, page-title…
    └── styles.css           Entrada de Tailwind, capa base, puentes con terceros
```

## Cómo funciona el dashboard

El home es un **espacio de trabajo personal**, no una grilla de tarjetas
estáticas. En orden de prioridad muestra los módulos favoritos del usuario, las
páginas visitadas recientemente, accesos rápidos, información del sistema,
métricas de uso y, al final, el catálogo completo. Favoritos y accesos rápidos se
ordenan según la frecuencia con que el usuario abre cada módulo.

### Un único registro de navegación

[`src/components/admin-panel/data/modules.ts`](src/components/admin-panel/data/modules.ts)
es la única fuente de navegación. El sidebar, la paleta de comandos, el home, la
subnavegación de RBAC y el registro de actividad lo leen a través de
[`navigation.ts`](src/components/admin-panel/data/navigation.ts). Cada entrada
apunta a una ruta real, se filtra por el rol activo (`requiredRoles`) y puede
declarar páginas anidadas (`children`) y `keywords` para la búsqueda.

Para agregar un módulo:

1. Crea la página en `src/pages/<modulo>/`.
2. Registra la ruta en `src/routes/AppRoutes.tsx` usando `lazy()`.
3. Agrega la entrada en `MODULE_CATEGORIES` con su `url`, `requiredRoles`, una
   clave de `icon` de `ModuleIcon.tsx` y, opcionalmente, `children` y `keywords`.

Con eso aparece en el sidebar, la paleta, el catálogo y las métricas.

### Espacio de trabajo: favoritos, historial y métricas

`WorkspaceProvider` ([`src/context/WorkspaceContext.tsx`](src/context/WorkspaceContext.tsx))
carga el espacio del usuario al iniciar sesión y registra una visita en cada
cambio de ruta. La persistencia pasa por
[`workspaceService`](src/services/workspace/workspace.service.ts): hoy
localStorage, por id de usuario, con una API asíncrona lista para un backend
(`load`, `recordVisit`, `toggleFavorite`). Las métricas son funciones puras en
[`metrics.ts`](src/services/workspace/metrics.ts).

La primera vez el espacio se inicializa con ~6 meses de actividad generada para
que los gráficos no estén vacíos. Está marcada como demostración y el home ofrece
"Borrar demo", que la elimina conservando favoritos y visitas reales.

### Sidebar y paleta de comandos

- **Sidebar** (`AppSidebar`): usuario, rol y organización; favoritos; todos los
  módulos con sus páginas anidadas; ruta activa; se contrae a una barra de iconos
  en escritorio (recordado por navegador) y es un panel deslizable en tablet y
  móvil.
- **Paleta de comandos** (`Ctrl + K`, `⌘ + K` en macOS): busca módulos, páginas,
  rutas y acciones, y lista favoritos e historial reciente. Flechas para moverse,
  Enter para abrir, `Ctrl/⌘ + D` para marcar favorito, Esc para cerrar. Sigue el
  patrón ARIA combobox. Las acciones rápidas se definen una sola vez en
  [`quickActions.ts`](src/components/admin-panel/data/quickActions.ts) y se
  comparten con el home.

### Gráficos

`src/components/ui/charts/` contiene gráficos SVG livianos sin dependencias extra
(`ColumnChart`, `AreaLineChart`, `BarList`, `Sparkline`, `StatTile`). Su API de
datos usa accessors al estilo TanStack (`x={(row) => …}`) y `ChartCard` ofrece una
vista **Tabla** renderizada con TanStack Table a partir de `ColumnDef` normales,
así todo valor es accesible sin ver el gráfico. Las marcas usan los tokens
`--color-chart-*`, admiten exploración con mouse y teclado (flechas) y funcionan
en ambos temas.

### División de código (code splitting)

Solo `Login` y el dashboard viajan en el bundle inicial. Todos los demás módulos
— Gantt, el diseñador de procesos, los tableros con dnd-kit, las tablas, el
playground — se cargan bajo demanda con `React.lazy` detrás de un único
`<Suspense>`. Abrir el home ya no descarga código que el usuario quizá nunca
visite.

Revisa los chunks resultantes con:

```bash
pnpm build
```

## Sistema de diseño

Todo el lenguaje visual vive en **un solo archivo**:
[`src/css/theme.css`](src/css/theme.css). Declara cada color, sombra, radio,
fuente, curva de animación, z-index y medida de layout, con su valor claro y su
variante oscura. Los componentes no escriben valores a mano.

| Capa | Dónde | Qué aporta |
| --- | --- | --- |
| Tokens | `src/css/theme.css` | Variables CSS + utilidades de Tailwind (`bg-surface`, `text-fg-muted`, `border-line`, `text-danger`, `shadow-md`, `rounded-lg`) |
| Clases de componente | `src/css/components.css` | Patrones repetidos: `card`, `card-interactive`, `eyebrow`, `page-title`, `surface-header` |
| Tonos | `src/components/ui/tone.ts` | Un único mapa para todo color de estado o categoría: `toneSoft`, `toneTint`, `toneSolid`, `toneText`, `toneBorder` |
| Primitivos | `src/components/ui/` | `ButtonComponent`, `InputComponent`, `Select`, `DataList`, `Badge`, `Alert`, `Avatar`, `PopUp`, `TableTs` |

**Roles de color**

- Neutros: `canvas` (fondo de la app), `canvas-subtle` (hover, zonas hundidas),
  `surface` (tarjetas, inputs), `surface-muted` (cabeceras de tabla), `line` /
  `line-strong` (bordes), `fg` / `fg-muted` / `fg-subtle` (texto).
- Marca y estados siguen la misma tríada: `X` para texto, iconos y bordes,
  `X-soft` para fondos tintados y `X-solid` para rellenos con `text-on-solid`.
  Existe para `brand`, `success`, `warning`, `danger` e `info`.
- Los acentos categóricos (`accent-emerald`, `accent-sky`, …) solo distinguen
  datos (nodos de procesos, etiquetas, avatares, tipos de archivo); sus nombres
  coinciden con los valores guardados en los datos.

La paleta por defecto de Tailwind está desactivada (`--color-*: initial`): una
clase como `bg-red-500` no genera CSS, hay que usar un token semántico. Todos
los pares texto/fondo cumplen WCAG AA (4.5:1) en ambos temas.

**Cambiar de marca** es editar solo `theme.css`: cambia `--color-brand*` (y sus
variantes oscuras) y todos los botones, enlaces, anillos de foco y estados
activos se actualizan.

Los nombres anteriores (`--color-bg`, `--color-text`, `--color-border`,
`--color-highlight`, …) siguen existiendo como alias por compatibilidad.

## Usarlo como plantilla

Qué tocar al arrancar un proyecto nuevo:

- `src/config/app.config.ts` — nombre, organización, URL del API.
- `src/components/admin-panel/data/modules.ts` — tu catálogo de módulos.
- `src/app/App.tsx` — reemplaza `DEMO_USER` y `handleLogin` por auth real.
- `src/services/` — cambia los servicios simulados por tus endpoints.
- `src/css/theme.css` — tokens de diseño (ver [Sistema de diseño](#sistema-de-diseño)).
- `index.html` — título de la página y favicon.

Los datos simulados están aislados en carpetas `data/`
(`src/pages/tasks/data/`, `src/pages/planning/data/`) y en las páginas
`*Catalog.tsx` del playground. Algunos aún conservan nombres de ejemplo de un
proyecto anterior de gestión de torneos; son solo fixtures de demo y se pueden
borrar sin riesgo.

## Nota sobre autenticación

La autenticación está **simulada**. `handleLogin` en `src/app/App.tsx` escribe un
token falso en `localStorage` y `ProtectedRoute` solo verifica que ese token
exista. El filtrado por rol en la UI es presentacional, no es una frontera de
seguridad. Valida los permisos en tu servidor antes de llevar esto a producción.

## Licencia

Distribuido bajo la Licencia Apache, Versión 2.0. Ver [LICENSE](LICENSE) y
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

Las dependencias de terceros conservan sus propias licencias; ver [NOTICE](NOTICE).
