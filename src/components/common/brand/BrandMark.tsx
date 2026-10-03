import { appConfig } from '../../../config/app.config'
import { cn } from '../../../utils/cn'

type BrandMarkProps = {
    /** Shows the name and tagline next to the logo */
    showName?: boolean
    size?: 'md' | 'lg'
    className?: string
    nameClassName?: string
}

/** Logo + product name from appConfig. The same mark in the navbar and on the login screen. */
export default function BrandMark({ showName = true, size = 'md', className, nameClassName }: BrandMarkProps) {
    return (
        <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
            <span
                className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-solid font-display font-semibold tracking-tight text-on-solid shadow-xs',
                    size === 'lg' ? 'size-10 text-sm' : 'size-8 text-xs'
                )}
                aria-hidden="true"
            >
                {appConfig.shortName}
            </span>
            {showName ? (
                <span className={cn('min-w-0 leading-tight', nameClassName)}>
                    <span className={cn('block truncate font-display font-semibold text-fg', size === 'lg' ? 'text-base' : 'text-sm')}>{appConfig.name}</span>
                    <span className="block truncate text-xs text-fg-muted">{appConfig.tagline}</span>
                </span>
            ) : null}
        </span>
    )
}
