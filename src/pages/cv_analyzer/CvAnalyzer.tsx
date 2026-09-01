import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import ModuleHeader from '../../components/common/page/ModuleHeader'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../components/ui/inputs/InputComponent'
import TableTS from '../../components/ui/table/TableTs'
import { CheckIcon, FileDocIcon, PlusIcon, SparkIcon, TrashBinIcon, UploadIcon, UsersIcon } from '../../icons/icons'
import {
    DEFAULT_FORMATS,
    CvAnalyzerError,
    cvAnalyzerService,
    hasEvaluableRequirements,
    isAbortError,
    validateCvFile,
} from '../../services/cv_analyzer/cvanalyzer.service'
import type {
    CandidateCv,
    CvAnalysisResponse,
    CvStatus,
    FitEvaluation,
    FitVerdict,
    JobPosting,
    JobRequirements,
    RequirementResult,
    RequirementStatus,
    SupportedFormats,
} from './types'

const initialJobs: JobPosting[] = [
    {
        id: 'job-frontend',
        title: 'Frontend React Developer',
        department: 'Tecnologia',
        description: 'Construccion de interfaces administrativas con React, TypeScript y Tailwind.',
        createdAt: '2026-08-20',
        requirements: {
            title: 'Frontend React Developer',
            required_technologies: ['React', 'TypeScript'],
            nice_to_have_technologies: ['Tailwind', 'Vite'],
            required_skills: ['Componentes reutilizables'],
            min_years_experience: 2,
            minimum_score: 70,
        },
        cvs: [],
    },
    {
        id: 'job-rrhh',
        title: 'Analista de Talento Humano',
        department: 'RRHH',
        description: 'Gestion de reclutamiento, entrevistas y seguimiento de candidatos.',
        createdAt: '2026-08-24',
        requirements: {
            title: 'Analista de Talento Humano',
            required_skills: ['Reclutamiento', 'Entrevistas por competencias'],
            minimum_score: 70,
        },
        cvs: [],
    },
]

const STATUS_LABEL: Record<CvStatus, string> = {
    pending: 'En cola',
    analyzing: 'Analizando',
    completed: 'Analizado',
    error: 'Con error',
}

const STATUS_CLASSES: Record<CvStatus, string> = {
    pending: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300',
    analyzing: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300',
    completed: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300',
    error: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300',
}

const VERDICT_LABEL: Record<FitVerdict, string> = {
    apto: 'Apto',
    apto_con_reservas: 'Apto con reservas',
    no_apto: 'No apto',
}

const VERDICT_CLASSES: Record<FitVerdict, string> = {
    apto: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    apto_con_reservas: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300',
    no_apto: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300',
}

const REQUIREMENT_STATUS_LABEL: Record<RequirementStatus, string> = {
    met: 'Cumple',
    partial: 'Parcial',
    not_found: 'Sin evidencia',
}

const REQUIREMENT_STATUS_CLASSES: Record<RequirementStatus, string> = {
    met: 'border-l-emerald-500',
    partial: 'border-l-amber-500',
    not_found: 'border-l-rose-500',
}

const SENIORITY_LABEL: Record<string, string> = {
    unknown: 'Sin determinar',
    intern: 'Practicante',
    junior: 'Junior',
    intermediate: 'Intermedio',
    senior: 'Senior',
    lead: 'Lead',
    executive: 'Directivo',
}

function formatBytes(bytes: number) {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
    return `${bytes} B`
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: value.includes('T') ? 'short' : undefined,
    }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`))
}

/** Nombre provisional a partir del archivo; se reemplaza por el que extraiga la IA. */
function getCandidateName(fileName: string) {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, '')
    return withoutExtension
        .split(/[-_.\s]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
        .join(' ') || 'Candidato sin nombre'
}

/** "React, TypeScript , ,Vite" -> ["React", "TypeScript", "Vite"] */
function toList(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

function createQueuedCv(file: File, index: number): CandidateCv {
    return {
        id: `cv-${Date.now()}-${index}`,
        fileName: file.name,
        candidateName: getCandidateName(file.name),
        uploadedAt: new Date().toISOString(),
        size: file.size,
        status: 'pending',
        score: null,
        verdict: null,
        analysis: null,
        candidate: null,
        evaluation: null,
        warnings: [],
        error: null,
        errorCode: null,
    }
}

function ScoreBadge({ score }: { score: number | null }) {
    if (score === null) {
        return <span className="text-xs text-(--color-text-muted)">Sin requisitos</span>
    }

    const classes =
        score >= 85
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300'
            : score >= 70
                ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300'
                : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300'

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
            {score}%
        </span>
    )
}

function StatusPill({ status }: { status: CvStatus }) {
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_CLASSES[status]}`}>
            {STATUS_LABEL[status]}
        </span>
    )
}

