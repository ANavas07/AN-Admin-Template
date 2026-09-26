/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME?: string
    readonly VITE_APP_ORGANIZATION?: string
    readonly VITE_APP_LOCATION?: string
    readonly VITE_API_BASE_URL?: string
    readonly VITE_SUPPORT_EMAIL?: string
    readonly VITE_SUPPORT_PHONE?: string
    readonly VITE_SUPPORT_HOURS?: string
    readonly VITE_MAINTENANCE_MODE?: string
    readonly VITE_MAINTENANCE_MESSAGE?: string
    readonly VITE_MAINTENANCE_UNTIL?: string
    readonly VITE_STATUS_PAGE_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
