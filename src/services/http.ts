import { appConfig } from '../config/app.config'
import { findMockRoute, MockHttpError } from './mock/rbacMockApi'

const BASE_URL = appConfig.apiBaseUrl

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestConfig {
    headers?: Record<string, string>
    signal?: AbortSignal
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

/** Answers from the in-browser mock API (appConfig.mockApi), with a short, abortable delay. */
async function mockRequest<T>(handler: (body: unknown) => unknown, body: unknown, signal?: AbortSignal): Promise<T> {
    await new Promise<void>((resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'))
        if (signal?.aborted) return abort()
        const timeout = setTimeout(resolve, 220)
        signal?.addEventListener('abort', () => {
            clearTimeout(timeout)
            abort()
        }, { once: true })
    })
    try {
        return handler(body === undefined ? undefined : JSON.parse(JSON.stringify(body))) as T
    } catch (error) {
        if (error instanceof MockHttpError) throw new ApiError(error.status, error.message, { message: error.message })
        throw error
    }
}

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig,
): Promise<T> {
    const mock = appConfig.mockApi ? findMockRoute(method, path) : undefined
    if (mock) return mockRequest<T>(mock, body, config?.signal)

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...config?.headers,
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: config?.signal,
    })

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

    put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PUT', path, body, config),

    patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PATCH', path, body, config),

    delete: <T>(path: string, config?: RequestConfig) =>
        request<T>('DELETE', path, undefined, config),
}
