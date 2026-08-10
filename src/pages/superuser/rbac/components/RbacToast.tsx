import { useEffect } from 'react'
import type { ToastState } from '../types'

interface RbacToastProps {
  toast: ToastState | null
  onDismiss: () => void
}

export default function RbacToast({ toast, onDismiss }: RbacToastProps) {
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(onDismiss, 4000)
    return () => clearTimeout(id)
  }, [toast, onDismiss])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium max-w-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950 dark:text-red-200'
      }`}
    >
      <span className="shrink-0 text-base">{isSuccess ? '✓' : '✕'}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}
