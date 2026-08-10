import { useCallback, useEffect, useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import DataList from '../../../../components/ui/inputs/DataList'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { SearchIcon, TrashBinIcon } from '../../../../icons/icons'
import { groupsService } from '../../../../services/rbac/groups.service'
import { usersRolesService } from '../../../../services/rbac/users-roles.service'
import type { Group, GroupMember, RbacUser } from '../types'

interface GroupMembersPanelProps {
  isOpen: boolean
  group: Group
  onClose: () => void
  onChanged: () => void
}

export default function GroupMembersPanel({
  isOpen,
  group,
  onClose,
  onChanged,
}: GroupMembersPanelProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RbacUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadMembers = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true)
      groupsService
        .getMembers(group.id, signal)
        .then(setMembers)
        .catch(() => {})
        .finally(() => setLoading(false))
    },
    [group.id]
  )

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    loadMembers(controller.signal)
    return () => controller.abort()
  }, [isOpen, loadMembers])

  function handleSearch() {
    if (!searchQuery.trim() || searchQuery.length < 2) return
    const controller = new AbortController()
    setIsSearching(true)
    setSelectedUserId('')
    usersRolesService
      .searchUsers(searchQuery, controller.signal)
      .then(setSearchResults)
      .catch(() => {})
      .finally(() => setIsSearching(false))
  }

  async function handleAdd() {
    if (!selectedUserId) return
    setIsAdding(true)
    try {
      await groupsService.addMember(group.id, selectedUserId, validUntil || undefined)
      setSelectedUserId('')
      setSearchQuery('')
      setSearchResults([])
      setValidUntil('')
      loadMembers()
      onChanged()
    } catch {
      // silently fail
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemove(userId: string, username: string) {
    if (!confirm(`¿Remover a "${username}" del grupo?`)) return
    setRemovingId(userId)
    try {
      await groupsService.removeMember(group.id, userId)
      loadMembers()
      onChanged()
    } catch {
      // silently fail
    } finally {
      setRemovingId(null)
    }
  }

  const userDlOptions = useMemo(
    () => searchResults.map((u) => ({ label: u.username, value: u.id })),
    [searchResults]
  )

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={`Miembros: ${group.name}`}
      description={`${members.length} miembro${members.length !== 1 ? 's' : ''} en este grupo.`}
      size="lg"
      footer={<ButtonComponent variant="outline" onClick={onClose}>Cerrar</ButtonComponent>}
    >
      {/* Agregar miembro */}
      <div className="mb-5 rounded-xl border border-(--color-border) bg-(--color-bg-soft) p-4 space-y-3">
        <p className="text-sm font-semibold text-(--color-text)">Agregar miembro</p>

        {/* Búsqueda de usuario */}
        <div className="flex gap-2">
          <div className="flex-1">
            <InputComponent
              label="Buscar usuario"
              placeholder="Escribe un username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showSearchIcon
              iconPosition="left"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            />
          </div>
          <div className="flex items-end">
            <ButtonComponent
              size="sm"
              variant="outline"
              leftIcon={<SearchIcon />}
              isLoading={isSearching}
              loadingText="..."
              onClick={handleSearch}
              disabled={searchQuery.trim().length < 2}
            >
              Buscar
            </ButtonComponent>
          </div>
        </div>

        {/* Selección de resultado + vigencia */}
        {searchResults.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <DataList
              id="group-user-select"
              label="Seleccionar usuario"
              placeholder="Elige un usuario"
              options={userDlOptions}
              value={selectedUserId}
              opKey="value"
              opValue="label"
              emptyText="Sin resultados"
              onSelect={(e) => setSelectedUserId(e.target.value)}
            />
            <InputComponent
              label="Vigencia (opcional)"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              hint="Dejar vacío = indefinida"
            />
          </div>
        )}

        {searchResults.length > 0 && (
          <ButtonComponent
            size="sm"
            disabled={!selectedUserId}
            isLoading={isAdding}
            loadingText="Agregando..."
            onClick={handleAdd}
          >
            Agregar al grupo
          </ButtonComponent>
        )}
      </div>

      {/* Tabla de miembros */}
      {loading ? (
        <p className="text-sm text-(--color-text-muted) text-center py-4">Cargando miembros...</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-(--color-text-muted) text-center py-4">
          No hay miembros en este grupo.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-sm">
            <thead className="bg-(--color-bg-soft) border-b border-(--color-border)">
              <tr>
                {['Username', 'Asignado', 'Vigencia', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {members.map((m) => (
                <tr key={m.userId} className="hover:bg-(--color-bg-soft)/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-(--color-text)">{m.username}</td>
                  <td className="px-4 py-3 text-(--color-text-muted)">
                    {new Date(m.assignedAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-(--color-text-muted)">
                    {m.validUntil
                      ? new Date(m.validUntil).toLocaleDateString('es-CO')
                      : 'Indefinida'}
                  </td>
                  <td className="px-4 py-3">
                    <ButtonComponent
                      size="icon"
                      variant="ghost"
                      isLoading={removingId === m.userId}
                      onClick={() => handleRemove(m.userId, m.username)}
                      aria-label={`Remover a ${m.username}`}
                      title="Remover miembro"
                    >
                      <TrashBinIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </ButtonComponent>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PopUp>
  )
}
