import { useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import Alert from '../../../../components/ui/alert/Alert'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import CopyButton from '../../../../components/ui/copy-button/CopyButton'
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from '../../../../icons/icons'
import type { IssuedKey } from '../../../../services/api-keys/apiKeys.service'
import { maskKey } from '../../../../services/api-keys/apiKeyCrypto'

type SecretRevealModalProps = {
    issued: IssuedKey
    /** True after a rotation: the previous value stopped working */
    isRotation: boolean
    onCopied: () => void
    onClose: () => void
}

/**
 * The only screen where a full key is visible. It is masked until the user
 * reveals it, cannot be dismissed by clicking outside, and closes only after
 * the user confirms the key was stored. The parent drops the secret on close.
 */
export default function SecretRevealModal({ issued, isRotation, onCopied, onClose }: SecretRevealModalProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasCopied, setHasCopied] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    const { key, secret } = issued

    return (
        <PopUp
            isOpen
            onClose={() => (confirmed ? onClose() : undefined)}
            closeOnOverlay={false}
            title={isRotation ? 'Nueva clave emitida' : 'API key generada'}
            description={key.name}
            footer={
                <ButtonComponent onClick={onClose} disabled={!confirmed}>
                    Listo
                </ButtonComponent>
            }
        >
            <div className="space-y-4">
                <Alert tone="warning" icon={<AlertTriangleIcon className="size-4" />} title="Cópiala ahora">
                    Por seguridad no volverás a verla: solo se guarda su huella. Si la pierdes, tendrás que rotarla.
                    {isRotation ? ' La clave anterior dejó de funcionar.' : ''}
                </Alert>

                <div>
                    <p className="mb-1.5 text-sm font-medium text-fg">Clave secreta</p>
                    <div className="flex items-center gap-1 rounded-md border border-line bg-canvas px-3 py-2">
                        <code className="min-w-0 flex-1 truncate font-mono text-sm text-fg" aria-label={isVisible ? 'Clave' : 'Clave oculta'}>
                            {isVisible ? secret : maskKey(key.prefix, key.lastFour)}
                        </code>
                        <button
                            type="button"
                            className="inline-flex size-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                            onClick={() => setIsVisible((current) => !current)}
                            aria-label={isVisible ? 'Ocultar clave' : 'Mostrar clave'}
                            aria-pressed={isVisible}
                        >
                            {isVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                        </button>
                        <CopyButton
                            value={() => secret}
                            label="Copiar clave"
                            showLabel
                            onCopied={() => {
                                if (!hasCopied) onCopied()
                                setHasCopied(true)
                            }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-fg-muted">
                        Guárdala en un gestor de secretos o en la variable de entorno del servicio. No la envíes por correo ni chat.
                    </p>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
                    <input
                        type="checkbox"
                        className="mt-0.5 size-4 accent-(--color-brand-solid)"
                        checked={confirmed}
                        onChange={(event) => setConfirmed(event.target.checked)}
                    />
                    Guardé la clave en un lugar seguro.
                </label>
            </div>
        </PopUp>
    )
}
