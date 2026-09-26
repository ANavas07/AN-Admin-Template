import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type PageContainerProps = {
    children: ReactNode
    /** narrow: forms and settings; default: dashboards and lists */
    width?: 'default' | 'narrow'
    className?: string
}

/** Standard page frame: background, max width and gutters shared by every module screen. */
export default function PageContainer({ children, width = 'default', className }: PageContainerProps) {
    return (
        <div className="min-h-[calc(100vh-var(--layout-navbar-height))] bg-canvas">
            <div
                className={cn(
                    'mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8',
                    width === 'narrow' ? 'max-w-4xl' : 'max-w-(--layout-content-max-width)',
                    className
                )}
            >
                {children}
            </div>
        </div>
    )
}
