import { useState } from 'react'
import { Link } from 'react-router-dom'
import ModuleIcon from '../../../../components/common/modules/ModuleIcon'
import EmptyState from '../../../../components/ui/empty-state/EmptyState'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { ArrowRightIcon, BookIcon } from '../../../../icons/icons'
import { ARTICLE_CATEGORIES, ARTICLES, getArticleCategory } from '../../../../services/knowledge-base/articles'
import { searchArticles } from '../../../../services/knowledge-base/knowledgeBase.service'
import { cn } from '../../../../utils/cn'
import { formatDate } from '../../../../utils/format'
import { articlePath } from '../articlePath'

/**
 * Search, categories and article list. Used by Help › Knowledge base and by
 * the Knowledge base tab of the support center.
 */
export default function KnowledgeBaseBrowser() {
    const [query, setQuery] = useState('')
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const results = searchArticles(query, categoryId ?? undefined)
    const isFiltering = Boolean(query.trim() || categoryId)

    return (
        <div className="space-y-6">
            <section className="card flex flex-col items-center gap-3 px-5 py-8 text-center" aria-labelledby="kb-search-title">
                <h2 id="kb-search-title" className="text-lg font-semibold text-fg">
                    ¿En qué podemos ayudarte?
                </h2>
                <p className="max-w-lg text-sm text-fg-muted">Busca guías paso a paso, respuestas frecuentes y buenas prácticas.</p>
                <InputComponent
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="p. ej. rotar api key, verificación en dos pasos"
                    aria-label="Buscar en la base de conocimiento"
                    showSearchIcon
                    iconPosition="left"
                    size="lg"
                    containerClassName="max-w-xl"
                />
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Categorías">
                {ARTICLE_CATEGORIES.map((category) => {
                    const isSelected = category.id === categoryId
                    const count = ARTICLES.filter((article) => article.categoryId === category.id).length
                    return (
                        <button
                            key={category.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setCategoryId(isSelected ? null : category.id)}
                            className={cn(
                                'card-interactive flex flex-col items-start gap-2 p-4 text-left',
                                isSelected && 'border-brand ring-1 ring-brand'
                            )}
                        >
                            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                                <ModuleIcon name={category.icon} className="size-4" />
                            </span>
                            <span className="text-sm font-semibold text-fg">{category.name}</span>
                            <span className="text-xs text-fg-muted">{category.description}</span>
                            <span className="mt-auto text-2xs text-fg-subtle">{count} artículos</span>
                        </button>
                    )
                })}
            </div>

            <section className="card overflow-hidden" aria-labelledby="kb-results-title">
                <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <h2 id="kb-results-title" className="text-sm font-semibold text-fg">
                        {isFiltering ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : 'Todos los artículos'}
                    </h2>
                    {isFiltering ? (
                        <button
                            type="button"
                            className="text-xs font-medium text-brand hover:underline"
                            onClick={() => {
                                setQuery('')
                                setCategoryId(null)
                            }}
                        >
                            Limpiar filtros
                        </button>
                    ) : null}
                </header>
                {results.length ? (
                    <ul className="divide-y divide-line" aria-live="polite">
                        {results.map((article) => (
                            <li key={article.slug}>
                                <Link
                                    to={articlePath(article.slug)}
                                    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas-subtle/60"
                                >
                                    <BookIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-fg group-hover:text-brand">{article.title}</span>
                                        <span className="block text-xs text-fg-muted">{article.summary}</span>
                                        <span className="mt-1 block text-2xs text-fg-subtle">
                                            {getArticleCategory(article.categoryId)?.name} · Actualizado {formatDate(article.updatedAt)}
                                        </span>
                                    </span>
                                    <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        icon={<BookIcon className="size-5" />}
                        title="Sin resultados"
                        description="Prueba con otras palabras o crea un ticket para que soporte te ayude."
                        action={
                            <Link to="/support/new" className="text-sm font-medium text-brand hover:underline">
                                Crear un ticket
                            </Link>
                        }
                    />
                )}
            </section>
        </div>
    )
}
