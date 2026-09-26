import { useEffect, useState } from 'react'
import { CheckIcon, ClipboardIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'

type CopyButtonProps = {
    /** Text to copy; a function is called only on click (e.g. to avoid keeping a secret in props) */
    value: string | (() => string)
    label?: string
    /** Shows the label next to the icon */
    showLabel?: boolean
    className?: string
    onCopied?: () => void
}

/** Copies to the clipboard and confirms it for a moment (announced to screen readers). */
export default function CopyButton({ value, label = 'Copiar', showLabel = false, className, onCopied }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        const timeout = window.setTimeout(() => setCopied(false), 1800)
        return () => window.clearTimeout(timeout)
    }, [copied])

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(typeof value === 'function' ? value() : value)
            setCopied(true)
            onCopied?.()
        } catch {
            // Clipboard blocked (insecure context or permission): nothing to confirm
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copiado' : label}
            title={copied ? 'Copiado' : label}
            className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25',
                copied && 'text-success hover:text-success',
                className
            )}
        >
            {copied ? <CheckIcon className="size-3.5" /> : <ClipboardIcon className="size-3.5" />}
            {showLabel ? <span>{copied ? 'Copiado' : label}</span> : null}
            <span className="sr-only" aria-live="polite">
                {copied ? 'Copiado al portapapeles' : ''}
            </span>
        </button>
    )
}
