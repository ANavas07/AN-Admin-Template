import type { ReactNode } from 'react'
import ButtonComponent from '../../ui/buttons/ButtonComponent'
import PopUp from './PopUp'

type ConfirmDialogProps = {
    isOpen: boolean
    title: string
    description?: string
    children?: ReactNode
    confirmLabel: string
    /** Destructive actions use the danger button */
    tone?: 'danger' | 'primary'
    isConfirming?: boolean
    onConfirm: () => void
    onCancel: () => void
}

/** Confirmation for actions that are hard to undo (revoke, delete, rotate). */
export default function ConfirmDialog({
    isOpen,
    title,
    description,
    children,
    confirmLabel,
    tone = 'danger',
    isConfirming = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <PopUp
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            description={description}
            size="sm"
            footer={
                <>
                    <ButtonComponent variant="outline" onClick={onCancel} disabled={isConfirming}>
                        Cancelar
                    </ButtonComponent>
                    <ButtonComponent variant={tone} onClick={onConfirm} isLoading={isConfirming}>
                        {confirmLabel}
                    </ButtonComponent>
                </>
            }
        >
            {children}
        </PopUp>
    )
}
