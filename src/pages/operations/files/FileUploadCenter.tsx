import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import { formatBytes } from '../../../utils/format'
import { FileDocIcon, TrashBinIcon, UploadIcon, CheckIcon } from '../../../icons/icons'
import { toneTint } from '../../../components/ui/tone'
import type { Tone } from '../../../components/ui/tone'

type UploadStatus = 'uploading' | 'complete'

type UploadedFile = {
    id: string
    name: string
    size: number
    uploadedAt: string
    status: UploadStatus
    progress: number
}

const initialFiles: UploadedFile[] = [
    { id: 'f-01', name: 'reglamento-interno-2026.pdf', size: 1_240_000, uploadedAt: '2026-06-12T10:24:00', status: 'complete', progress: 100 },
    { id: 'f-02', name: 'presupuesto-anual.xlsx', size: 486_000, uploadedAt: '2026-06-18T15:02:00', status: 'complete', progress: 100 },
    { id: 'f-03', name: 'organigrama.png', size: 2_830_000, uploadedAt: '2026-06-25T09:40:00', status: 'complete', progress: 100 },
]

/** File types are told apart with categorical tones. */
const extensionTones: Record<string, Tone> = {
    pdf: 'rose',
    doc: 'sky',
    docx: 'sky',
    xls: 'emerald',
    xlsx: 'emerald',
    csv: 'emerald',
    png: 'violet',
    jpg: 'violet',
    jpeg: 'violet',
    svg: 'violet',
}

function getExtension(fileName: string) {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'file'
}

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })
const formatDate = (isoDate: string) => dateFormatter.format(new Date(isoDate))

/** Operations › Documents: upload files and follow their progress. */
export default function FileUploadCenter() {
    const [files, setFiles] = useState<UploadedFile[]>(initialFiles)
    const [isDragActive, setIsDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const timersRef = useRef<number[]>([])

    // Stop any in-flight simulated uploads when leaving the page
    useEffect(() => {
        const timers = timersRef.current
        return () => timers.forEach((timer) => window.clearInterval(timer))
    }, [])

    function simulateUpload(fileId: string) {
        const timer = window.setInterval(() => {
            setFiles((currentFiles) =>
                currentFiles.map((file) => {
                    if (file.id !== fileId || file.status === 'complete') return file

                    const nextProgress = Math.min(file.progress + 8 + Math.round(Math.random() * 14), 100)

                    if (nextProgress >= 100) {
                        window.clearInterval(timer)
                        return { ...file, progress: 100, status: 'complete' }
                    }

                    return { ...file, progress: nextProgress }
                })
            )
        }, 180)

        timersRef.current.push(timer)
    }

    function addFiles(incoming: FileList | null) {
        if (!incoming || incoming.length === 0) return

        const newEntries: UploadedFile[] = Array.from(incoming).map((file, index) => ({
            id: `f-${Date.now()}-${index}`,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            status: 'uploading',
            progress: 0,
        }))

        setFiles((currentFiles) => [...newEntries, ...currentFiles])
        newEntries.forEach((entry) => simulateUpload(entry.id))
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault()
        setIsDragActive(false)
        addFiles(event.dataTransfer.files)
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault()
        setIsDragActive(true)
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        addFiles(event.target.files)
        event.target.value = ''
    }

    function removeFile(fileId: string) {
        setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId))
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    return (
        <PageContainer>
                <ModuleHeader
                    eyebrow="Operación"
                    title="Documentos"
                    description="Sube archivos para compartirlos con tu equipo y sigue el avance de cada carga."
                    actions={
                        <ButtonComponent leftIcon={<UploadIcon className="size-4" />} onClick={() => fileInputRef.current?.click()}>
                            Subir archivos
                        </ButtonComponent>
                    }
                />

                {/* The list is the main content; the drop zone is a compact band above it */}
                <div className="space-y-4">
                    <section aria-label="Subir archivos">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={() => setIsDragActive(false)}
                            className={[
                                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-6 text-center transition-all duration-200 sm:flex-row sm:gap-4 sm:text-left',
                                isDragActive
                                    ? 'scale-[1.01] border-brand bg-brand-soft shadow-lg'
                                    : 'border-line bg-surface shadow-sm',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
                                    isDragActive ? 'bg-brand-solid text-on-solid' : 'bg-brand-soft text-brand-strong',
                                ].join(' ')}
                            >
                                <UploadIcon className="size-5" />
                            </span>

                            <div className="sm:flex-1">
                                <p className="text-sm font-semibold text-fg">
                                    {isDragActive ? 'Suelta para subir' : 'Arrastra archivos aquí'}
                                </p>
                                <p className="mt-0.5 text-xs text-fg-muted">PDF, Office, imágenes o cualquier otro formato.</p>
                            </div>

                            <ButtonComponent variant="outline" onClick={() => fileInputRef.current?.click()}>
                                Elegir del equipo
                            </ButtonComponent>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleInputChange}
                                aria-label="Elegir archivos para subir"
                            />
                        </div>
                    </section>

                    {/* File list */}
                    <section aria-label="Archivos subidos">
                        <div className="overflow-hidden card">
                            <div className="flex items-center justify-between border-b border-line px-5 py-4">
                                <h2 className="text-sm font-semibold text-fg">
                                    Archivos
                                </h2>
                                <span className="rounded-full border border-line bg-canvas-subtle px-3 py-1 text-xs font-semibold text-fg-muted">
                                    {files.length} {files.length === 1 ? 'archivo' : 'archivos'} · {formatBytes(totalSize)}
                                </span>
                            </div>

                            {files.length === 0 ? (
                                <EmptyState
                                    icon={<FileDocIcon className="size-5" />}
                                    title="Aún no hay archivos"
                                    description="Arrástralos a la zona de arriba o usa «Subir archivos»."
                                />
                            ) : (
                                <ul className="divide-y divide-line">
                                    {files.map((file) => {
                                        const extension = getExtension(file.name)
                                        return (
                                            <li key={file.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-canvas-subtle/50">
                                                <span
                                                    className={[
                                                        'inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-3xs font-bold uppercase',
                                                        toneTint[extensionTones[extension] ?? 'neutral'],
                                                    ].join(' ')}
                                                >
                                                    {extension}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-fg">
                                                        {file.name}
                                                    </p>
                                                    {file.status === 'uploading' ? (
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            <div
                                                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-subtle"
                                                                role="progressbar"
                                                                aria-valuenow={file.progress}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-label={`Subiendo ${file.name}`}
                                                            >
                                                                <div
                                                                    className="h-full rounded-full bg-brand-solid transition-all duration-150"
                                                                    style={{ width: `${file.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-9 text-right text-xs tabular-nums text-fg-muted">
                                                                {file.progress}%
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
                                                            <span>{formatBytes(file.size)}</span>
                                                            <span aria-hidden="true">·</span>
                                                            <span>{formatDate(file.uploadedAt)}</span>
                                                            <span className="inline-flex items-center gap-1 text-success">
                                                                <CheckIcon className="size-3.5" />
                                                                Subido
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>

                                                <ButtonComponent
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeFile(file.id)}
                                                    aria-label={`Quitar ${file.name} de la lista`}
                                                    title="Quitar de la lista"
                                                >
                                                    <TrashBinIcon className="size-4.5 text-danger" />
                                                </ButtonComponent>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
        </PageContainer>
    )
}
