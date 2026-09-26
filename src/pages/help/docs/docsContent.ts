// Template guide shown in Help › Documentation. Markdown per section.

export type DocSection = { id: string; title: string; body: string }

export const DOC_SECTIONS: DocSection[] = [
    {
        id: 'introduccion',
        title: 'Introducción',
        body: `Esta plantilla es un panel administrativo con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS 4**. Todo funciona con datos simulados persistidos en \`localStorage\`, detrás de servicios asíncronos con la forma que tendría un backend real: para conectarlo basta con reimplementar cada servicio.

Módulos incluidos: espacio de trabajo con favoritos y métricas, tareas, planificación, procesos BPMN, documentos, correo, asistente IA, centro de soporte, base de conocimiento, API keys, usuarios, roles (RBAC), auditoría y cuenta.`,
    },
    {
        id: 'estructura',
        title: 'Estructura del proyecto',
        body: `Las páginas se agrupan igual que la navegación: \`src/pages/<sección>/<módulo>\`.

\`\`\`text
src/
├── app/            App, límite de errores
├── routes/         Rutas (lazy) y protección por rol
├── navigation/     Registro de módulos, consultas y acciones rápidas
├── config/         Configuración (variables VITE_*)
├── context/        Tema, cuenta y espacio de trabajo
├── services/       Datos por dominio (mail, support, api-keys, assistant…)
├── components/
│   ├── common/     Shell, sidebar, paleta, layouts, markdown, adjuntos
│   └── ui/         Botones, campos, tablas, gráficos, badges…
├── pages/
│   ├── workspace/      Inicio, módulos, favoritos, actividad
│   ├── operations/     Tareas, planificación, procesos, documentos, gantt
│   ├── communication/  Correo, asistente IA, soporte
│   ├── administration/ API keys, usuarios, roles, auditoría
│   ├── help/           Base de conocimiento, documentación, catálogo UI
│   ├── account/        Perfil, preferencias, seguridad
│   ├── system/         404, 403, 500, mantenimiento
│   └── auth/           Inicio de sesión
└── css/            Tokens de diseño y utilidades
\`\`\`

Cada módulo sigue el mismo patrón: la página compone componentes de presentación, un *hook* (\`hooks/useX.ts\`) concentra el estado y las acciones, y el servicio (\`src/services/x\`) contiene la lógica de negocio y la persistencia.`,
    },
    {
        id: 'nuevo-modulo',
        title: 'Agregar un módulo',
        body: `1. Crea la página en \`src/pages/<sección>/<módulo>/\`.
2. Registra la ruta en \`src/routes/AppRoutes.tsx\` con \`lazy()\`, dentro de \`ModuleAccessGuard\`.
3. Agrega la entrada en \`src/navigation/modules.ts\` con \`url\`, \`icon\`, \`requiredRoles\` y, si aplica, \`children\` y \`keywords\`.

El módulo aparece automáticamente en el menú lateral, la paleta de comandos (\`Ctrl\` + \`K\`), el catálogo, los favoritos y las métricas de uso.`,
    },
    {
        id: 'diseno',
        title: 'Sistema de diseño',
        body: `Los colores, radios, sombras y tiempos viven en \`src/css/theme.css\` como tokens semánticos con valores para tema claro y oscuro. Los componentes nunca usan colores directos:

| Uso | Utilidades |
| --- | --- |
| Superficies | \`bg-canvas\`, \`bg-surface\`, \`bg-surface-muted\` |
| Texto | \`text-fg\`, \`text-fg-muted\`, \`text-fg-subtle\` |
| Bordes | \`border-line\`, \`border-line-strong\` |
| Marca | \`bg-brand-solid\`, \`text-brand\`, \`bg-brand-soft\` |
| Estados | \`success\`, \`warning\`, \`danger\`, \`info\` (+ \`-soft\`, \`-solid\`) |

Los estados y categorías se resuelven con el sistema de *tones* (\`src/components/ui/tone.ts\`), compartido por badges, alertas y gráficos. Revisa el **Catálogo de UI** para ver cada componente.`,
    },
    {
        id: 'datos',
        title: 'Servicios y datos',
        body: `Los servicios simulados usan \`createLocalStore\` (\`src/services/storage/localStore.ts\`): valida lo que lee, genera datos de ejemplo la primera vez y hace las actualizaciones en un solo paso para no perder cambios.

\`\`\`ts
const store = createLocalStore<State>({ namespace: 'support:v1', seed, parse })

export const supportService = {
    async list(userId: string) {
        return store.read(userId).tickets
    },
}
\`\`\`

Para conectar un backend, conserva las firmas y reemplaza el cuerpo por llamadas a \`src/services/http.ts\`.`,
    },
    {
        id: 'permisos',
        title: 'Permisos y navegación',
        body: `\`requiredRoles\` en el registro de navegación controla todo el acceso:

- El módulo se oculta del menú, la paleta, el inicio y los favoritos.
- \`ModuleAccessGuard\` responde **403** si se abre la URL directamente.
- La página 403 ofrece solicitar acceso con un ticket de soporte precargado.

> La interfaz solo oculta: el backend debe validar los permisos en cada solicitud.`,
    },
    {
        id: 'seguridad',
        title: 'Seguridad',
        body: `- **API keys:** se muestran completas una sola vez; se almacena su hash SHA-256, el prefijo y los últimos cuatro caracteres. Rotar emite un valor nuevo y anula el anterior. Cada acción queda en la auditoría.
- **Variables \`VITE_*\`:** se incluyen en el bundle del navegador. Nunca pongas secretos en ellas.
- **Asistente IA:** el motor (\`assistantEngine.ts\`) debe llamar a *tu* backend, que guarda las credenciales del modelo.
- **Markdown:** se renderiza a elementos de React, sin \`dangerouslySetInnerHTML\`.
- **Notas internas de soporte:** la interfaz las oculta a los solicitantes; el backend debe filtrarlas.`,
    },
    {
        id: 'estados',
        title: 'Páginas de estado',
        body: `| Página | Cuándo aparece |
| --- | --- |
| 404 | Ruta inexistente dentro de la sesión |
| 403 | Módulo sin permiso para el rol actual |
| 500 | Error de renderizado (límite de errores) o \`/500?ref=…\` |
| Mantenimiento | \`VITE_MAINTENANCE_MODE=true\` (vista previa en \`/maintenance\`) |

Los errores generan una referencia \`ERR-AAAAMMDD-XXXXXX\` que se puede copiar o adjuntar a un ticket.`,
    },
]
