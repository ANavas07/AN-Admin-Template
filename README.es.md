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
│   ├── admin-panel/         Dashboard del home + catálogo de módulos
│   ├── common/              Navbar, formularios, modales, toasts
│   └── ui/                  Botones, inputs, tabla, Gantt
├── pages/
│   ├── tasks/               Tablero, lista, cronograma, calendario (dnd-kit)
│   ├── planning/            Grilla de plantillas con iconos/imágenes por celda
│   ├── process/             Repositorio y diseñador de procesos
│   ├── superuser/rbac/      Roles, permisos, grupos, auditoría
│   ├── users/               Gestión de usuarios
│   ├── files/               Centro de carga de archivos
│   └── playground/          Catálogo de componentes de UI
├── services/                Cliente HTTP + servicios por dominio
├── context/ThemeContext.tsx Tema claro/oscuro
└── css/styles.css           Entrada de Tailwind + tokens de diseño
```

## Cómo funciona el dashboard

El home renderiza un **catálogo corto y curado** definido en
[`src/components/admin-panel/data/modules.ts`](src/components/admin-panel/data/modules.ts).
Cada entrada apunta a una ruta que existe de verdad, así ninguna tarjeta lleva a
una pantalla vacía. Las tarjetas se filtran por el rol activo mediante
`requiredRoles`, y un módulo sin `url` se muestra deshabilitado en vez de navegar
a la nada.

Para agregar un módulo:

1. Crea la página en `src/pages/<modulo>/`.
2. Registra la ruta en `src/routes/AppRoutes.tsx` usando `lazy()`.
3. Agrega la entrada en `MODULE_CATEGORIES` con su `url` y sus `requiredRoles`.

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

## Usarlo como plantilla

Qué tocar al arrancar un proyecto nuevo:

- `src/config/app.config.ts` — nombre, organización, URL del API.
- `src/components/admin-panel/data/modules.ts` — tu catálogo de módulos.
- `src/app/App.tsx` — reemplaza `DEMO_USER` y `handleLogin` por auth real.
- `src/services/` — cambia los servicios simulados por tus endpoints.
- `src/css/styles.css` — tokens de diseño (colores, radios, modo oscuro).
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
