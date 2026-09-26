import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref } from 'react'
import { FileDocIcon, NoteIcon, UserIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import BpmnGlyph from './components/BpmnGlyph'
import {
    bpmnTypeLabels,
    getNodeHeight,
    getNodeWidth,
    isContainer,
    nodeColorStyles,
} from './flowTypes'
import type { FlowNode } from './flowTypes'

type FlowNodeViewProps = {
    node: FlowNode
    /** Lets the designer measure the rendered size of the node */
    measureRef?: Ref<HTMLDivElement>
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

export default function FlowNodeView({
    node,
    measureRef,
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
    const container = isContainer(node.kind)

    // Ports sit on the vertical middle of the node, where a single connection is anchored
    const ports = (
        <>
            {/* Input port (left) */}
            <button
                type="button"
                data-flow-port="input"
                onPointerDown={onCompleteConnection}
                className={cn(
                    'absolute -left-2.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 bg-surface transition-transform',
                    colorStyle.border,
                    isConnectCandidate ? 'scale-125 animate-pulse cursor-pointer' : 'cursor-crosshair'
                )}
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
                    'absolute -right-2.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 cursor-crosshair touch-none rounded-full border-2 bg-surface transition-transform hover:scale-125',
                    colorStyle.border,
                    isConnectSource ? 'scale-125 ring-2 ring-brand/40' : ''
                )}
                aria-label={`Start connection from ${node.title}`}
                title="Output port — drag to another element to connect"
            />
        </>
    )

    let body: ReactNode

    switch (node.kind) {
        case 'start':
        case 'end':
        case 'intermediate': {
            const isStart = node.kind === 'start'
            const isIntermediate = node.kind === 'intermediate'
            // Timer / message start & intermediate events show their marker inside the circle
            const hasMarker = node.bpmnType !== null && node.bpmnType !== 'startEvent' && node.bpmnType !== 'endEvent'
            const accentText = isStart
                ? 'text-success'
                : isIntermediate
                    ? 'text-info'
                    : 'text-danger'
            body = (
                <>
                    <div
                        className={cn(
                            'flex h-16 w-16 flex-col items-center justify-center rounded-full bg-surface shadow-sm',
                            isStart
                                ? 'border-2 border-success'
                                : isIntermediate
                                    ? 'border-2 border-info ring-2 ring-inset ring-info/60 ring-offset-2 ring-offset-surface'
                                    : 'border-[5px] border-danger',
                            isSelected ? 'ring-2 ring-brand/40 ring-offset-2 ring-offset-canvas' : ''
                        )}
                        title={node.bpmnType ? bpmnTypeLabels[node.bpmnType] : undefined}
                    >
                        {hasMarker ? (
                            <BpmnGlyph kind={node.kind} bpmnType={node.bpmnType} className={cn('size-5', accentText)} />
                        ) : null}
                        <span
                            className={cn(
                                'px-1 text-center text-3xs font-bold uppercase tracking-caps',
                                hasMarker ? 'line-clamp-1' : '',
                                accentText
                            )}
                        >
                            {node.title}
                        </span>
                    </div>
                    {node.description ? (
                        <p className="absolute left-1/2 top-full mt-1 w-32 -translate-x-1/2 text-center text-3xs leading-3 text-fg-muted">
                            {node.description}
                        </p>
                    ) : null}
                </>
            )
            break
        }

        case 'decision': {
            body = (
                <div className="relative h-32 w-32" title={node.bpmnType ? bpmnTypeLabels[node.bpmnType] : undefined}>
                    <div
                        className={cn(
                            'absolute inset-4 rotate-45 rounded-xl border-2 bg-surface shadow-sm',
                            colorStyle.border,
                            isSelected ? 'ring-2 ring-brand/40' : ''
                        )}
                    />
                    {/* Gateway type marker (X / O / + / event) */}
                    {node.bpmnType && node.bpmnType !== 'exclusiveGateway' ? (
                        <span className="absolute left-1/2 top-1.5 -translate-x-1/2 rounded-full bg-surface p-0.5 text-fg-muted">
                            <BpmnGlyph kind="decision" bpmnType={node.bpmnType} className="size-4" />
                        </span>
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <span className="line-clamp-3 text-center text-xs font-semibold leading-4 text-fg">
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
                        'rounded-lg border-2 border-dashed border-warning/60 bg-warning-soft px-3.5 py-3 shadow-sm',
                        isSelected ? 'ring-2 ring-brand/40' : ''
                    )}
                >
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                        <NoteIcon className="size-3.5 shrink-0" />
                        <span className="truncate">{node.title}</span>
                    </p>
                    {node.description ? (
                        <p className="mt-1.5 line-clamp-5 text-2xs leading-4 text-fg-muted">
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
                        'relative rounded-xl border bg-surface shadow-sm',
                        isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-line'
                    )}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
                >
                    {/* Folded corner */}
                    <span
                        className="absolute right-0 top-0 h-4 w-4 rounded-bl-lg border-b border-l border-line bg-canvas-subtle"
                        aria-hidden="true"
                    />
                    <div className={`h-1.5 ${colorStyle.bar}`} style={{ width: 'calc(100% - 16px)' }} />
                    <div className="px-3.5 py-2.5">
                        <p className="truncate text-xs font-semibold text-fg">{node.title}</p>
                        {node.description ? (
                            <p className="mt-0.5 line-clamp-2 text-2xs leading-4 text-fg-muted">
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
                    <span className="absolute left-3 top-2 max-w-[80%] truncate rounded-full bg-surface px-2.5 py-0.5 text-3xs font-bold uppercase tracking-caps text-fg-muted shadow-sm">
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
                        'flex h-full w-full overflow-hidden rounded-xl border bg-surface/40',
                        isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-line'
                    )}
                >
                    <div className={cn('flex w-7 shrink-0 items-center justify-center border-r border-line', colorStyle.soft)}>
                        <span
                            className="rotate-180 truncate text-3xs font-bold uppercase tracking-caps text-fg-muted"
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
                        'rounded-2xl border bg-surface shadow-sm transition-shadow',
                        isSelected ? 'border-brand shadow-lg ring-2 ring-brand/30' : 'border-line hover:shadow-md'
                    )}
                >
                    <div className={`h-1.5 rounded-t-2xl ${colorStyle.bar}`} />
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                            {/* BPMN task-type badge (user / service / manual / script / rule / subprocess) */}
                            {node.bpmnType && node.bpmnType !== 'task' ? (
                                <span
                                    className="shrink-0 text-fg-muted"
                                    title={bpmnTypeLabels[node.bpmnType]}
                                >
                                    <BpmnGlyph kind="task" bpmnType={node.bpmnType} className="size-3.5" />
                                </span>
                            ) : null}
                            <p className="truncate text-sm font-semibold text-fg">{node.title}</p>
                        </div>
                        {node.description ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-fg-muted">
                                {node.description}
                            </p>
                        ) : null}
                        {node.note ? (
                            <p className="mt-2 flex items-start gap-1.5 rounded-md bg-warning-soft px-2.5 py-1.5 text-2xs leading-4 text-warning ring-1 ring-warning/20">
                                <NoteIcon className="mt-0.5 size-3.5 shrink-0" />
                                <span className="line-clamp-3">{node.note}</span>
                            </p>
                        ) : null}
                        {node.data.responsible || node.data.documents.length > 0 ? (
                            <p className="mt-1.5 flex items-center gap-2 text-3xs text-fg-muted">
                                {node.data.responsible ? (
                                    <span className="flex min-w-0 items-center gap-1" title={`Responsable: ${node.data.responsible}`}>
                                        <UserIcon className="size-3 shrink-0" />
                                        <span className="truncate">{node.data.responsible}</span>
                                    </span>
                                ) : null}
                                {node.data.documents.length > 0 ? (
                                    <span className="flex shrink-0 items-center gap-1" title={`${node.data.documents.length} documento(s)`}>
                                        <FileDocIcon className="size-3" />
                                        {node.data.documents.length}
                                    </span>
                                ) : null}
                            </p>
                        ) : null}
                    </div>
                </div>
            )
        }
    }

    return (
        <div
            ref={measureRef}
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
                        'absolute -bottom-1.5 -right-1.5 z-10 h-4 w-4 cursor-se-resize touch-none rounded-sm border-2 bg-surface',
                        colorStyle.border
                    )}
                    aria-label={`Resize ${node.title}`}
                    title="Drag to resize"
                />
            ) : null}
        </div>
    )
}
