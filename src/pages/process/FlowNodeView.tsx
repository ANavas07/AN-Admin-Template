import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'
import { NoteIcon } from '../../icons/icons'
import {
    getDefaultDimensions,
    getNodeHeight,
    getNodeWidth,
    isContainer,
    nodeColorStyles,
} from './flowTypes'
import type { FlowNode } from './flowTypes'

type FlowNodeViewProps = {
    node: FlowNode
    isSelected: boolean
    isConnectSource: boolean
    /** True while a connection from another node is pending — highlights input ports */
    isConnectCandidate: boolean
    onPointerDown: (event: ReactPointerEvent) => void
    onPointerMove: (event: ReactPointerEvent) => void
    onPointerUp: (event: ReactPointerEvent) => void
    onContextMenu: (event: ReactMouseEvent) => void
    onStartConnection: (event: ReactPointerEvent) => void
    onPortPointerMove: (event: ReactPointerEvent) => void
    onPortPointerUp: (event: ReactPointerEvent) => void
    onCompleteConnection: (event: ReactPointerEvent) => void
    onResizeStart: (event: ReactPointerEvent) => void
    onResizeMove: (event: ReactPointerEvent) => void
    onResizeEnd: (event: ReactPointerEvent) => void
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function FlowNodeView({
    node,
    isSelected,
    isConnectSource,
    isConnectCandidate,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onContextMenu,
    onStartConnection,
    onPortPointerMove,
    onPortPointerUp,
    onCompleteConnection,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
}: FlowNodeViewProps) {
    const colorStyle = nodeColorStyles[node.color]
    const width = getNodeWidth(node)
    const portY = getDefaultDimensions(node.kind).portY
    const container = isContainer(node.kind)

    const ports = (
        <>
            {/* Input port (left) */}
            <button
                type="button"
                data-flow-port="input"
                onPointerDown={onCompleteConnection}
                className={cn(
                    'absolute -left-2.5 z-10 h-5 w-5 rounded-full border-2 bg-(--color-surface) transition-transform',
                    colorStyle.border,
                    isConnectCandidate ? 'scale-125 animate-pulse cursor-pointer' : 'cursor-crosshair'
                )}
                style={{ top: portY - 10 }}
                aria-label={`Connect into ${node.title}`}
                title="Input port"
            />
            {/* Output port (right) */}
            <button
                type="button"
                data-flow-port="output"
                onPointerDown={onStartConnection}
                onPointerMove={onPortPointerMove}
                onPointerUp={onPortPointerUp}
                className={cn(
                    'absolute -right-2.5 z-10 h-5 w-5 cursor-crosshair touch-none rounded-full border-2 bg-(--color-surface) transition-transform hover:scale-125',
                    colorStyle.border,
                    isConnectSource ? 'scale-125 ring-2 ring-brand/40' : ''
                )}
                style={{ top: portY - 10 }}
                aria-label={`Start connection from ${node.title}`}
                title="Output port — drag to another element to connect"
            />
        </>
    )

    let body: React.ReactNode

    switch (node.kind) {
        case 'start':
        case 'end': {
            const isStart = node.kind === 'start'
            body = (
                <>
                    <div
                        className={cn(
                            'flex h-16 w-16 items-center justify-center rounded-full bg-(--color-surface) shadow-sm',
                            isStart ? 'border-2 border-emerald-500' : 'border-[5px] border-rose-500',
                            isSelected ? 'ring-2 ring-brand/40 ring-offset-2 ring-offset-(--color-bg)' : ''
                        )}
                    >
                        <span
                            className={cn(
                                'px-1 text-center text-[10px] font-bold uppercase tracking-wide',
                                isStart ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            )}
                        >
                            {node.title}
                        </span>
                    </div>
                    {node.description ? (
                        <p className="absolute left-1/2 top-full mt-1 w-32 -translate-x-1/2 text-center text-[10px] leading-3 text-(--color-text-muted)">
                            {node.description}
                        </p>
                    ) : null}
                </>
            )
            break
        }

        case 'decision': {
            body = (
                <div className="relative h-32 w-32">
                    <div
                        className={cn(
                            'absolute inset-4 rotate-45 rounded-xl border-2 bg-(--color-surface) shadow-sm',
                            colorStyle.border,
                            isSelected ? 'ring-2 ring-brand/40' : ''
                        )}
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <span className="line-clamp-3 text-center text-xs font-bold leading-4 text-(--color-text)">
                            {node.title}
                        </span>
                    </div>
                </div>
            )
            break
        }

        case 'note': {
            body = (
                <div
                    className={cn(
                        'rounded-lg border-2 border-dashed border-amber-500/70 bg-amber-50 px-3.5 py-3 shadow-sm dark:bg-amber-500/10',
                        isSelected ? 'ring-2 ring-brand/40' : ''
                    )}
                >
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <NoteIcon className="size-3.5 shrink-0" />
                        <span className="truncate">{node.title}</span>
                    </p>
                    {node.description ? (
                        <p className="mt-1.5 line-clamp-5 text-[11px] leading-4 text-amber-900/80 dark:text-amber-200/80">
                            {node.description}
                        </p>
                    ) : null}
                </div>
            )
            break
        }

        case 'data': {
            body = (
                <div
                    className={cn(
                        'relative rounded-xl border bg-(--color-surface) shadow-sm',
                        isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-(--color-border)'
                    )}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
                >
                    {/* Folded corner */}
                    <span
                        className="absolute right-0 top-0 h-4 w-4 rounded-bl-lg border-b border-l border-(--color-border) bg-(--color-bg-soft)"
                        aria-hidden="true"
                    />
                    <div className={`h-1.5 ${colorStyle.bar}`} style={{ width: 'calc(100% - 16px)' }} />
                    <div className="px-3.5 py-2.5">
                        <p className="truncate text-xs font-bold text-(--color-text)">{node.title}</p>
                        {node.description ? (
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-(--color-text-muted)">
                                {node.description}
                            </p>
                        ) : null}
                    </div>
                </div>
            )
            break
        }

        case 'group': {
            body = (
                <div
                    className={cn(
                        'h-full w-full rounded-2xl border-2 border-dashed',
                        colorStyle.border,
                        colorStyle.soft,
                        isSelected ? 'ring-2 ring-brand/40' : ''
                    )}
                >
                    <span className="absolute left-3 top-2 max-w-[80%] truncate rounded-full bg-(--color-surface) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--color-text-muted) shadow-sm">
                        {node.title}
                    </span>
                </div>
            )
            break
        }

        case 'lane': {
            body = (
                <div
                    className={cn(
                        'flex h-full w-full overflow-hidden rounded-xl border bg-(--color-surface)/40',
                        isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-(--color-border)'
                    )}
                >
                    <div className={cn('flex w-7 shrink-0 items-center justify-center border-r border-(--color-border)', colorStyle.soft)}>
                        <span
                            className="rotate-180 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-text-muted)"
                            style={{ writingMode: 'vertical-rl', maxHeight: '90%' }}
                        >
                            {node.title}
                        </span>
                    </div>
                </div>
            )
            break
        }

        default: {
            // task — rounded rectangle
            body = (
                <div
                    className={cn(
                        'rounded-2xl border bg-(--color-surface) shadow-sm transition-shadow',
                        isSelected ? 'border-brand shadow-lg ring-2 ring-brand/30' : 'border-(--color-border) hover:shadow-md'
                    )}
                >
                    <div className={`h-1.5 rounded-t-2xl ${colorStyle.bar}`} />
                    <div className="px-4 py-3">
                        <p className="truncate text-sm font-bold text-(--color-text)">{node.title}</p>
                        {node.description ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--color-text-muted)">
                                {node.description}
                            </p>
                        ) : null}
                        {node.note ? (
                            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-4 text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300">
                                <NoteIcon className="mt-0.5 size-3.5 shrink-0" />
                                <span className="line-clamp-3">{node.note}</span>
                            </p>
                        ) : null}
                    </div>
                </div>
            )
        }
    }

    return (
        <div
            data-node-id={node.id}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onContextMenu={onContextMenu}
            className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
            style={{
                left: node.x,
                top: node.y,
                width,
                height: container ? getNodeHeight(node) : undefined,
                zIndex: container ? 1 : 10,
            }}
            role="button"
            tabIndex={0}
            aria-label={`${node.kind} element: ${node.title}`}
        >
            {body}
            {ports}
            {container ? (
                <button
                    type="button"
                    onPointerDown={onResizeStart}
                    onPointerMove={onResizeMove}
                    onPointerUp={onResizeEnd}
                    className={cn(
                        'absolute -bottom-1.5 -right-1.5 z-10 h-4 w-4 cursor-se-resize touch-none rounded-sm border-2 bg-(--color-surface)',
                        colorStyle.border
                    )}
                    aria-label={`Resize ${node.title}`}
                    title="Drag to resize"
                />
            ) : null}
        </div>
    )
}
