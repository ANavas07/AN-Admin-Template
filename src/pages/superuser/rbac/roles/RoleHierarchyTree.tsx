import { useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import type { Role } from '../types'

interface RoleHierarchyTreeProps {
  isOpen: boolean
  roles: Role[]
  onClose: () => void
}

interface RoleNode extends Role {
  children: RoleNode[]
}

function buildTree(roles: Role[]): RoleNode[] {
  const nodeMap = new Map<string, RoleNode>()
  roles.forEach((r) => nodeMap.set(r.id, { ...r, children: [] }))

  const roots: RoleNode[] = []
  nodeMap.forEach((node) => {
    if (node.parentRoleId && nodeMap.has(node.parentRoleId)) {
      nodeMap.get(node.parentRoleId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

interface TreeNodeProps {
  node: RoleNode
  depth: number
}

function TreeNode({ node, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-(--color-bg-soft) ${
          depth === 0 ? 'font-semibold' : ''
        }`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 text-(--color-text-muted) transition-transform"
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            >
              <path d="M4.5 3.5l4 3.5-4 3.5V3.5z" />
            </svg>
          </button>
        ) : (
          <span className="w-3.5 shrink-0 text-(--color-text-muted)">·</span>
        )}

        {/* Role info */}
        <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-(--color-text) truncate">{node.name}</span>
            {node.isSystem && (
              <span className="shrink-0 text-xs text-(--color-text-muted)" title="Rol de sistema">
                🔒
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-(--color-text-muted) hidden sm:block">
              {node.code}
            </span>
            {typeof node.permissionCount === 'number' && (
              <span className="text-xs text-(--color-text-muted)">
                {node.permissionCount} perm.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-(--color-border)"
            style={{ left: `${depth * 20 + 19}px` }}
            aria-hidden="true"
          />
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoleHierarchyTree({ isOpen, roles, onClose }: RoleHierarchyTreeProps) {
  const tree = useMemo(() => buildTree(roles), [roles])

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title="Jerarquía de roles"
      description="Vista de árbol de todos los roles y su estructura de herencia."
      size="lg"
      footer={
        <ButtonComponent onClick={onClose}>Cerrar</ButtonComponent>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto -mx-2">
        {tree.length === 0 ? (
          <p className="text-sm text-(--color-text-muted) text-center py-4">
            No hay roles para mostrar.
          </p>
        ) : (
          tree.map((node) => <TreeNode key={node.id} node={node} depth={0} />)
        )}
      </div>
    </PopUp>
  )
}