function VerdictPill({ verdict }: { verdict: FitVerdict }) {
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${VERDICT_CLASSES[verdict]}`}>
            {VERDICT_LABEL[verdict]}
        </span>
    )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {icon}
            </span>
            <div>
                <p className="text-2xl font-bold leading-7 text-(--color-text)">{value}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">{label}</p>
            </div>
        </div>
    )
}

function RequirementRow({ requirement }: { requirement: RequirementResult }) {
    return (
        <li className={`rounded-md border border-(--color-border) border-l-4 px-3 py-2 ${REQUIREMENT_STATUS_CLASSES[requirement.status]}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-(--color-text)">{requirement.requirement}</span>
                <span className="rounded-full bg-(--color-bg-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-muted)">
                    {REQUIREMENT_STATUS_LABEL[requirement.status]}
                </span>
                {requirement.required ? (
                    <span className="rounded-full bg-(--color-bg-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-muted)">
                        Excluyente
                    </span>
                ) : null}
            </div>
            {/* Evidencia literal del CV; null cuando el modelo no pudo citarla. */}
            {requirement.evidence ? (
                <blockquote className="mt-1 border-l-2 border-(--color-border) pl-2 text-xs italic text-(--color-text-muted)">
                    {requirement.evidence}
                </blockquote>
            ) : null}
        </li>
    )
}

function RequirementChips({ requirements }: { requirements: JobRequirements }) {
    const chips = [
        ...(requirements.required_technologies ?? []).map((item) => ({ label: item, required: true })),
        ...(requirements.required_skills ?? []).map((item) => ({ label: item, required: true })),
        ...(requirements.nice_to_have_technologies ?? []).map((item) => ({ label: item, required: false })),
        ...(requirements.nice_to_have_skills ?? []).map((item) => ({ label: item, required: false })),
    ]

    if (!chips.length) {
        return (
            <p className="text-xs text-(--color-text-muted)">
                Sin requisitos definidos: los CVs solo se analizan, no se evaluan.
            </p>
        )
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
                <span
                    key={`${chip.label}-${chip.required}`}
                    className={[
                        'rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                        chip.required
                            ? 'bg-brand-soft text-brand ring-brand/20'
                            : 'bg-(--color-bg-soft) text-(--color-text-muted) ring-(--color-border)',
                    ].join(' ')}
                >
                    {chip.label}
                </span>
            ))}
        </div>
    )
}

