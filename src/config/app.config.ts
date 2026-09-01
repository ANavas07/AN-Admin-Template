/**
 * Punto unico de configuracion de la plantilla.
 *
 * Al reutilizar este proyecto como base solo deberias tocar este archivo
 * (o el .env correspondiente) para cambiar marca, organizacion y backend.
 */

export const appConfig = {
    /** Nombre visible de la aplicacion. */
    name: import.meta.env.VITE_APP_NAME ?? 'System Panel 2026',
    /** Organizacion mostrada en el panel lateral del dashboard. */
    organization: import.meta.env.VITE_APP_ORGANIZATION ?? 'Mi Organizacion',
    /** Sede / ubicacion mostrada en el panel lateral del dashboard. */
    location: import.meta.env.VITE_APP_LOCATION ?? 'Sede principal',
    /** URL base del API REST consumido por src/services/http.ts. */
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
    /** URL del servicio de analisis de CV (FastAPI), independiente del API principal. */
    cvAnalyzerApiUrl: import.meta.env.VITE_CV_ANALYZER_API_URL ?? 'http://localhost:8000',
} as const

export type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

export type CurrentUser = {
    id: string
    name: string
    email: string
    roles: UserRole[]
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
}
