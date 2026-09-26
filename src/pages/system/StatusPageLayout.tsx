import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { toneTint } from '../../components/ui/tone'
import type { StatusTone } from '../../components/ui/tone'

type StatusPageLayoutProps = {
    /** Short code shown above the title: "Error 404", "Mantenimiento" */
    code: string
    title: string
    description: ReactNode
    icon: ReactNode
    tone?: StatusTone
    /** Buttons and links to leave the page */
    actions?: ReactNode
    /** Extra context: reference id, required roles, maintenance window… */
    children?: ReactNode
    /** Outside the app shell (maintenance): fill the whole viewport */
    fullScreen?: boolean
}

/** Shared layout of the system pages (404, 403, 500, maintenance). */
export default function StatusPageLayout({
    code,
    title,
    description,
    icon,
    tone = 'neutral',
    actions,
    children,
    fullScreen = false,
}: StatusPageLayoutProps) {
    return (
        <main
            className={cn(
                'flex items-center justify-center bg-canvas px-4 py-12',
                fullScreen ? 'min-h-screen' : 'min-h-[calc(100vh-var(--layout-navbar-height))]'
            )}
        >
            <div className="w-full max-w-xl">
                <div className="card p-8 sm:p-10">
                    <span className={cn('inline-flex size-12 items-center justify-center rounded-xl', toneTint[tone])}>{icon}</span>
                    <p className="eyebrow mt-6">{code}</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{title}</h1>
                    <div className="mt-2 text-sm leading-6 text-fg-muted">{description}</div>
                    {children ? <div className="mt-6">{children}</div> : null}
                    {actions ? <div className="mt-8 flex flex-wrap gap-2">{actions}</div> : null}
                </div>
            </div>
        </main>
    )
}
