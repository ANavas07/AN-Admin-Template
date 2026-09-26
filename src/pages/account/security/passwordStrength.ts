import type { StatusTone } from '../../../components/ui/tone'

export type PasswordCheck = { label: string; passed: boolean }

/** Policy checks shown next to the new password field. */
export function checkPassword(password: string): PasswordCheck[] {
    return [
        { label: 'Al menos 10 caracteres', passed: password.length >= 10 },
        { label: 'Una letra mayúscula y una minúscula', passed: /[A-Z]/.test(password) && /[a-z]/.test(password) },
        { label: 'Al menos un número', passed: /\d/.test(password) },
        { label: 'Al menos un símbolo', passed: /[^A-Za-z0-9]/.test(password) },
    ]
}

export function passwordStrength(password: string): { score: number; label: string; tone: StatusTone } {
    const score = checkPassword(password).filter((check) => check.passed).length
    if (!password) return { score: 0, label: '', tone: 'neutral' }
    if (score <= 1) return { score, label: 'Débil', tone: 'danger' }
    if (score <= 3) return { score, label: 'Aceptable', tone: 'warning' }
    return { score, label: 'Fuerte', tone: 'success' }
}
