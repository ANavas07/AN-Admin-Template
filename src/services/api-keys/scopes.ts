/** Permissions an API key can be granted, grouped by domain. */
export type ApiScope = {
    id: string
    label: string
    description: string
    group: string
    /** Grants writes or administration: highlighted in the UI */
    sensitive?: boolean
}

export const API_SCOPES: ApiScope[] = [
    { id: 'users:read', label: 'Leer usuarios', description: 'Consultar usuarios y su estado', group: 'Usuarios' },
    { id: 'users:write', label: 'Gestionar usuarios', description: 'Crear, editar y desactivar usuarios', group: 'Usuarios', sensitive: true },
    { id: 'processes:read', label: 'Leer procesos', description: 'Consultar procesos y diagramas', group: 'Procesos' },
    { id: 'processes:write', label: 'Editar procesos', description: 'Crear y actualizar procesos', group: 'Procesos', sensitive: true },
    { id: 'tasks:read', label: 'Leer tareas', description: 'Consultar proyectos y tareas', group: 'Tareas' },
    { id: 'tasks:write', label: 'Gestionar tareas', description: 'Crear, mover y cerrar tareas', group: 'Tareas', sensitive: true },
    { id: 'files:read', label: 'Descargar documentos', description: 'Leer archivos del centro de documentos', group: 'Documentos' },
    { id: 'files:write', label: 'Subir documentos', description: 'Cargar y eliminar archivos', group: 'Documentos', sensitive: true },
    { id: 'mail:send', label: 'Enviar correo', description: 'Enviar mensajes en nombre de la organización', group: 'Comunicación', sensitive: true },
    { id: 'reports:read', label: 'Leer reportes', description: 'Métricas y reportes agregados', group: 'Reportes' },
    { id: 'audit:read', label: 'Leer auditoría', description: 'Eventos de acceso y cambios de permisos', group: 'Reportes' },
    { id: 'admin:full', label: 'Administración total', description: 'Acceso completo a la API. Úsalo solo para integraciones internas de confianza.', group: 'Administración', sensitive: true },
]

export const SCOPE_GROUPS = [...new Set(API_SCOPES.map((scope) => scope.group))]

export function getScope(id: string) {
    return API_SCOPES.find((scope) => scope.id === id)
}
