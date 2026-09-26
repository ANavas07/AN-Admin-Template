import { Link } from 'react-router-dom'
import Markdown from '../../../components/common/markdown/Markdown'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import { ArrowRightIcon, BookIcon, SparkIcon } from '../../../icons/icons'
import { DOC_SECTIONS } from './docsContent'

const RESOURCES = [
    { to: '/playground', title: 'Catálogo de UI', description: 'Botones, campos, tablas, formularios y modales en vivo.', Icon: SparkIcon },
    { to: '/help/knowledge-base', title: 'Base de conocimiento', description: 'Guías de uso para los usuarios finales.', Icon: BookIcon },
]

/** Help › Documentation: how the template is organized and extended. */
export default function DocsPage() {
    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Ayuda"
                title="Documentación"
                description="Cómo está organizada la plantilla y cómo extenderla sin romper sus convenciones."
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <aside className="lg:col-span-3" aria-label="Contenido">
                    <nav className="lg:sticky lg:top-[calc(var(--layout-navbar-height)+1.5rem)]">
                        <p className="eyebrow mb-2">En esta página</p>
                        <ul className="space-y-0.5 border-l border-line">
                            {DOC_SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="-ml-px block border-l border-transparent py-1 pl-3 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 space-y-2">
                            {RESOURCES.map(({ to, title, description, Icon }) => (
                                <Link key={to} to={to} className="card-interactive group flex items-start gap-3 p-3">
                                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-1 text-sm font-medium text-fg">
                                            {title}
                                            <ArrowRightIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </span>
                                        <span className="block text-xs text-fg-muted">{description}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </nav>
                </aside>

                <div className="min-w-0 space-y-4 lg:col-span-9">
                    {DOC_SECTIONS.map((section) => (
                        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="card scroll-mt-24 p-6">
                            <h2 id={`${section.id}-title`} className="mb-3 text-lg font-semibold text-fg">
                                {section.title}
                            </h2>
                            <Markdown variant="article">{section.body}</Markdown>
                        </section>
                    ))}
                </div>
            </div>
        </PageContainer>
    )
}
