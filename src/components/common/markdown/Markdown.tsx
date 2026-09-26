import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../../utils/cn'
import CodeBlock from './CodeBlock'

/**
 * Element mapping to design tokens. Markdown is rendered to React elements
 * (no dangerouslySetInnerHTML), so untrusted text cannot inject markup.
 */
const components: Components = {
    h1: (props) => <h3 className="mb-2 mt-4 text-base font-semibold text-fg first:mt-0" {...props} />,
    h2: (props) => <h4 className="mb-2 mt-4 text-sm font-semibold text-fg first:mt-0" {...props} />,
    h3: (props) => <h5 className="mb-1.5 mt-3 text-sm font-semibold text-fg first:mt-0" {...props} />,
    p: (props) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />,
    a: ({ href, ...props }) => <a href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-brand underline-offset-2 hover:underline" {...props} />,
    ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5 marker:text-fg-subtle" {...props} />,
    ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-fg-subtle" {...props} />,
    blockquote: (props) => <blockquote className="my-3 border-l-2 border-line-strong pl-3 text-fg-muted" {...props} />,
    hr: () => <hr className="my-4 border-line" />,
    table: (props) => (
        <div className="my-3 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full text-sm" {...props} />
        </div>
    ),
    thead: (props) => <thead className="surface-header text-left" {...props} />,
    th: (props) => <th className="px-3 py-2 text-2xs font-semibold uppercase tracking-caps text-fg-muted" {...props} />,
    td: (props) => <td className="border-t border-line px-3 py-2" {...props} />,
    // Fenced blocks arrive as <pre><code class="language-x">; the <pre> is rendered by CodeBlock
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
        const text = String(children ?? '')
        const language = /language-(\w+)/.exec(className ?? '')?.[1]
        if (language || text.includes('\n')) return <CodeBlock code={text.replace(/\n$/, '')} language={language} />
        return <code className="rounded-sm bg-canvas-subtle px-1 py-0.5 font-mono text-[0.85em] text-fg">{children}</code>
    },
}

/** Long-form documents (knowledge base, docs): larger headings, same body styles. */
const articleComponents: Components = {
    ...components,
    h1: (props) => <h2 className="mb-3 mt-8 text-xl font-semibold text-fg first:mt-0" {...props} />,
    h2: (props) => <h3 className="mb-2 mt-7 text-base font-semibold text-fg first:mt-0" {...props} />,
    h3: (props) => <h4 className="mb-2 mt-5 text-sm font-semibold text-fg first:mt-0" {...props} />,
    p: (props) => <p className="my-3 leading-relaxed first:mt-0 last:mb-0" {...props} />,
}

type MarkdownProps = Omit<ComponentProps<'div'>, 'children'> & {
    children: string
    /** compact: chat messages; article: documents */
    variant?: 'compact' | 'article'
}

export default function Markdown({ children, className, variant = 'compact', ...rest }: MarkdownProps) {
    return (
        <div className={cn('text-sm text-fg', className)} {...rest}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={variant === 'article' ? articleComponents : components}>
                {children}
            </ReactMarkdown>
        </div>
    )
}
