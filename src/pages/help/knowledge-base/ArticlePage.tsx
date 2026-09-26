import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../../../components/common/markdown/Markdown'
import PageContainer from '../../../components/common/page/PageContainer'
import Badge from '../../../components/ui/badge/Badge'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import Panel from '../../../components/ui/panel/Panel'
import { useWorkspace } from '../../../context/workspace-context'
import { ArrowLeftIcon, BookIcon, CheckIcon } from '../../../icons/icons'
import { ARTICLES, getArticle, getArticleCategory } from '../../../services/knowledge-base/articles'
import { knowledgeBaseService } from '../../../services/knowledge-base/knowledgeBase.service'
import type { ArticleVote } from '../../../services/knowledge-base/knowledgeBase.service'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/format'
import { supportTicketUrl } from '../../system/errorReference'
import { articlePath } from './articlePath'

/** Help › Knowledge base › Article: content, feedback and related articles. */
export default function ArticlePage() {
    const { slug = '' } = useParams()
    const { user } = useWorkspace()
    const article = getArticle(slug)
    // Keyed by slug so moving to a related article reads its own vote
    const [votes, setVotes] = useState<Record<string, ArticleVote | null>>({})
    const vote = slug in votes ? votes[slug] : knowledgeBaseService.getVote(user.id, slug)

    if (!article) {
        return (
            <PageContainer width="narrow">
                <EmptyState
                    icon={<BookIcon className="size-5" />}
                    title="Artículo no encontrado"
                    description="Puede que se haya movido o eliminado."
                    action={<ButtonComponent to="/help/knowledge-base">Ir a la base de conocimiento</ButtonComponent>}
                />
            </PageContainer>
        )
    }

    const category = getArticleCategory(article.categoryId)
    const related = ARTICLES.filter((item) => item.slug !== article.slug && item.categoryId === article.categoryId).slice(0, 3)

    function handleVote(value: ArticleVote) {
        setVotes((current) => ({ ...current, [slug]: value }))
        void knowledgeBaseService.vote(user.id, slug, value)
    }

    return (
        <PageContainer>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <article className="min-w-0 lg:col-span-8">
                    <Link to="/help/knowledge-base" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
                        <ArrowLeftIcon className="size-4" />
                        Base de conocimiento
                    </Link>
                    <header className="mt-4 border-b border-line pb-5">
                        {category ? <p className="eyebrow">{category.name}</p> : null}
                        <h1 className="page-title mt-1.5">{article.title}</h1>
                        <p className="mt-2 text-sm text-fg-muted">{article.summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
                            <span>Actualizado {formatDate(article.updatedAt)}</span>
                            {article.tags.map((tag) => (
                                <Badge key={tag} size="sm">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </header>

                    <Markdown variant="article" className="py-6 text-[0.9375rem]">
                        {article.body}
                    </Markdown>

                    <section className="card p-5" aria-labelledby="article-feedback">
                        <h2 id="article-feedback" className="text-sm font-semibold text-fg">
                            ¿Te resultó útil este artículo?
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Valorar artículo">
                            {(
                                [
                                    ['helpful', 'Sí, me ayudó'],
                                    ['not_helpful', 'No resolvió mi duda'],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={vote === value}
                                    onClick={() => handleVote(value)}
                                    className={cn(
                                        'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
                                        vote === value ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                                    )}
                                >
                                    {vote === value ? <CheckIcon className="size-3.5" /> : null}
                                    {label}
                                </button>
                            ))}
                        </div>
                        {vote === 'not_helpful' ? (
                            <p className="mt-3 text-sm text-fg-muted" aria-live="polite">
                                Lo sentimos.{' '}
                                <Link
                                    to={supportTicketUrl({ subject: `Consulta sobre «${article.title}»`, category: 'question' })}
                                    className="font-medium text-brand hover:underline"
                                >
                                    Crea un ticket
                                </Link>{' '}
                                y soporte te ayudará.
                            </p>
                        ) : vote === 'helpful' ? (
                            <p className="mt-3 text-sm text-success" aria-live="polite">
                                ¡Gracias por tu valoración!
                            </p>
                        ) : null}
                    </section>
                </article>

                <aside className="space-y-4 lg:col-span-4 lg:pt-10" aria-label="Artículos relacionados">
                    {related.length ? (
                        <Panel title="Artículos relacionados">
                            <ul className="space-y-1">
                                {related.map((item) => (
                                    <li key={item.slug}>
                                        <Link to={articlePath(item.slug)} className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-fg transition-colors hover:bg-canvas-subtle">
                                            <BookIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    ) : null}
                    <Panel title="¿Necesitas más ayuda?" description="El equipo de soporte responde según la prioridad del ticket.">
                        <ButtonComponent to="/support/new" fullWidth>
                            Crear un ticket
                        </ButtonComponent>
                    </Panel>
                </aside>
            </div>
        </PageContainer>
    )
}
