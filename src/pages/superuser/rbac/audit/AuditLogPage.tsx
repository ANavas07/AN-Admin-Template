import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { auditService, AUDIT_EVENT_TYPES } from '../../../../services/rbac/audit.service'
import type { AuditLog } from '../types'

const EVENT_BADGE: Record<string, { label: string; className: string }> = {
  ROLE_ASSIGNED: { label: 'Rol asignado', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300' },
  ROLE_REVOKED: { label: 'Rol revocado', className: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300' },
  PII_ACCESSED: { label: 'PII accedido', className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300' },
  BATCH_PII_EXPORT: { label: 'Exportación PII', className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300' },
  USER_CREATED: { label: 'Usuario creado', className: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300' },
  PERMISSION_CHANGED: { label: 'Permiso cambiado', className: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-300' },
  GROUP_MEMBER_ADDED: { label: 'Miembro agregado', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300' },
  GROUP_MEMBER_REMOVED: { label: 'Miembro removido', className: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300' },
  LOGIN_FAILED: { label: 'Login fallido', className: 'bg-red-100 text-red-800 ring-red-700/20 dark:bg-red-950 dark:text-red-300' },
}

function EventBadge({ eventType }: { eventType: string }) {
  const badge = EVENT_BADGE[eventType] ?? { label: eventType, className: 'bg-(--color-bg-soft) text-(--color-text-muted) ring-(--color-border)' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badge.className}`}>
      {badge.label}
    </span>
  )
}

const PAGE_SIZE = 20

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [actorFilter, setActorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [detailLog, setDetailLog] = useState<AuditLog | null>(null)

  // El efecto solo dispara la peticion; activar `loading` es tarea de los
  // handlers (filtros y paginacion), asi el efecto no llama setState de
  // forma sincrona. En el primer render `loading` ya arranca en true.
  const load = useCallback(
    (p: number, signal?: AbortSignal) => {
      auditService
        .getAll({
          page: p,
          pageSize: PAGE_SIZE,
          eventTypes: selectedEventTypes.length ? selectedEventTypes : undefined,
          actorUsername: actorFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          signal,
        })
        .then((res) => {
          setLogs(res.data)
          setTotal(res.total)
        })
        .catch(() => {})
        .finally(() => {
          if (!signal?.aborted) setLoading(false)
        })
    },
    [selectedEventTypes, actorFilter, dateFrom, dateTo]
  )

  // Un solo efecto para pagina y filtros: cambiar cualquiera de los dos
  // recarga la tabla.
  useEffect(() => {
    const controller = new AbortController()
    load(page, controller.signal)
    return () => controller.abort()
  }, [load, page])

  // Cambiar un filtro siempre vuelve a la primera pagina.
  function applyFilter(update: () => void) {
    setLoading(true)
    setPage(1)
    update()
  }

  function goToPage(p: number) {
    setLoading(true)
    setPage(p)
  }

  function toggleEventType(et: string) {
    applyFilter(() =>
      setSelectedEventTypes((prev) =>
        prev.includes(et) ? prev.filter((t) => t !== et) : [...prev, et]
      )
    )
  }

  function clearFilters() {
    applyFilter(() => {
      setSelectedEventTypes([])
      setActorFilter('')
      setDateFrom('')
      setDateTo('')
    })
  }

  const hasFilters = selectedEventTypes.length > 0 || actorFilter || dateFrom || dateTo
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns: ColumnDef<AuditLog>[] = useMemo(() => [
    {
      accessorKey: 'createdAt',
      header: 'Fecha / Hora',
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
    },
    {
      accessorKey: 'eventType',
      header: 'Tipo de evento',
      cell: (info) => <EventBadge eventType={info.getValue() as string} />,
    },
    {
      id: 'actor',
      header: 'Actor',
      cell: ({ row }) =>
        row.original.actor?.username ?? (
          <span className="text-(--color-text-muted) text-xs italic">Sistema</span>
        ),
    },
    {
      accessorKey: 'entityType',
      header: 'Entidad',
      cell: (info) => (
        <span className="font-mono text-xs text-(--color-text-muted)">{info.getValue() as string}</span>
      ),
    },
    {
      id: 'detail',
      header: 'Detalle',
      cell: ({ row }) => (
        <ButtonComponent
          size="sm"
          variant="ghost"
          onClick={() => setDetailLog(row.original)}
        >
          Ver
        </ButtonComponent>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="RBAC"
        title="Log de Auditoría"
        description="Registro de todos los eventos de acceso y cambios de permisos. Solo lectura."
      />

      {/* Filtros */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InputComponent
            label="Actor"
            placeholder="Busca por username..."
            value={actorFilter}
            onChange={(e) => applyFilter(() => setActorFilter(e.target.value))}
            showSearchIcon
            iconPosition="left"
          />
          <InputComponent
            label="Desde"
            type="date"
            value={dateFrom}
            onChange={(e) => applyFilter(() => setDateFrom(e.target.value))}
          />
          <InputComponent
            label="Hasta"
            type="date"
            value={dateTo}
            onChange={(e) => applyFilter(() => setDateTo(e.target.value))}
          />
        </div>

        {/* Multiselect de tipos de evento */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
            Tipos de evento
          </p>
          <div className="flex flex-wrap gap-2">
            {AUDIT_EVENT_TYPES.map((et) => {
              const badge = EVENT_BADGE[et]
              const active = selectedEventTypes.includes(et)
              return (
                <button
                  key={et}
                  type="button"
                  onClick={() => toggleEventType(et)}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-opacity ${
                    badge?.className ?? 'bg-(--color-bg-soft) text-(--color-text) ring-(--color-border)'
                  } ${active ? 'opacity-100 ring-2' : 'opacity-50 hover:opacity-75'}`}
                  aria-pressed={active}
                >
                  {badge?.label ?? et}
                </button>
              )
            })}
          </div>
        </div>

        {hasFilters && (
          <ButtonComponent variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </ButtonComponent>
        )}
      </div>

      <TableTS
        data={logs}
        columns={columns}
        loading={loading}
        enableSorting
        existBtn={false}
        emptyMessage="No hay eventos con los filtros aplicados."
      />

      {/* Paginación manual (server-side) */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-(--color-text-muted)">
            Página {page} de {totalPages} · {total} eventos
          </span>
          <div className="flex items-center gap-2">
            <ButtonComponent
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => goToPage(1)}
            >
              {'<<'}
            </ButtonComponent>
            <ButtonComponent
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              {'<'}
            </ButtonComponent>
            <ButtonComponent
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              {'>'}
            </ButtonComponent>
            <ButtonComponent
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => goToPage(totalPages)}
            >
              {'>>'}
            </ButtonComponent>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      <PopUp
        isOpen={Boolean(detailLog)}
        onClose={() => setDetailLog(null)}
        title="Detalle del evento"
        description={`${detailLog?.eventType} · ${detailLog?.entityType}`}
        size="lg"
        footer={
          <ButtonComponent onClick={() => setDetailLog(null)}>Cerrar</ButtonComponent>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">Fecha</p>
              <p className="mt-1 text-(--color-text)">
                {detailLog && new Date(detailLog.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">Actor</p>
              <p className="mt-1 text-(--color-text)">
                {detailLog?.actor?.username ?? 'Sistema'}
              </p>
            </div>
          </div>

          {detailLog?.oldValue !== undefined && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                Valor anterior
              </p>
              <pre className="overflow-x-auto rounded-xl bg-(--color-bg-soft) p-3 text-xs text-(--color-text)">
                {JSON.stringify(detailLog.oldValue, null, 2)}
              </pre>
            </div>
          )}

          {detailLog?.newValue !== undefined && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                Valor nuevo
              </p>
              <pre className="overflow-x-auto rounded-xl bg-(--color-bg-soft) p-3 text-xs text-(--color-text)">
                {JSON.stringify(detailLog.newValue, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </PopUp>
    </div>
  )
}
