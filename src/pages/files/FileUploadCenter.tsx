import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import ModuleHeader from '../../components/common/page/ModuleHeader'
import { FileDocIcon, TrashBinIcon, UploadIcon, CheckIcon } from '../../icons/icons'

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
    { id: 'f-01', name: 'tournament-rules-2026.pdf', size: 1_240_000, uploadedAt: '2026-06-12T10:24:00', status: 'complete', progress: 100 },
    { id: 'f-02', name: 'season-fixtures.xlsx', size: 486_000, uploadedAt: '2026-06-18T15:02:00', status: 'complete', progress: 100 },
    { id: 'f-03', name: 'stadium-map.png', size: 2_830_000, uploadedAt: '2026-06-25T09:40:00', status: 'complete', progress: 100 },
]

const extensionStyles: Record<string, string> = {
    pdf: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300',
    doc: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300',
    docx: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300',
    xls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    xlsx: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    csv: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    png: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300',
    jpg: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300',
    jpeg: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300',
    svg: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300',
}

const fallbackExtensionStyle =
    'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300'

function getExtension(fileName: string) {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'file'
}

function formatBytes(bytes: number) {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
    return `${bytes} B`
}

function formatDate(isoDate: string) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(isoDate))
}

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
        <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg)">
            <div className="mx-auto max-w-350 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <ModuleHeader
                    eyebrow="Files module"
                    title="File upload center"
                    description="Drag documents into the drop zone or browse from your device. Uploads are simulated — files stay in this page's local state."
                />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    {/* Drop zone */}
                    <section aria-label="Upload files">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={() => setIsDragActive(false)}
                            className={[
                                'flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200',
                                isDragActive
                                    ? 'scale-[1.01] border-brand bg-brand-soft shadow-lg'
                                    : 'border-(--color-border) bg-(--color-surface) shadow-sm',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200',
                                    isDragActive ? 'bg-brand text-white' : 'bg-brand-soft text-brand',
                                ].join(' ')}
                            >
                                <UploadIcon className="size-8" />
                            </span>

                            <div>
                                <p className="text-base font-semibold text-(--color-text)">
                                    {isDragActive ? 'Drop files to upload' : 'Drag & drop files here'}
                                </p>
                                <p className="mt-1 text-sm text-(--color-text-muted)">
                                    or pick them manually from your device
                                </p>
                            </div>

                            <ButtonComponent
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Browse files
                            </ButtonComponent>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleInputChange}
                                aria-label="Select files to upload"
                            />

                            <p className="text-xs text-(--color-text-muted)">
                                Any file type is accepted in this demo.
                            </p>
                        </div>
                    </section>

                    {/* File list */}
                    <section aria-label="Uploaded files">
                        <div className="overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-sm">
                            <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
                                <h2 className="text-sm font-semibold text-(--color-text)">
                                    Uploaded files
                                </h2>
                                <span className="rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text-muted)">
                                    {files.length} {files.length === 1 ? 'file' : 'files'} · {formatBytes(totalSize)}
                                </span>
                            </div>

                            {files.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                                    <FileDocIcon className="size-8 text-(--color-text-muted)" />
                                    <p className="text-sm font-medium text-(--color-text)">No files yet</p>
                                    <p className="text-xs text-(--color-text-muted)">
                                        Drop a file on the left to see it listed here.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-(--color-border)">
                                    {files.map((file) => {
                                        const extension = getExtension(file.name)
                                        return (
                                            <li key={file.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-(--color-bg-soft)/50">
                                                <span
                                                    className={[
                                                        'inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
                                                        extensionStyles[extension] ?? fallbackExtensionStyle,
                                                    ].join(' ')}
                                                >
                                                    {extension}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-(--color-text)">
                                                        {file.name}
                                                    </p>
                                                    {file.status === 'uploading' ? (
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            <div
                                                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-bg-soft)"
                                                                role="progressbar"
                                                                aria-valuenow={file.progress}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-label={`Uploading ${file.name}`}
                                                            >
                                                                <div
                                                                    className="h-full rounded-full bg-brand transition-all duration-150"
                                                                    style={{ width: `${file.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-9 text-right text-xs tabular-nums text-(--color-text-muted)">
                                                                {file.progress}%
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-0.5 flex items-center gap-2 text-xs text-(--color-text-muted)">
                                                            <span>{formatBytes(file.size)}</span>
                                                            <span aria-hidden="true">·</span>
                                                            <span>{formatDate(file.uploadedAt)}</span>
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                                <CheckIcon className="size-3.5" />
                                                                Uploaded
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>

                                                <ButtonComponent
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeFile(file.id)}
                                                    aria-label={`Remove ${file.name} from the list`}
                                                    title="Remove from list"
                                                >
                                                    <TrashBinIcon className="size-5 text-rose-600 dark:text-rose-300" />
                                                </ButtonComponent>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
