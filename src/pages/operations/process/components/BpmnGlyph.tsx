// Shared BPMN iconography: one glyph per element type, reused by the palette,
// the node badges and the properties panel.
import type { BpmnType, NodeKind } from '../flowTypes'

type BpmnGlyphProps = {
    kind: NodeKind
    bpmnType: BpmnType | null
    className?: string
}

function TimerMark() {
    return (
        <>
            <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 7.5V10l1.8 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
    )
}

function MessageMark() {
    return (
        <>
            <rect x="5.5" y="7" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="m5.8 7.6 4.2 3 4.2-3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </>
    )
}

export default function BpmnGlyph({ kind, bpmnType, className = 'size-5' }: BpmnGlyphProps) {
    let content: React.ReactNode

    switch (bpmnType) {
        case 'startEvent':
            content = <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            break
        case 'timerStartEvent':
            content = (
                <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <TimerMark />
                </>
            )
            break
        case 'messageStartEvent':
            content = (
                <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <MessageMark />
                </>
            )
            break
        case 'intermediateEvent':
            content = (
                <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="10" cy="10" r="4.8" stroke="currentColor" strokeWidth="1.2" />
                </>
            )
            break
        case 'timerIntermediateEvent':
            content = (
                <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.1" />
                    <TimerMark />
                </>
            )
            break
        case 'messageIntermediateEvent':
            content = (
                <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.1" />
                    <MessageMark />
                </>
            )
            break
        case 'endEvent':
            content = <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="3" />
            break
        case 'userTask':
            content = (
                <>
                    <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4.5 16.5c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </>
            )
            break
        case 'serviceTask':
            content = (
                <>
                    <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                    <path
                        d="M10 4.2v2M10 13.8v2M4.2 10h2M13.8 10h2M5.9 5.9l1.4 1.4M12.7 12.7l1.4 1.4M14.1 5.9l-1.4 1.4M7.3 12.7l-1.4 1.4"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                </>
            )
            break
        case 'manualTask':
            content = (
                <path
                    d="M5 12.5V9.2c0-.7.5-1.2 1.2-1.2h6.1l2.4-2.2c.4-.3 1-.3 1.3.1.3.4.3.9-.1 1.2L14 9h1.6c.6 0 1.1.5 1.1 1.1 0 .6-.5 1.1-1.1 1.1H12M5 12.5c0 2 1.6 3.5 3.5 3.5h4c1.4 0 2.5-1.1 2.5-2.5v-2.3"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )
            break
        case 'scriptTask':
            content = (
                <path
                    d="m8 6.5-3.2 3.5L8 13.5M12 6.5l3.2 3.5-3.2 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )
            break
        case 'businessRuleTask':
            content = (
                <>
                    <rect x="4" y="5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4 8.5h12M8 8.5V15" stroke="currentColor" strokeWidth="1.3" />
                </>
            )
            break
        case 'subprocess':
            content = (
                <>
                    <rect x="3" y="4.5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 8.5v4M8 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </>
            )
            break
        case 'exclusiveGateway':
            content = (
                <>
                    <path d="M10 3 17 10 10 17 3 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="m7.8 7.8 4.4 4.4M12.2 7.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </>
            )
            break
        case 'inclusiveGateway':
            content = (
                <>
                    <path d="M10 3 17 10 10 17 3 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3" />
                </>
            )
            break
        case 'parallelGateway':
            content = (
                <>
                    <path d="M10 3 17 10 10 17 3 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M10 6.5v7M6.5 10h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </>
            )
            break
        case 'eventBasedGateway':
            content = (
                <>
                    <path d="M10 3 17 10 10 17 3 10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1" />
                    <path d="m10 7.6 2.1 1.6-.8 2.5H8.7l-.8-2.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                </>
            )
            break
        case 'task':
            content = <rect x="3" y="5" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
            break
        default:
            // Elements without bpmnType fall back to a kind-based glyph
            switch (kind) {
                case 'note':
                    content = (
                        <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2" />
                    )
                    break
                case 'data':
                    content = (
                        <>
                            <path d="M4 4h8l4 4v8H4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                            <path d="M12 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        </>
                    )
                    break
                case 'group':
                    content = (
                        <rect x="3" y="4" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2.5" />
                    )
                    break
                case 'lane':
                    content = (
                        <>
                            <rect x="2.5" y="5" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M6.5 5v10" stroke="currentColor" strokeWidth="1.6" />
                        </>
                    )
                    break
                default:
                    content = <rect x="3" y="5" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
            }
    }

    return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
            {content}
        </svg>
    )
}
