/**
 * Punto unico de configuracion de la plantilla.
 *
 * Al reutilizar este proyecto como base solo deberias tocar este archivo
 * (o el .env correspondiente) para cambiar marca, organizacion y backend.
 */

export const appConfig = {
    /** Nombre visible de la aplicacion. */
    name: import.meta.env.VITE_APP_NAME ?? 'Sistema de Gestión',
    /** Siglas del logotipo (2 o 3 letras). */
    shortName: import.meta.env.VITE_APP_SHORT_NAME ?? 'SG',
    /** Frase corta bajo el nombre en la barra superior y el inicio de sesión. */
    tagline: import.meta.env.VITE_APP_TAGLINE ?? 'Panel administrativo',
    /** Organizacion mostrada en el panel lateral del dashboard. */
    organization: import.meta.env.VITE_APP_ORGANIZATION ?? 'Mi Organización',
    /** Sede / ubicacion mostrada en el panel lateral del dashboard. */
    location: import.meta.env.VITE_APP_LOCATION ?? 'Sede principal',
    /** URL base del API REST consumido por src/services/http.ts. */
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
    /**
     * API simulada en el navegador para los módulos que llaman a REST (roles,
     * permisos, grupos, auditoría). Pon VITE_USE_MOCK_API=false al conectar tu backend.
     */
    mockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
    /** Canales de soporte: pagina 403, Centro de soporte y paginas de error. */
    support: {
        email: import.meta.env.VITE_SUPPORT_EMAIL ?? 'soporte@example.com',
        phone: import.meta.env.VITE_SUPPORT_PHONE ?? '+593 2 000 0000',
        hours: import.meta.env.VITE_SUPPORT_HOURS ?? 'Lunes a viernes, 08:00 – 18:00',
    },
    /**
     * Modo mantenimiento: con VITE_MAINTENANCE_MODE=true toda la aplicacion
     * muestra la pagina de mantenimiento. Los demas campos son opcionales.
     */
    maintenance: {
        enabled: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
        message: import.meta.env.VITE_MAINTENANCE_MESSAGE,
        /** Fin estimado en formato ISO 8601, p. ej. 2026-10-01T06:00:00-05:00 */
        until: import.meta.env.VITE_MAINTENANCE_UNTIL,
        statusPageUrl: import.meta.env.VITE_STATUS_PAGE_URL,
    },
} as const

export type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

/** Etiqueta visible de cada rol (navbar, sidebar, paleta de comandos). */
export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    organizer: 'Organizador',
    analyst: 'Analista',
    viewer: 'Lector',
}

export type CurrentUser = {
    id: string
    name: string
    email: string
    roles: UserRole[]
    /** Area o departamento del usuario, mostrado en el sidebar. Opcional. */
    department?: string
    /** Cargo. Opcional. */
    jobTitle?: string
    /** Telefono de contacto. Opcional. */
    phone?: string
}

/**
 * Usuario de demostracion usado mientras no hay backend de autenticacion.
 * Reemplazalo por la respuesta real de tu endpoint de login.
 */
export const DEMO_USER: CurrentUser = {
    id: '1',
    name: 'Usuario Demo',
    email: 'demo@example.com',
    roles: ['admin', 'organizer', 'analyst'],
    department: 'Dirección de Tecnología',
}
