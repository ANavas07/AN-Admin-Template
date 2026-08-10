import { useCallback, useRef, useState } from 'react'
import type { DiagramSnapshot, FlowEdge, FlowNode } from '../flowTypes'

export type DiagramState = { nodes: FlowNode[]; edges: FlowEdge[] }

const HISTORY_LIMIT = 60

/**
 * Diagram state with undo/redo.
 *
 * - `apply` records the previous state (structural changes: add / remove / move commit).
 * - `applyTransient` mutates without recording (drag frames, text typing) so the
 *   history keeps one entry per gesture instead of one per pixel/keystroke.
 * - `beginGesture` / `endGesture` bracket pointer gestures: the pre-gesture state
 *   is recorded once, when the gesture actually changed something.
 */
export function useDiagramHistory(initial: DiagramState) {
    const [state, setState] = useState<DiagramState>(initial)
    const undoStack = useRef<DiagramState[]>([])
    const redoStack = useRef<DiagramState[]>([])
    const gestureSnapshot = useRef<DiagramState | null>(null)
    const [historyVersion, setHistoryVersion] = useState(0)

    const record = useCallback((previous: DiagramState) => {
        undoStack.current.push(previous)
        if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift()
        redoStack.current = []
        setHistoryVersion((version) => version + 1)
    }, [])

    const apply = useCallback(
        (updater: (current: DiagramState) => DiagramState) => {
            setState((current) => {
                const next = updater(current)
                if (next !== current) record(current)
                return next
            })
        },
        [record]
    )

    const applyTransient = useCallback((updater: (current: DiagramState) => DiagramState) => {
        setState(updater)
    }, [])

    const beginGesture = useCallback(() => {
        setState((current) => {
            gestureSnapshot.current = current
            return current
        })
    }, [])

    const endGesture = useCallback(() => {
        const snapshot = gestureSnapshot.current
        gestureSnapshot.current = null
        if (!snapshot) return
        setState((current) => {
            if (current !== snapshot) record(snapshot)
            return current
        })
    }, [record])

    const undo = useCallback(() => {
        setState((current) => {
            const previous = undoStack.current.pop()
            if (!previous) return current
            redoStack.current.push(current)
            setHistoryVersion((version) => version + 1)
            return previous
        })
    }, [])

    const redo = useCallback(() => {
        setState((current) => {
            const next = redoStack.current.pop()
            if (!next) return current
            undoStack.current.push(current)
            setHistoryVersion((version) => version + 1)
            return next
        })
    }, [])

    /** Replaces the whole diagram and clears the history (load / import). */
    const reset = useCallback((next: DiagramState) => {
        undoStack.current = []
        redoStack.current = []
        gestureSnapshot.current = null
        setState(next)
        setHistoryVersion((version) => version + 1)
    }, [])

    void historyVersion // re-render trigger for canUndo/canRedo

    return {
        nodes: state.nodes,
        edges: state.edges,
        snapshot: (): DiagramSnapshot => ({ version: 2, nodes: state.nodes, edges: state.edges }),
        apply,
        applyTransient,
        beginGesture,
        endGesture,
        undo,
        redo,
        reset,
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
    }
}
