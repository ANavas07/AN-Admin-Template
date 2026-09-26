# System Panel 2026

[![Licencia: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**Plantilla** de panel administrativo construida con React 19, TypeScript, Vite y
Tailwind CSS 4. Incluye un espacio de trabajo personal, un centro de correo, un
asistente IA, un centro de soporte con base de conocimiento, gestión de API
keys, una consola RBAC, un espacio de tareas (tablero / lista / cronograma /
calendario), una grilla de planificación, un diseñador de procesos tipo BPMN,
ajustes de cuenta, páginas de error y mantenimiento y un catálogo de componentes
de UI — todo sobre datos simulados, para que puedas clonarlo y conectar tu
propio backend.

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
| `VITE_SUPPORT_EMAIL` / `_PHONE` / `_HOURS` | valores de ejemplo | Canales de soporte (centro de soporte, 403 y páginas de error) |
| `VITE_MAINTENANCE_MODE` | `false` | `true` reemplaza toda la app por la página de mantenimiento |
| `VITE_MAINTENANCE_MESSAGE` / `_UNTIL` | vacío | Mensaje opcional y fin estimado (ISO 8601) |
| `VITE_STATUS_PAGE_URL` | vacío | Enlace opcional a tu página de estado |

> Todo lo que empieza con `VITE_` queda incrustado en el bundle del navegador.
> Nunca pongas secretos ahí.

## Estructura del proyecto

Las páginas se agrupan igual que la navegación: `src/pages/<sección>/<módulo>/`.
Todos los módulos siguen la misma división: la página compone componentes de
presentación, un hook (`hooks/useX.ts`) concentra el estado y las acciones, y un
servicio en `src/services/<dominio>/` contiene las reglas de negocio y la
persistencia.

```
src/
├── app/                     Shell de la app, límite de errores
├── routes/                  Tabla de rutas (lazy) + protección por rol
├── navigation/              Registro de módulos, consultas, acciones rápidas
├── config/app.config.ts     Punto único de configuración
├── context/                 Proveedores de tema, cuenta y espacio de trabajo
├── services/                Servicios por dominio (mail, support, api-keys, assistant,
│                            knowledge-base, account, workspace, process, rbac…)
├── components/
│   ├── common/              Shell, sidebar, navbar, paleta de comandos, layouts,
│   │                        drawer, diálogo de confirmación, markdown, adjuntos
│   └── ui/                  Botones, inputs, switch, control segmentado, tabla,
│                            gráficos, badge, alert, avatar, estado vacío, tonos
├── pages/
│   ├── workspace/           Inicio, módulos, favoritos, actividad reciente
│   ├── operations/          Tareas, planificación, procesos, documentos, gantt
│   ├── communication/       Correo, asistente IA, centro de soporte
│   ├── administration/      API keys, usuarios, roles (RBAC), auditoría
│   ├── help/                Base de conocimiento, documentación, catálogo de UI
│   ├── account/             Perfil, preferencias, seguridad
│   ├── system/              Páginas 404, 403, 500 y mantenimiento
│   └── auth/                Inicio de sesión
├── utils/                   Utilidades compartidas (cn, format, attachments, text)
└── css/
    ├── theme.css            Tokens de diseño (claro + oscuro), fuente única de verdad
    ├── components.css       Clases reutilizables: card, eyebrow, page-title…
    └── styles.css           Entrada de Tailwind, capa base, puentes con terceros
```

## Módulos

| Sección | Módulo | Ruta | Destacado |
| --- | --- | --- | --- |
| Espacio de trabajo | Inicio, Módulos, Favoritos, Actividad reciente | `/dashboard`, `/workspace/*` | Favoritos por usuario, historial de visitas, gráficos de uso |
| Comunicación | Correo | `/mail/:carpeta` | Entrada, favoritos, enviados, borradores, archivados, papelera; conversaciones; redactar, responder, responder a todos, reenviar; búsqueda, filtros, etiquetas, adjuntos |
| Comunicación | Asistente IA | `/assistant` | Varias conversaciones, búsqueda, fijar, renombrar; respuestas en Markdown con código resaltado; copiar, regenerar, detener; adjuntos |
| Comunicación | Centro de soporte | `/support/*` | Tickets con seguimiento de estado, prioridad, categoría, asignación, notas internas y adjuntos; base de conocimiento; contacto con tiempos de respuesta |
| Administración | API keys | `/admin/api-keys` | Generar o registrar, rotar, revocar, activar/desactivar, permisos, expiración, uso y auditoría |
| Administración | Usuarios, Roles, Auditoría | `/users`, `/superuser/rbac/*` | Consola RBAC |
| Ayuda | Base de conocimiento, Documentación | `/help/*`, `/playground` | Búsqueda sin acentos, valoración de artículos, guía de la plantilla, catálogo de UI |
| Cuenta | Perfil, Preferencias, Seguridad | `/account/*` | Tema (claro/oscuro/sistema), notificaciones, contraseña, 2FA, sesiones, registro de seguridad |

### Seguridad de las API keys

- La clave completa se muestra **una sola vez**, oculta hasta que se revela, y
  el diálogo solo se cierra cuando el usuario confirma que la guardó.
- Se almacena el hash SHA-256, el prefijo y los últimos cuatro caracteres: las
  listas y el detalle solo muestran `sk_live_••••••••••••a1B2`.
- Rotar emite un secreto nuevo para la misma clave y anula el anterior al
  instante; revocar es permanente.
- Cada acción (crear, registrar, editar, (des)activar, rotar, revocar, copiar)
  queda en la auditoría de la clave y en el registro de seguridad de quien la
  realizó.

### Páginas de estado y permisos

`requiredRoles` del registro de navegación controla el acceso en todas partes:
el módulo desaparece del sidebar, la paleta y el inicio, y `ModuleAccessGuard`
responde **403** si se abre su URL directamente (con la opción de contactar a
soporte con un ticket precargado). Las rutas inexistentes muestran **404** con
búsqueda y sugerencias. Los errores de renderizado los captura
`AppErrorBoundary`, que muestra **500** con una referencia copiable
(`ERR-AAAAMMDD-XXXXXX`) que se puede adjuntar a un ticket.
`VITE_MAINTENANCE_MODE=true` muestra la página de **mantenimiento** en lugar de
la app (vista previa en `/maintenance`).

### Motor de IA

El asistente depende del contrato `AssistantEngine` de
[`assistantEngine.ts`](src/services/assistant/assistantEngine.ts). La plantilla
trae una simulación local; para usar un modelo real, implementa el contrato
contra **tu backend**, que guarda las credenciales del modelo. Nunca llames a un
proveedor de modelos con una clave desde el navegador.

## Cómo funciona el dashboard

El home es un **espacio de trabajo personal**, no una grilla de tarjetas
estáticas. En orden de prioridad muestra los módulos favoritos del usuario, las
páginas visitadas recientemente, accesos rápidos, información del sistema,
métricas de uso y, al final, el catálogo completo. Favoritos y accesos rápidos se
ordenan según la frecuencia con que el usuario abre cada módulo.

### Un único registro de navegación

[`src/navigation/modules.ts`](src/navigation/modules.ts)
es la única fuente de navegación. El sidebar, la paleta de comandos, el home, la
subnavegación de RBAC y el registro de actividad lo leen a través de
[`navigation.ts`](src/navigation/navigation.ts). Cada entrada
apunta a una ruta real, se filtra por el rol activo (`requiredRoles`) y puede
declarar páginas anidadas (`children`) y `keywords` para la búsqueda.

Para agregar un módulo:

1. Crea la página en `src/pages/<sección>/<módulo>/`.
2. Registra la ruta en `src/routes/AppRoutes.tsx` usando `lazy()`, dentro de
   `ModuleAccessGuard`.
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
  [`quickActions.ts`](src/navigation/quickActions.ts) y se
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
- `src/navigation/modules.ts` — tu catálogo de módulos.
- `src/app/App.tsx` — reemplaza `DEMO_USER` y `handleLogin` por auth real.
- `src/services/` — cambia los servicios simulados por tus endpoints.
- `src/css/theme.css` — tokens de diseño (ver [Sistema de diseño](#sistema-de-diseño)).
- `index.html` — título de la página y favicon.

Los datos simulados están aislados en carpetas `data/`
(`src/pages/operations/tasks/data/`, `src/pages/operations/planning/data/`), en
las funciones `seed` de los servicios y en las páginas `*Catalog.tsx` del
playground. Algunos aún conservan nombres de ejemplo de un
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