export default function CvAnalyzer() {
    const [jobs, setJobs] = useState<JobPosting[]>(initialJobs)
    const [selectedJobId, setSelectedJobId] = useState(initialJobs[0]?.id ?? '')
    const [formats, setFormats] = useState<SupportedFormats>(DEFAULT_FORMATS)
    const [title, setTitle] = useState('')
    const [department, setDepartment] = useState('')
    const [description, setDescription] = useState('')
    const [requiredTech, setRequiredTech] = useState('')
    const [niceToHaveTech, setNiceToHaveTech] = useState('')
    const [requiredSkills, setRequiredSkills] = useState('')
    const [minYears, setMinYears] = useState('')
    const [minimumScore, setMinimumScore] = useState('70')
    const [isDragActive, setIsDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const controllersRef = useRef<Set<AbortController>>(new Set())

    // Formatos reales del backend; si no responde se usan los de por defecto.
    useEffect(() => {
        const controller = new AbortController()
        cvAnalyzerService
            .getFormats(controller.signal)
            .then(setFormats)
            .catch(() => setFormats(DEFAULT_FORMATS))
        return () => controller.abort()
    }, [])

    // Un analisis tarda cerca de un minuto: al salir de la pantalla se cancela.
    useEffect(() => {
        const controllers = controllersRef.current
        return () => {
            controllers.forEach((controller) => controller.abort())
            controllers.clear()
        }
    }, [])

    const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]
    const totalCvs = jobs.reduce((sum, job) => sum + job.cvs.length, 0)
    const scoredCvs = selectedJob?.cvs.filter((cv) => cv.score !== null) ?? []
    const averageScore = scoredCvs.length
        ? Math.round(scoredCvs.reduce((sum, cv) => sum + (cv.score ?? 0), 0) / scoredCvs.length)
        : 0
    const bestCandidate = scoredCvs.reduce<CandidateCv | null>(
        (best, cv) => (!best || (cv.score ?? 0) > (best.score ?? 0) ? cv : best),
        null
    )
    const analyzingCount = jobs.reduce(
        (sum, job) => sum + job.cvs.filter((cv) => cv.status === 'analyzing' || cv.status === 'pending').length,
        0
    )

    const updateCv = useCallback((jobId: string, cvId: string, patch: Partial<CandidateCv>) => {
        setJobs((currentJobs) =>
            currentJobs.map((job) =>
                job.id !== jobId
                    ? job
                    : { ...job, cvs: job.cvs.map((cv) => (cv.id === cvId ? { ...cv, ...patch } : cv)) }
            )
        )
    }, [])

    function createJob() {
        const cleanTitle = title.trim()
        if (!cleanTitle) return

        const cleanDescription = description.trim()
        const requirements: JobRequirements = {
            title: cleanTitle,
            description: cleanDescription || null,
            required_technologies: toList(requiredTech),
            nice_to_have_technologies: toList(niceToHaveTech),
            required_skills: toList(requiredSkills),
            min_years_experience: minYears.trim() ? Number(minYears) : null,
            minimum_score: minimumScore.trim() ? Number(minimumScore) : 70,
        }

        const newJob: JobPosting = {
            id: `job-${Date.now()}`,
            title: cleanTitle,
            department: department.trim() || 'Sin area',
            description: cleanDescription || 'Cargo creado para analizar postulaciones.',
            createdAt: new Date().toISOString().slice(0, 10),
            requirements,
            cvs: [],
        }

        setJobs((currentJobs) => [newJob, ...currentJobs])
        setSelectedJobId(newJob.id)
        setTitle('')
        setDepartment('')
        setDescription('')
        setRequiredTech('')
        setNiceToHaveTech('')
        setRequiredSkills('')
        setMinYears('')
        setMinimumScore('70')
    }

    /**
     * Los CVs se procesan de uno en uno: cada analisis son varias llamadas al
     * LLM y lanzarlos en paralelo solo consigue timeouts.
     */
    async function analyzeFiles(files: File[], job: JobPosting) {
        const queued = files.map((file, index) => ({ file, cv: createQueuedCv(file, index) }))

        setJobs((currentJobs) =>
            currentJobs.map((item) =>
                item.id === job.id ? { ...item, cvs: [...queued.map((entry) => entry.cv), ...item.cvs] } : item
            )
        )

        const evaluates = hasEvaluableRequirements(job.requirements)

        for (const { file, cv } of queued) {
            const fileError = validateCvFile(file, formats)
            if (fileError) {
                updateCv(job.id, cv.id, { status: 'error', error: fileError, errorCode: 'unsupported_file_type' })
                continue
            }

            updateCv(job.id, cv.id, { status: 'analyzing' })
            const controller = new AbortController()
            controllersRef.current.add(controller)

            try {
                // `evaluation` solo llega cuando el cargo define requisitos.
                const result: CvAnalysisResponse & { evaluation?: FitEvaluation } = evaluates
                    ? await cvAnalyzerService.evaluate(file, job.requirements, controller.signal)
                    : await cvAnalyzerService.analyze(file, controller.signal)
                const evaluation = result.evaluation ?? null

                updateCv(job.id, cv.id, {
                    status: 'completed',
                    candidateName: result.candidate.name ?? cv.candidateName,
                    candidate: result.candidate,
                    analysis: result.analysis,
                    evaluation,
                    score: evaluation ? Math.round(evaluation.score) : null,
                    verdict: evaluation ? evaluation.verdict : null,
                    warnings: result.metadata.warnings,
                })
            } catch (error) {
                // Salir de la pantalla aborta la peticion: no es un fallo que mostrar.
                if (isAbortError(error)) return
                const apiError = error instanceof CvAnalyzerError ? error : null
                updateCv(job.id, cv.id, {
                    status: 'error',
                    error: apiError?.message ?? 'No se pudo analizar el CV.',
                    errorCode: apiError?.code ?? 'internal_error',
                })
            } finally {
                controllersRef.current.delete(controller)
            }
        }
    }

    function addFiles(fileList: FileList | null) {
        if (!fileList?.length || !selectedJob) return
        void analyzeFiles(Array.from(fileList), selectedJob)
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        addFiles(event.target.files)
        event.target.value = ''
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault()
        setIsDragActive(false)
        addFiles(event.dataTransfer.files)
    }

    const removeCv = useCallback((cvId: string) => {
        setJobs((currentJobs) =>
            currentJobs.map((job) => ({ ...job, cvs: job.cvs.filter((cv) => cv.id !== cvId) }))
        )
    }, [])

    const columns: ColumnDef<CandidateCv>[] = useMemo(
        () => [
            {
                accessorKey: 'candidateName',
                header: 'Candidato',
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="font-semibold text-(--color-text)">{row.original.candidateName}</p>
                        <p className="text-xs text-(--color-text-muted)">{row.original.fileName}</p>
                    </div>
                ),
            },
            {
                accessorKey: 'score',
                header: 'Afinidad',
                cell: ({ row }) => <ScoreBadge score={row.original.score} />,
            },
            {
                accessorKey: 'verdict',
                header: 'Veredicto',
                cell: ({ row }) =>
                    row.original.verdict ? (
                        <VerdictPill verdict={row.original.verdict} />
                    ) : (
                        <span className="text-xs text-(--color-text-muted)">—</span>
                    ),
            },
            {
                accessorKey: 'status',
                header: 'Estado',
                cell: ({ row }) => <StatusPill status={row.original.status} />,
            },
            {
                accessorKey: 'size',
                header: 'Archivo',
                cell: ({ row }) => (
                    <span className="text-(--color-text-muted)">{formatBytes(row.original.size)}</span>
                ),
            },
            {
                accessorKey: 'uploadedAt',
                header: 'Carga',
                cell: ({ getValue }) => (
                    <span className="text-(--color-text-muted)">{formatDate(getValue<string>())}</span>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => (
                    <ButtonComponent
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCv(row.original.id)}
                        aria-label={`Eliminar ${row.original.fileName}`}
                        title="Eliminar CV"
                    >
                        <TrashBinIcon className="size-5 text-rose-600 dark:text-rose-300" />
                    </ButtonComponent>
                ),
            },
        ],
        [removeCv]
    )

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg)">
            <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-8 2xl:px-12">
                <ModuleHeader
                    eyebrow="RRHH talentos"
                    title="Analizador de curriculums"
                    description="Crea un cargo con sus requisitos, sube los CVs y el servicio de IA devuelve el perfil del candidato y si es apto, con la evidencia de cada requisito."
                    actions={
                        <ButtonComponent
                            variant="outline"
                            leftIcon={<UploadIcon className="size-5" />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!selectedJob}
                        >
                            Subir CV
                        </ButtonComponent>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatTile icon={<UsersIcon className="size-5" />} label="Cargos activos" value={jobs.length} />
                    <StatTile icon={<FileDocIcon className="size-5" />} label="CVs cargados" value={totalCvs} />
                    <StatTile icon={<SparkIcon className="size-5" />} label="Afinidad promedio" value={`${averageScore}%`} />
                </div>

                {/* La columna de cargos se mantiene fija: el ancho extra va a la tabla. */}
                <div className="grid gap-6 xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
                    <aside className="space-y-4">
                        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-(--color-text)">Nuevo cargo</h2>
                            <div className="mt-4 space-y-3">
                                <InputComponent
                                    label="Cargo"
                                    placeholder="Ej. Backend Developer"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    requiredMark
                                />
                                <InputComponent
                                    label="Area"
                                    placeholder="Ej. Tecnologia"
                                    value={department}
                                    onChange={(event) => setDepartment(event.target.value)}
                                />
                                <InputComponent
                                    label="Descripcion breve"
                                    placeholder="Responsabilidades principales"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                                <InputComponent
                                    label="Tecnologias excluyentes"
                                    placeholder="Python, PostgreSQL"
                                    hint="Separadas por coma"
                                    value={requiredTech}
                                    onChange={(event) => setRequiredTech(event.target.value)}
                                />
                                <InputComponent
                                    label="Tecnologias deseables"
                                    placeholder="Docker, AWS"
                                    value={niceToHaveTech}
                                    onChange={(event) => setNiceToHaveTech(event.target.value)}
                                />
                                <InputComponent
                                    label="Skills excluyentes"
                                    placeholder="Diseno de APIs REST"
                                    value={requiredSkills}
                                    onChange={(event) => setRequiredSkills(event.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <InputComponent
                                        label="Anios minimos"
                                        type="number"
                                        min={0}
                                        placeholder="3"
                                        value={minYears}
                                        onChange={(event) => setMinYears(event.target.value)}
                                    />
                                    <InputComponent
                                        label="Nota minima"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={minimumScore}
                                        onChange={(event) => setMinimumScore(event.target.value)}
                                    />
                                </div>
                                <ButtonComponent
                                    fullWidth
                                    leftIcon={<PlusIcon className="size-5" />}
                                    onClick={createJob}
                                    disabled={!title.trim()}
                                >
                                    Crear cargo
                                </ButtonComponent>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
                            <div className="border-b border-(--color-border) px-5 py-4">
                                <h2 className="text-base font-semibold text-(--color-text)">Cargos</h2>
                            </div>
                            <div className="divide-y divide-(--color-border)">
                                {jobs.map((job) => {
                                    const isSelected = job.id === selectedJob?.id

                                    return (
                                        <button
                                            key={job.id}
                                            type="button"
                                            onClick={() => setSelectedJobId(job.id)}
                                            className={[
                                                'w-full px-5 py-4 text-left transition-colors',
                                                isSelected ? 'bg-brand-soft' : 'hover:bg-(--color-bg-soft)',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-(--color-text)">
                                                        {job.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-(--color-text-muted)">
                                                        {job.department} · {job.cvs.length} CVs
                                                    </p>
                                                </div>
                                                {isSelected ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand" /> : null}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    </aside>

                    <main className="space-y-6">
                        {selectedJob ? (
                            <>
                                <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                                                Cargo seleccionado
                                            </p>
                                            <h2 className="mt-1 text-xl font-bold text-(--color-text)">
                                                {selectedJob.title}
                                            </h2>
                                            <p className="mt-1 text-sm text-(--color-text-muted)">
                                                {selectedJob.description}
                                            </p>
                                            <div className="mt-3">
                                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                                                    Perfil buscado
                                                </p>
                                                <RequirementChips requirements={selectedJob.requirements} />
                                            </div>
                                            <p className="mt-3 text-xs text-(--color-text-muted)">
                                                Creado el {formatDate(selectedJob.createdAt)}
                                                {selectedJob.requirements.minimum_score
                                                    ? ` · nota minima ${selectedJob.requirements.minimum_score}%`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="shrink-0 rounded-xl border border-(--color-border) bg-(--color-bg-soft) px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                                                Mejor candidato
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-(--color-text)">
                                                {bestCandidate
                                                    ? `${bestCandidate.candidateName} (${bestCandidate.score}%)`
                                                    : 'Sin CVs analizados'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section
                                    onDrop={handleDrop}
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setIsDragActive(true)
                                    }}
                                    onDragLeave={() => setIsDragActive(false)}
                                    className={[
                                        'flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all',
                                        isDragActive
                                            ? 'border-brand bg-brand-soft shadow-md'
                                            : 'border-(--color-border) bg-(--color-surface) shadow-sm',
                                    ].join(' ')}
                                >
                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                                        <UploadIcon className="size-6" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-(--color-text)">
                                            Arrastra curriculums para analizarlos
                                        </p>
                                        <p className="mt-1 text-xs text-(--color-text-muted)">
                                            {formats.allowed_extensions.join(', ')} · hasta {formats.max_file_size_mb} MB.
                                            Cada CV tarda cerca de un minuto.
                                        </p>
                                    </div>
                                    <ButtonComponent variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        Seleccionar archivos
                                    </ButtonComponent>
                                    {analyzingCount > 0 ? (
                                        <p className="text-xs font-medium text-brand">
                                            Analizando {analyzingCount} {analyzingCount === 1 ? 'CV' : 'CVs'}...
                                        </p>
                                    ) : null}
                                </section>

                                <TableTS<CandidateCv>
                                    data={selectedJob.cvs}
                                    columns={columns}
                                    enableSorting
                                    enableFiltering
                                    enablePagination
                                    enableExpanding
                                    pageSize={6}
                                    existBtn={false}
                                    emptyMessage="Aun no hay curriculums para este cargo."
                                    renderExpandedRowModel={(cv) => <CvDetail cv={cv} />}
                                />
                            </>
                        ) : null}
                    </main>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={formats.allowed_extensions.join(',')}
                    className="hidden"
                    onChange={handleInputChange}
                    aria-label="Seleccionar curriculums"
                />
            </div>
        </div>
    )
}

function CvDetail({ cv }: { cv: CandidateCv }) {
    if (cv.status === 'error') {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{cv.error}</p>
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">codigo: {cv.errorCode}</p>
            </div>
        )
    }

    if (cv.status !== 'completed' || !cv.analysis) {
        return (
            <p className="text-sm text-(--color-text-muted)">
                Analizando el documento y evaluando los requisitos...
            </p>
        )
    }

    const { analysis, candidate, evaluation } = cv

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                            Perfil identificado
                        </p>
                        <p className="mt-1 text-sm font-semibold text-(--color-text)">
                            {analysis.professional_profile ?? 'No identificado'}
                            <span className="ml-2 font-normal text-(--color-text-muted)">
                                {SENIORITY_LABEL[analysis.seniority] ?? analysis.seniority}
                                {analysis.years_of_experience !== null
                                    ? ` · ${analysis.years_of_experience} anios`
                                    : ''}
                            </span>
                        </p>
                        {analysis.summary ? (
                            <p className="mt-1 text-sm text-(--color-text-muted)">{analysis.summary}</p>
                        ) : null}
                        {candidate ? (
                            <p className="mt-1 text-xs text-(--color-text-muted)">
                                {candidate.email ?? 'Sin email'} · {candidate.phone ?? 'Sin telefono'}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                            Fortalezas detectadas
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-(--color-text)">
                            {analysis.strengths.length ? (
                                analysis.strengths.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                        {item}
                                    </li>
                                ))
                            ) : (
                                <li className="text-(--color-text-muted)">Sin fortalezas destacadas.</li>
                            )}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                            Puntos por validar
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-(--color-text)">
                            {analysis.areas_to_verify.length ? (
                                analysis.areas_to_verify.map((item) => <li key={item}>{item}</li>)
                            ) : (
                                <li className="text-(--color-text-muted)">Sin observaciones.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="space-y-3">
                    {evaluation ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <VerdictPill verdict={evaluation.verdict} />
                                <span className="text-sm font-semibold text-(--color-text)">
                                    {evaluation.score}%
                                </span>
                                <span className="text-xs text-(--color-text-muted)">
                                    umbral {evaluation.minimum_score}%
                                </span>
                            </div>
                            <p className="text-sm text-(--color-text-muted)">{evaluation.rationale}</p>
                            {evaluation.missing_required.length ? (
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                                    Excluyentes sin acreditar: {evaluation.missing_required.join(', ')}
                                </p>
                            ) : null}
                            <ul className="space-y-1.5">
                                {evaluation.requirements.map((requirement) => (
                                    <RequirementRow key={requirement.requirement_id} requirement={requirement} />
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="text-sm text-(--color-text-muted)">
                            Este cargo no define requisitos, por eso el CV se analizo sin evaluar aptitud.
                        </p>
                    )}
                </div>
            </div>

            {cv.warnings.length ? (
                <details className="text-xs text-(--color-text-muted)">
                    <summary className="cursor-pointer font-semibold">
                        Avisos del analisis ({cv.warnings.length})
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                        {cv.warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                        ))}
                    </ul>
                </details>
            ) : null}
        </div>
    )
}
