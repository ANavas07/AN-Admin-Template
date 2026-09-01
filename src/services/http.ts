import { appConfig } from '../config/app.config'

const BASE_URL = appConfig.apiBaseUrl

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestConfig {
    headers?: Record<string, string>
    signal?: AbortSignal
    /** Sobrescribe la URL base: para servicios que viven en otro backend. */
    baseUrl?: string
    /** Aborta la peticion pasado este tiempo. Sin valor, no hay limite propio. */
    timeoutMs?: number
}

/**
 * Combina el `signal` del llamante con un timeout propio.
 * Sin `timeoutMs` no crea nada: se usa el signal tal cual.
 */
function withTimeout(config?: RequestConfig) {
    if (!config?.timeoutMs) {
        return { signal: config?.signal, cleanup: () => { }, timedOut: () => false }
    }

    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
        timedOut = true
        controller.abort()
    }, config.timeoutMs)
    config.signal?.addEventListener('abort', () => controller.abort(), { once: true })

    return {
        signal: controller.signal,
        cleanup: () => clearTimeout(timer),
        timedOut: () => timedOut,
    }
}

export class ApiError extends Error {
    readonly status: number
    readonly data?: unknown

    constructor(status: number, message: string, data?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig,
): Promise<T> {
    // Con FormData el navegador debe poner el Content-Type (incluye el boundary).
    const isFormData = body instanceof FormData
    const headers: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...getAuthHeader(),
        ...config?.headers,
    }

    const timeout = withTimeout(config)
    let response: Response
    try {
        response = await fetch(`${config?.baseUrl ?? BASE_URL}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
            signal: timeout.signal,
        })
    } catch (error) {
        if (timeout.timedOut()) {
            throw new ApiError(408, 'La peticion supero el tiempo maximo de espera.')
        }
        throw error
    } finally {
        timeout.cleanup()
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new ApiError(response.status, response.statusText, errorData)
    }

    if (response.status === 204) return undefined as T

    return response.json() as Promise<T>
}

export const http = {
    get: <T>(path: string, config?: RequestConfig) =>
        request<T>('GET', path, undefined, config),

    post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
        request<T>('POST', path, body, config),

    /** POST multipart/form-data: subida de archivos. */
    postForm: <T>(path: string, body: FormData, config?: RequestConfig) =>
        request<T>('POST', path, body, config),

    put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PUT', path, body, config),

    patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PATCH', path, body, config),

    delete: <T>(path: string, config?: RequestConfig) =>
        request<T>('DELETE', path, undefined, config),
}
