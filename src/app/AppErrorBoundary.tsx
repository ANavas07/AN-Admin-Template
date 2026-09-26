import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import ServerErrorPage from '../pages/system/ServerErrorPage'
import { createErrorReference } from '../pages/system/errorReference'

type AppErrorBoundaryProps = {
    children: ReactNode
    /** Changing it (e.g. the pathname) clears the error: navigating away recovers the app */
    resetKey?: string
}

type AppErrorBoundaryState = {
    referenceId: string | null
    resetKey?: string
}

/**
 * Catches render errors of any page and shows the 500 page with a reference
 * id. The same id is logged, so support can match a user report with the log.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = { referenceId: null, resetKey: this.props.resetKey }

    static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
        return { referenceId: createErrorReference() }
    }

    static getDerivedStateFromProps(props: AppErrorBoundaryProps, state: AppErrorBoundaryState) {
        return props.resetKey !== state.resetKey ? { referenceId: null, resetKey: props.resetKey } : null
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // PLANTILLA: envía aquí el error a tu servicio de monitoreo con la referencia
        console.error(`[${this.state.referenceId ?? 'ERR'}]`, error, info.componentStack)
    }

    render() {
        if (this.state.referenceId) {
            return (
                <ServerErrorPage referenceId={this.state.referenceId} onRetry={() => this.setState({ referenceId: null })} />
            )
        }
        return this.props.children
    }
}
