import Badge from '../../../../components/ui/badge/Badge'
import { API_SCOPES, SCOPE_GROUPS } from '../../../../services/api-keys/scopes'
import { cn } from '../../../../utils/cn'

type ScopePickerProps = {
    value: string[]
    onChange: (scopes: string[]) => void
    disabled?: boolean
}

/** Permissions of a key grouped by domain. Sensitive scopes (writes, admin) are flagged. */
export default function ScopePicker({ value, onChange, disabled = false }: ScopePickerProps) {
    const selected = new Set(value)

    function toggle(id: string) {
        const next = new Set(selected)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        onChange(API_SCOPES.filter((scope) => next.has(scope.id)).map((scope) => scope.id))
    }

    return (
        <div className="space-y-4">
            {SCOPE_GROUPS.map((group) => (
                <fieldset key={group} disabled={disabled}>
                    <legend className="eyebrow mb-1.5">{group}</legend>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                        {API_SCOPES.filter((scope) => scope.group === group).map((scope) => {
                            const isChecked = selected.has(scope.id)
                            return (
                                <label
                                    key={scope.id}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 transition-colors',
                                        isChecked ? 'border-brand/40 bg-brand-soft/60' : 'border-line hover:border-line-strong',
                                        disabled && 'cursor-not-allowed opacity-60'
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 size-4 shrink-0 accent-(--color-brand-solid)"
                                        checked={isChecked}
                                        onChange={() => toggle(scope.id)}
                                    />
                                    <span className="min-w-0">
                                        <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-fg">
                                            {scope.label}
                                            {scope.sensitive ? (
                                                <Badge tone="warning" size="sm">
                                                    Sensible
                                                </Badge>
                                            ) : null}
                                        </span>
                                        <span className="block font-mono text-2xs text-fg-subtle">{scope.id}</span>
                                        <span className="mt-0.5 block text-xs text-fg-muted">{scope.description}</span>
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>
            ))}
        </div>
    )
}
