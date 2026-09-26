import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AttachmentList from '../../../../components/common/attachments/AttachmentList'
import AttachmentPicker from '../../../../components/common/attachments/AttachmentPicker'
import ModuleIcon from '../../../../components/common/modules/ModuleIcon'
import Alert from '../../../../components/ui/alert/Alert'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { FieldLabel } from '../../../../components/ui/inputs/field'
import { fieldTextareaClass } from '../../../../components/ui/inputs/fieldStyles'
import Panel from '../../../../components/ui/panel/Panel'
import SegmentedControl from '../../../../components/ui/segmented/SegmentedControl'
import { BookIcon } from '../../../../icons/icons'
import { searchArticles } from '../../../../services/knowledge-base/knowledgeBase.service'
import { RESPONSE_TARGET_HOURS } from '../../../../services/support/support.service'
import type { TicketCategory, TicketPriority } from '../../../../services/support/support.service'
import type { Attachment } from '../../../../utils/attachments'
import { cn } from '../../../../utils/cn'
import { articlePath } from '../../../help/knowledge-base/articlePath'
import ContactInfoPanel from '../components/ContactInfoPanel'
import { useTickets } from '../hooks/useTickets'
import { CATEGORIES, CATEGORY_META, isTicketCategory, PRIORITIES, PRIORITY_META } from '../supportPresentation'

/**
 * Support › New ticket. Accepts ?subject, ?category and ?ref so error pages
 * (403, 500) can open it prefilled with the error reference.
 */
export default function NewTicketPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { create } = useTickets()
    const initialCategory = searchParams.get('category')
    const reference = searchParams.get('ref') ?? undefined

    const [category, setCategory] = useState<TicketCategory>(isTicketCategory(initialCategory) ? initialCategory : 'incident')
    const [subject, setSubject] = useState(searchParams.get('subject') ?? '')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<TicketPriority>(reference ? 'high' : 'medium')
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [showErrors, setShowErrors] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const errors = {
        subject: subject.trim().length < 5 ? 'Escribe un asunto de al menos 5 caracteres.' : undefined,
        description: description.trim().length < 10 ? 'Describe qué ocurre (al menos 10 caracteres).' : undefined,
    }
    // Articles related to what the user is typing: many requests are answered there
    const suggestions = subject.trim().length >= 3 ? searchArticles(subject).slice(0, 3) : []

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setShowErrors(true)
        if (errors.subject || errors.description) return
        setIsSubmitting(true)
        const ticket = await create({ subject, description, category, priority, reference, attachments })
        setIsSubmitting(false)
        if (ticket) navigate(`/support/tickets/${ticket.id}`)
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form className="card space-y-6 p-5 lg:col-span-8" onSubmit={handleSubmit} noValidate>
                <fieldset>
                    <legend className="mb-2 text-sm font-medium text-fg">Categoría</legend>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {CATEGORIES.map((value) => {
                            const meta = CATEGORY_META[value]
                            const isSelected = value === category
                            return (
                                <label
                                    key={value}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-brand/25',
                                        isSelected ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong'
                                    )}
                                >
                                    <input type="radio" name="category" value={value} checked={isSelected} onChange={() => setCategory(value)} className="sr-only" />
                                    <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-lg', isSelected ? 'bg-brand-solid text-on-solid' : 'bg-canvas-subtle text-fg-muted')}>
                                        <ModuleIcon name={meta.icon} className="size-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-fg">{meta.label}</span>
                                        <span className="block text-xs text-fg-muted">{meta.description}</span>
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                <InputComponent
                    label="Asunto"
                    requiredMark
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Resume el problema en una línea"
                    maxLength={120}
                    error={showErrors ? errors.subject : undefined}
                />

                <div>
                    <FieldLabel htmlFor="ticket-description" required>
                        Descripción
                    </FieldLabel>
                    <textarea
                        id="ticket-description"
                        rows={6}
                        className={fieldTextareaClass}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder={'Qué intentabas hacer, qué ocurrió y qué esperabas.\nIncluye pasos para reproducirlo si es posible.'}
                        aria-invalid={showErrors && Boolean(errors.description)}
                        aria-describedby={showErrors && errors.description ? 'ticket-description-error' : undefined}
                    />
                    {showErrors && errors.description ? (
                        <p id="ticket-description-error" className="mt-1.5 text-xs font-medium text-danger">
                            {errors.description}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-fg">Prioridad</p>
                        <SegmentedControl
                            label="Prioridad"
                            value={priority}
                            onChange={setPriority}
                            options={PRIORITIES.map((value) => ({ value, label: PRIORITY_META[value].label }))}
                        />
                        <p className="mt-1.5 text-xs text-fg-muted">Primera respuesta en menos de {RESPONSE_TARGET_HOURS[priority]} h hábiles.</p>
                    </div>
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-fg">Adjuntos</p>
                        <AttachmentPicker onAdd={(added) => setAttachments((current) => [...current, ...added])} label="Agregar capturas o archivos" />
                        <AttachmentList
                            className="mt-2"
                            attachments={attachments}
                            onRemove={(removed) => setAttachments((current) => current.filter((item) => item.id !== removed.id))}
                        />
                    </div>
                </div>

                {reference ? (
                    <Alert tone="info" title="Referencia de error adjunta">
                        <code className="font-mono text-xs">{reference}</code> se enviará con el ticket para localizar el registro del error.
                    </Alert>
                ) : null}

                <div className="flex justify-end gap-2 border-t border-line pt-4">
                    <ButtonComponent variant="outline" to="/support/tickets">
                        Cancelar
                    </ButtonComponent>
                    <ButtonComponent type="submit" isLoading={isSubmitting} loadingText="Creando…">
                        Crear ticket
                    </ButtonComponent>
                </div>
            </form>

            <aside className="space-y-4 lg:col-span-4" aria-label="Ayuda">
                <Panel title="¿Ya tiene respuesta?" description={suggestions.length ? 'Artículos relacionados con tu asunto.' : 'Escribe el asunto para ver artículos relacionados.'}>
                    {suggestions.length ? (
                        <ul className="space-y-1" aria-live="polite">
                            {suggestions.map((article) => (
                                <li key={article.slug}>
                                    <Link
                                        to={articlePath(article.slug)}
                                        target="_blank"
                                        className="flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-canvas-subtle"
                                    >
                                        <BookIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                                        <span>
                                            <span className="block text-sm text-fg">{article.title}</span>
                                            <span className="block text-xs text-fg-muted">{article.summary}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-fg-muted">
                            También puedes explorar la{' '}
                            <Link to="/support/knowledge-base" className="font-medium text-brand hover:underline">
                                base de conocimiento
                            </Link>
                            .
                        </p>
                    )}
                </Panel>
                <ContactInfoPanel />
            </aside>
        </div>
    )
}
