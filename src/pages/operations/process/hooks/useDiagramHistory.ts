import { useCallback, useRef, useState } from 'react'
import type { DiagramSnapshot, FlowEdge, FlowNode } from '../flowTypes'

export type DiagramState = { nodes: FlowNode[]; edges: FlowEdge[] }

type HistoryState = {
    past: DiagramState[]
    present: DiagramState
    future: DiagramState[]
}

const HISTORY_LIMIT = 60

/**
 * Diagram state with undo/redo, modelled as pure past/present/future state.
 *
 * - `apply` records the previous state (structural changes: add / remove / connect).
 * - `applyTransient` mutates without recording (drag frames, text typing) so the
 *   history keeps one entry per gesture instead of one per pixel/keystroke.
 * - `beginGesture` / `endGesture` bracket pointer gestures: the pre-gesture state
 *   is recorded once, and only when the gesture actually changed something.
 */
export function useDiagramHistory(initial: DiagramState) {
    const [history, setHistory] = useState<HistoryState>({ past: [], present: initial, future: [] })
    const gestureSnapshot = useRef<DiagramState | null>(null)

    const apply = useCallback((updater: (current: DiagramState) => DiagramState) => {
        setHistory((current) => {
            const next = updater(current.present)
            if (next === current.present) return current
            return {
                past: [...current.past, current.present].slice(-HISTORY_LIMIT),
                present: next,
                future: [],
            }
        })
    }, [])

    const applyTransient = useCallback((updater: (current: DiagramState) => DiagramState) => {
        setHistory((current) => {
            const next = updater(current.present)
            return next === current.present ? current : { ...current, present: next }
        })
    }, [])

    /** Called from a pointer-down handler, so `history.present` is up to date. */
    function beginGesture() {
        gestureSnapshot.current = history.present
    }

    const endGesture = useCallback(() => {
        const snapshot = gestureSnapshot.current
        gestureSnapshot.current = null
        if (!snapshot) return
        setHistory((current) => {
            if (current.present === snapshot) return current
            return {
                past: [...current.past, snapshot].slice(-HISTORY_LIMIT),
                present: current.present,
                future: [],
            }
        })
    }, [])

    const undo = useCallback(() => {
        setHistory((current) => {
            const previous = current.past[current.past.length - 1]
            if (!previous) return current
            return {
                past: current.past.slice(0, -1),
                present: previous,
                future: [...current.future, current.present],
            }
        })
    }, [])

    const redo = useCallback(() => {
        setHistory((current) => {
            const next = current.future[current.future.length - 1]
            if (!next) return current
            return {
                past: [...current.past, current.present],
                present: next,
                future: current.future.slice(0, -1),
            }
        })
    }, [])

    /** Replaces the whole diagram and clears the history (load / import). */
    const reset = useCallback((next: DiagramState) => {
        gestureSnapshot.current = null
        setHistory({ past: [], present: next, future: [] })
    }, [])

    return {
        nodes: history.present.nodes,
        edges: history.present.edges,
        snapshot: (): DiagramSnapshot => ({
            version: 2,
            nodes: history.present.nodes,
            edges: history.present.edges,
        }),
        apply,
        applyTransient,
        beginGesture,
        endGesture,
        undo,
        redo,
        reset,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    }
}
