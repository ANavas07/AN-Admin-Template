/**
 * Contrato del servicio de analisis de CV (FastAPI) + tipos del modulo.
 *
 * Los campos de la API van en snake_case porque es tal cual como viaja el JSON.
 * Casi todo el perfil es null-able a proposito: si un dato no esta en el CV, la
 * API devuelve `null` o lista vacia en vez de inventarlo.
 */

// ── Perfil del candidato ─────────────────────────────────────────────────────

export interface Education {
  institution: string | null
  degree: string | null
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
}

export interface Experience {
  company: string | null
  position: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean | null
  description: string | null
  technologies: string[]
}

export interface Certification {
  name: string | null
  issuer: string | null
  date: string | null
}

export interface LanguageSkill {
  name: string | null
  level: string | null
}

export interface CandidateProfile {
  name: string | null
  email: string | null
  phone: string | null
  location: string | null
  headline: string | null
  summary: string | null
  education: Education[]
  experience: Experience[]
  skills: string[]
  technologies: string[]
  certifications: Certification[]
  languages: LanguageSkill[]
}

// ── Analisis ─────────────────────────────────────────────────────────────────

export type SeniorityLevel =
  | 'unknown'
  | 'intern'
  | 'junior'
  | 'intermediate'
  | 'senior'
  | 'lead'
  | 'executive'

export interface ProfileAnalysis {
  professional_profile: string | null
  seniority: SeniorityLevel
  years_of_experience: number | null
  summary: string | null
  strengths: string[]
  areas_to_verify: string[]
}

export interface AnalysisMetadata {
  file_name: string
  file_extension: string
  characters_extracted: number
  llm_model: string
  /** Avisos no bloqueantes: datos ausentes, evidencia descartada, texto truncado. */
  warnings: string[]
}

// ── Perfil buscado (parametrizacion de la vacante) ───────────────────────────

export interface LanguageRequirement {
  name: string
  min_level?: string | null
  required?: boolean
}

export interface RequirementWeights {
  skills?: number
  technologies?: number
  experience?: number
  education?: number
  languages?: number
  certifications?: number
}

/** Al menos un criterio evaluable, o la API responde 422 invalid_requirements. */
export interface JobRequirements {
  title?: string | null
  description?: string | null
  required_skills?: string[]
  nice_to_have_skills?: string[]
  required_technologies?: string[]
  nice_to_have_technologies?: string[]
  min_years_experience?: number | null
  min_seniority?: Exclude<SeniorityLevel, 'unknown'> | null
  required_education?: string[]
  nice_to_have_education?: string[]
  required_certifications?: string[]
  nice_to_have_certifications?: string[]
  required_languages?: LanguageRequirement[]
  /** Nota minima (0-100) para el veredicto `apto`. Por defecto 70. */
  minimum_score?: number
  /** Margen bajo el umbral que da `apto_con_reservas`. Por defecto 15. */
  review_margin?: number
  /** Si un excluyente sin acreditar bloquea el `apto`. Por defecto true. */
  require_all_mandatory?: boolean
  weights?: RequirementWeights
}

// ── Evaluacion ───────────────────────────────────────────────────────────────

export type RequirementCategory =
  | 'skill'
  | 'technology'
  | 'experience'
  | 'education'
  | 'language'
  | 'certification'

export type RequirementStatus = 'met' | 'partial' | 'not_found'

export type FitVerdict = 'apto' | 'apto_con_reservas' | 'no_apto'

export interface RequirementResult {
  requirement_id: string
  requirement: string
  category: RequirementCategory
  required: boolean
  weight: number
  status: RequirementStatus
  /** Fragmento literal del CV. `null` si no hubo evidencia o no era literal. */
  evidence: string | null
}

export interface CategoryScore {
  category: RequirementCategory
  score: number
  weight: number
  requirements_met: number
  requirements_total: number
}

export interface FitEvaluation {
  /** `true` solo con veredicto `apto`. */
  is_suitable: boolean
  verdict: FitVerdict
  score: number
  minimum_score: number
  job_title: string | null
  missing_required: string[]
  missing_nice_to_have: string[]
  category_scores: CategoryScore[]
  requirements: RequirementResult[]
  rationale: string
}

// ── Respuestas ───────────────────────────────────────────────────────────────

export interface CvAnalysisResponse {
  candidate: CandidateProfile
  analysis: ProfileAnalysis
  metadata: AnalysisMetadata
}

export interface CvEvaluationResponse extends CvAnalysisResponse {
  evaluation: FitEvaluation
}

export interface SupportedFormats {
  allowed_extensions: string[]
  max_file_size_mb: number
}

/** Codigos estables del backend; sirven para ramificar en la UI. */
export type CvErrorCode =
  | 'unsupported_file_type'
  | 'file_too_large'
  | 'empty_document'
  | 'document_extraction_failed'
  | 'profile_validation_failed'
  | 'insufficient_information'
  | 'invalid_requirements'
  | 'invalid_request'
  | 'llm_error'
  | 'http_error'
  | 'internal_error'
  // Los dos siguientes los genera el cliente, no el backend.
  | 'timeout'
  | 'network_error'

// ── Modelo del modulo (UI) ───────────────────────────────────────────────────

export type CvStatus = 'pending' | 'analyzing' | 'completed' | 'error'

/** Un CV cargado dentro de un cargo, con el resultado del analisis si ya llego. */
export interface CandidateCv {
  id: string
  fileName: string
  candidateName: string
  uploadedAt: string
  size: number
  status: CvStatus
  /** Nota de aptitud (0-100). `null` si el cargo no define requisitos. */
  score: number | null
  verdict: FitVerdict | null
  analysis: ProfileAnalysis | null
  candidate: CandidateProfile | null
  evaluation: FitEvaluation | null
  warnings: string[]
  /** Mensaje de error del analisis, si fallo. */
  error: string | null
  errorCode: CvErrorCode | null
}

/** Cargo de postulacion: descripcion + los requisitos contra los que se evalua. */
export interface JobPosting {
  id: string
  title: string
  department: string
  description: string
  createdAt: string
  requirements: JobRequirements
  cvs: CandidateCv[]
}
