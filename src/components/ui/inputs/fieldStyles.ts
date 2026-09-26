import { cn } from '../../../utils/cn'

/** Heights shared by every form control, aligned with the button sizes. */
export const fieldSizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-11 text-sm',
} as const

export type FieldSize = keyof typeof fieldSizeClasses

/**
 * Border, background, focus and error styling for inputs, selects and
 * textareas. Every control in the app uses it so they look and behave alike.
 */
export function fieldControlClass(hasError = false) {
    return cn(
        'w-full rounded-md border bg-surface text-fg shadow-xs placeholder:text-fg-subtle',
        'transition-[border-color,box-shadow]',
        'focus:outline-none focus:ring-3',
        'disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:opacity-70',
        hasError
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-line hover:border-line-strong focus:border-brand focus:ring-brand/20'
    )
}

/** Ready-made classes for native controls that do not use InputComponent / Select. */
export const fieldInputClass = cn(fieldControlClass(), fieldSizeClasses.md, 'px-3')
export const fieldSelectClass = cn(fieldControlClass(), fieldSizeClasses.md, 'px-3')
export const fieldTextareaClass = cn(fieldControlClass(), 'px-3 py-2 text-sm')
