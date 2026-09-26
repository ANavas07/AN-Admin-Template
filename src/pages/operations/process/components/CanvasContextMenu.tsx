import { TrashBinIcon } from '../../../../icons/icons'

export type ContextMenuState = {
    /** Position relative to the designer root */
    x: number
    y: number
    targetType: 'node' | 'edge'
    targetId: string
}

type CanvasContextMenuProps = {
    menu: ContextMenuState
    onDuplicate: (nodeId: string) => void
    onRemove: (menu: ContextMenuState) => void
}

/** Right-click menu for nodes (duplicate / delete) and edges (delete). */
export default function CanvasContextMenu({ menu, onDuplicate, onRemove }: CanvasContextMenuProps) {
    return (
        <div
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute z-50 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl"
            style={{ left: menu.x, top: menu.y }}
            role="menu"
        >
            {menu.targetType === 'node' ? (
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => onDuplicate(menu.targetId)}
                    className="w-full px-4 py-2 text-left text-sm text-fg transition-colors hover:bg-canvas-subtle"
                >
                    Duplicar
                </button>
            ) : null}
            <button
                type="button"
                role="menuitem"
                onClick={() => onRemove(menu)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
            >
                <TrashBinIcon className="size-4" />
                Eliminar
            </button>
        </div>
    )
}
