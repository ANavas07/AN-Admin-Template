import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { useWorkspace } from '../../../../context/workspace-context'
import { apiKeysService } from '../../../../services/api-keys/apiKeys.service'
import type { ApiKey, ApiKeyInput, ApiKeyPatch, ApiKeysState, IssuedKey } from '../../../../services/api-keys/apiKeys.service'

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

/**
 * State and actions of the API keys screen. Components only render and call
 * these; the service owns validation, hashing and the audit trail.
 */
export function useApiKeys() {
    const { user } = useWorkspace()
    const actor = { id: user.id, name: user.name }
    const [state, setState] = useState<ApiKeysState | null>(null)

    useEffect(() => {
        let isCurrent = true
        apiKeysService.list().then((loaded) => {
            if (isCurrent) setState(loaded)
        })
        return () => {
            isCurrent = false
        }
    }, [])

    // Every mutation re-reads the store so the audit trail stays in sync
    const refresh = () => apiKeysService.list().then(setState)

    async function run<T>(action: () => Promise<T>, success: string, failure: string): Promise<T | null> {
        try {
            const result = await action()
            await refresh()
            sileo.success({ title: success })
            return result
        } catch (error) {
            sileo.error({ title: errorMessage(error, failure) })
            return null
        }
    }

    return {
        keys: state?.keys ?? [],
        audit: state?.audit ?? [],
        isLoading: state === null,
        create: (input: ApiKeyInput): Promise<IssuedKey | null> =>
            run(() => apiKeysService.create(input, actor), 'API key generada', 'No se pudo generar la API key.'),
        register: (input: ApiKeyInput, secret: string): Promise<ApiKey | null> =>
            run(() => apiKeysService.register(input, secret, actor), 'API key registrada', 'No se pudo registrar la API key.'),
        update: (id: string, patch: ApiKeyPatch) =>
            run(() => apiKeysService.update(id, patch, actor), 'Cambios guardados', 'No se pudo actualizar la API key.'),
        setActive: (key: ApiKey, active: boolean) =>
            run(
                () => apiKeysService.setActive(key.id, active, actor),
                active ? `"${key.name}" activada` : `"${key.name}" desactivada`,
                'No se pudo cambiar el estado.'
            ),
        regenerate: (key: ApiKey): Promise<IssuedKey | null> =>
            run(() => apiKeysService.regenerate(key.id, actor), 'Nueva clave emitida', 'No se pudo rotar la API key.'),
        revoke: (key: ApiKey, reason: string) =>
            run(() => apiKeysService.revoke(key.id, reason, actor), `"${key.name}" revocada`, 'No se pudo revocar la API key.'),
        recordCopy: (key: ApiKey) => apiKeysService.recordCopy(key.id, actor).then(refresh),
    }
}
