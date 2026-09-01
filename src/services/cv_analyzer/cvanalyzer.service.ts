/**
 * Cliente del servicio de analisis de CV (FastAPI).
 *
 * Vive en otro backend que el resto del panel, por eso pasa `baseUrl`:
 * `appConfig.cvAnalyzerApiUrl` (VITE_CV_ANALYZER_API_URL).
 *
 * Dos particularidades frente a los demas servicios:
 *  1. Sube archivos: usa `http.postForm`, no `http.post`.
 *  2. Cada llamada tarda decenas de segundos (conversion del documento + dos o
 *     tres llamadas al LLM), de ahi el `timeoutMs` explicito.
 */
import { appConfig } from '../../config/app.config'
import { ApiError, http } from '../http'
import type {
    CvAnalysisResponse,
    CvErrorCode,
    CvEvaluationResponse,
    JobRequirements,
    SupportedFormats,
} from '../../pages/cv_analyzer/types'

const BASE_URL = appConfig.cvAnalyzerApiUrl
const API_PREFIX = '/api/v1/cv'

/** Un CV largo sin modelos en cache puede rondar el minuto. */
const ANALYSIS_TIMEOUT_MS = 120_000

/** Error del analisis con el codigo estable del backend. */
export class CvAnalyzerError extends Error {
    readonly code: CvErrorCode
    readonly status: number
    readonly details: Record<string, unknown>

    constructor(
        code: CvErrorCode,
        message: string,
        status: number,
        details: Record<string, unknown> = {},
    ) {
        super(message)
        this.name = 'CvAnalyzerError'
        this.code = code
        this.status = status
        this.details = details
    }
}

/** Forma del cuerpo de error que devuelve la API. */
type ApiErrorBody = {
    error?: { code?: CvErrorCode; message?: string; details?: Record<string, unknown> }
}

/**
 * Traduce el error generico de `http.ts` al error tipado del modulo.
 * `ApiError.message` es el statusText, inservible para el usuario: el mensaje
 * util viene en el cuerpo.
 */
function toCvAnalyzerError(error: unknown): CvAnalyzerError {
    if (error instanceof ApiError) {
        if (error.status === 408) {
            return new CvAnalyzerError('timeout', 'El analisis supero el tiempo de espera.', 408)
        }
        const body = error.data as ApiErrorBody | null
        return new CvAnalyzerError(
            body?.error?.code ?? 'internal_error',
            body?.error?.message ?? `El servicio de analisis respondio ${error.status}.`,
            error.status,
            body?.error?.details ?? {},
        )
    }

    return new CvAnalyzerError(
        'network_error',
        'No se pudo contactar con el servicio de analisis de CV.',
        0,
        { reason: String(error) },
    )
}

/** La cancelacion del llamante no es un fallo: se propaga tal cual. */
export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError'
}

async function send<T>(path: string, body: FormData, signal?: AbortSignal): Promise<T> {
    try {
        return await http.postForm<T>(`${API_PREFIX}${path}`, body, {
            baseUrl: BASE_URL,
            signal,
            timeoutMs: ANALYSIS_TIMEOUT_MS,
        })
    } catch (error) {
        if (isAbortError(error)) throw error
        throw toCvAnalyzerError(error)
    }
}

export const cvAnalyzerService = {
    /** Perfil estructurado + analisis del candidato, sin evaluar aptitud. */
    analyze: (file: File, signal?: AbortSignal) => {
        const body = new FormData()
        body.append('file', file)
        return send<CvAnalysisResponse>('/analyze', body, signal)
    },

    /** Analiza el CV y lo evalua contra el perfil buscado. */
    evaluate: (file: File, requirements: JobRequirements, signal?: AbortSignal) => {
        const body = new FormData()
        body.append('file', file)
        // El backend espera un string JSON en este campo del formulario.
        body.append('requirements', JSON.stringify(requirements))
        return send<CvEvaluationResponse>('/evaluate', body, signal)
    },

    /** Formatos y tamano maximo admitidos, para validar antes de subir. */
    getFormats: async (signal?: AbortSignal): Promise<SupportedFormats> => {
        try {
            return await http.get<SupportedFormats>(`${API_PREFIX}/formats`, {
                baseUrl: BASE_URL,
                signal,
                timeoutMs: 10_000,
            })
        } catch (error) {
            if (isAbortError(error)) throw error
            throw toCvAnalyzerError(error)
        }
    },
}

/** Formatos por defecto mientras la API no responde (o si esta caida). */
export const DEFAULT_FORMATS: SupportedFormats = {
    allowed_extensions: ['.pdf', '.docx', '.md', '.txt'],
    max_file_size_mb: 10,
}

/**
 * True si hay al menos un criterio evaluable. Sin criterios, `/evaluate`
 * responde 422 invalid_requirements: en ese caso hay que llamar a `/analyze`.
 */
export function hasEvaluableRequirements(requirements: JobRequirements): boolean {
    const lists = [
        requirements.required_skills,
        requirements.nice_to_have_skills,
        requirements.required_technologies,
        requirements.nice_to_have_technologies,
        requirements.required_education,
        requirements.nice_to_have_education,
        requirements.required_certifications,
        requirements.nice_to_have_certifications,
        requirements.required_languages,
    ]

    return (
        lists.some((list) => (list?.length ?? 0) > 0) ||
        requirements.min_years_experience != null ||
        requirements.min_seniority != null
    )
}

/** Valida en el navegador para no gastar una subida en vano. */
export function validateCvFile(file: File, formats: SupportedFormats): string | null {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!formats.allowed_extensions.includes(extension)) {
        return `Formato no soportado (${formats.allowed_extensions.join(', ')}).`
    }
    if (file.size === 0) return 'El archivo esta vacio.'
    if (file.size > formats.max_file_size_mb * 1024 * 1024) {
        return `Supera los ${formats.max_file_size_mb} MB permitidos.`
    }
    return null
}
