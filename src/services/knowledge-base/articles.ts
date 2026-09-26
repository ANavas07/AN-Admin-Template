// Knowledge base content. PLANTILLA: static articles; replace them with your
// CMS or helpdesk API. Bodies are Markdown (rendered with the shared Markdown component).

export type ArticleCategory = {
    id: string
    name: string
    description: string
    icon: string
}

export type Article = {
    slug: string
    title: string
    categoryId: string
    summary: string
    tags: string[]
    updatedAt: string
    body: string
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
    { id: 'getting-started', name: 'Primeros pasos', description: 'Navegación, búsqueda y espacio de trabajo', icon: 'home' },
    { id: 'account', name: 'Cuenta y seguridad', description: 'Contraseña, verificación en dos pasos y sesiones', icon: 'lock' },
    { id: 'operations', name: 'Procesos y tareas', description: 'Diseñador de procesos, tareas y documentos', icon: 'process' },
    { id: 'integrations', name: 'Integraciones', description: 'API keys, permisos y buenas prácticas', icon: 'key' },
    { id: 'administration', name: 'Administración', description: 'Usuarios, roles y auditoría', icon: 'administration' },
]

export const ARTICLES: Article[] = [
    {
        slug: 'buscar-con-la-paleta-de-comandos',
        title: 'Encontrar cualquier módulo con la paleta de comandos',
        categoryId: 'getting-started',
        summary: 'Abre módulos, páginas y acciones sin usar el menú con Ctrl + K.',
        tags: ['atajos', 'búsqueda', 'navegación'],
        updatedAt: '2026-09-02T12:00:00',
        body: `La paleta de comandos es la forma más rápida de moverte por la plataforma.

## Abrirla

- **Windows y Linux:** \`Ctrl\` + \`K\`
- **macOS:** \`⌘\` + \`K\`
- También puedes pulsar el buscador de la barra superior.

## Qué puedes hacer

1. Escribir parte del nombre de un módulo o página (por ejemplo, *audit* encuentra «Registros de auditoría»).
2. Ejecutar acciones como **cambiar de tema** o **crear un ticket**.
3. Marcar un módulo como favorito con \`Ctrl\` + \`D\` sobre el resultado seleccionado.

> Los resultados respetan tu rol: solo verás los módulos a los que tienes acceso.`,
    },
    {
        slug: 'favoritos-y-actividad',
        title: 'Favoritos y actividad reciente',
        categoryId: 'getting-started',
        summary: 'Fija tus módulos más usados y retoma el trabajo donde lo dejaste.',
        tags: ['favoritos', 'inicio'],
        updatedAt: '2026-08-20T12:00:00',
        body: `Tu página de inicio se adapta a cómo trabajas.

## Favoritos

Pulsa la estrella de cualquier módulo (en el catálogo, el menú o la paleta) para fijarlo. Los favoritos se guardan por usuario y aparecen primero en el inicio y en la paleta.

## Actividad reciente

**Espacio de trabajo › Actividad reciente** muestra tu historial de navegación y métricas de uso por módulo y por día.`,
    },
    {
        slug: 'activar-verificacion-en-dos-pasos',
        title: 'Activar la verificación en dos pasos',
        categoryId: 'account',
        summary: 'Protege tu cuenta con un código de tu aplicación de autenticación.',
        tags: ['2fa', 'seguridad', 'contraseña'],
        updatedAt: '2026-09-10T12:00:00',
        body: `La verificación en dos pasos añade un código temporal a tu contraseña.

## Pasos

1. Ve a **Cuenta › Seguridad**.
2. Activa **Solicitar un código al iniciar sesión**.
3. Confirma la acción. El próximo inicio de sesión pedirá el código.

## Si pierdes el acceso

Crea un ticket de categoría **Accesos y permisos** desde el Centro de soporte. Un administrador verificará tu identidad antes de restablecerla.`,
    },
    {
        slug: 'cerrar-sesiones-en-otros-dispositivos',
        title: 'Cerrar sesiones en otros dispositivos',
        categoryId: 'account',
        summary: 'Revisa dónde está abierta tu cuenta y cierra lo que no reconozcas.',
        tags: ['sesiones', 'seguridad'],
        updatedAt: '2026-07-14T12:00:00',
        body: `En **Cuenta › Seguridad › Sesiones activas** verás cada dispositivo con una sesión abierta.

- **Cerrar sesión** en una fila cierra solo ese dispositivo.
- **Cerrar las demás** mantiene únicamente la sesión actual.

Si ves un dispositivo desconocido, cambia tu contraseña inmediatamente.`,
    },
    {
        slug: 'personalizar-propiedades-de-un-proceso',
        title: 'Personalizar las propiedades de un proceso',
        categoryId: 'operations',
        summary: 'Agrega responsables, documentos y datos a cada elemento del diagrama.',
        tags: ['bpmn', 'procesos', 'diseñador'],
        updatedAt: '2026-08-28T12:00:00',
        body: `Cada elemento del diseñador de procesos tiene un panel de propiedades.

## Editar propiedades

1. Abre el proceso en **Operación › Procesos**.
2. Selecciona una tarea o evento del diagrama.
3. En el panel lateral edita nombre, responsable, color y documentos adjuntos.

## Conexiones

Arrastra desde cualquiera de los cuatro puntos de un elemento para conectarlo. La conexión respeta el punto que elijas en origen y destino.`,
    },
    {
        slug: 'crear-y-rotar-api-keys',
        title: 'Crear y rotar API keys de forma segura',
        categoryId: 'integrations',
        summary: 'Cómo emitir claves, asignar permisos y rotarlas sin interrumpir integraciones.',
        tags: ['api', 'seguridad', 'integraciones', 'rotación'],
        updatedAt: '2026-09-18T12:00:00',
        body: `Las API keys permiten que sistemas externos usen la plataforma. Solo los administradores pueden gestionarlas.

## Generar una clave

1. Ve a **Administración › API Keys** y pulsa **Generar API key**.
2. Elige el entorno, la expiración y **solo** los permisos necesarios.
3. Copia la clave: **se muestra una única vez**. Después solo verás su terminación.

\`\`\`bash
curl https://api.example.com/v1/processes \\
  -H "Authorization: Bearer $API_KEY"
\`\`\`

## Rotar sin cortes

La rotación emite un nuevo valor y el anterior deja de funcionar al instante:

1. Programa una ventana de mantenimiento de la integración.
2. Pulsa **Rotar** en el detalle de la clave y copia el nuevo valor.
3. Actualiza la variable de entorno del servicio y verifica la primera llamada.

> Toda acción queda registrada en la auditoría de la clave y en el registro de seguridad de quien la realizó.`,
    },
    {
        slug: 'permisos-de-una-api-key',
        title: 'Qué permiso necesita cada integración',
        categoryId: 'integrations',
        summary: 'Referencia de los permisos (scopes) disponibles para las API keys.',
        tags: ['api', 'permisos', 'scopes'],
        updatedAt: '2026-09-05T12:00:00',
        body: `Asigna el mínimo de permisos. Los marcados como **sensibles** permiten escribir o administrar.

| Permiso | Uso típico |
| --- | --- |
| \`users:read\` | Directorios y sincronización de usuarios |
| \`processes:read\` | Tableros de procesos y reportes |
| \`tasks:write\` | Automatizar la creación de tareas |
| \`reports:read\` | Herramientas de BI |
| \`admin:full\` | Solo integraciones internas de confianza |`,
    },
    {
        slug: 'asignar-roles-a-usuarios',
        title: 'Asignar roles y permisos a usuarios',
        categoryId: 'administration',
        summary: 'Controla el acceso a cada módulo con roles.',
        tags: ['rbac', 'roles', 'usuarios'],
        updatedAt: '2026-08-11T12:00:00',
        body: `El acceso a cada módulo depende del rol del usuario.

1. Crea o revisa los roles en **Administración › Roles**.
2. Asigna permisos a cada rol.
3. En **Asignación de usuarios**, vincula a las personas con su rol.

Si un usuario abre una página sin permiso verá la pantalla **403** con la opción de solicitar acceso a soporte.`,
    },
]

export function getArticle(slug: string) {
    return ARTICLES.find((article) => article.slug === slug)
}

export function getArticleCategory(id: string) {
    return ARTICLE_CATEGORIES.find((category) => category.id === id)
}
