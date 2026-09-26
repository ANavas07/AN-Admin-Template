// Key material helpers. The full secret only exists in memory while it is shown
// to the user once; storage keeps a SHA-256 hash plus prefix and last four
// characters, which is all a backend needs to verify and identify a key.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const SECRET_LENGTH = 40

export type KeyEnvironment = 'production' | 'staging' | 'development'

export const ENVIRONMENT_PREFIX: Record<KeyEnvironment, string> = {
    production: 'sk_live_',
    staging: 'sk_stg_',
    development: 'sk_test_',
}

/** Cryptographically random secret with an environment prefix, e.g. "sk_live_Xa9…". */
export function generateSecret(environment: KeyEnvironment) {
    const bytes = crypto.getRandomValues(new Uint8Array(SECRET_LENGTH))
    // Modulo bias is negligible for 256 values over 62 symbols in this context
    const body = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
    return `${ENVIRONMENT_PREFIX[environment]}${body}`
}

/** Hex SHA-256 of the secret: what gets stored instead of the key. */
export async function hashSecret(secret: string) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Prefix (up to and including the last "_") and last four characters of a secret. */
export function describeSecret(secret: string) {
    const separator = secret.lastIndexOf('_')
    return {
        prefix: separator > 0 && separator < 12 ? secret.slice(0, separator + 1) : secret.slice(0, 4),
        lastFour: secret.slice(-4),
    }
}

/** Masked representation for lists: "sk_live_••••••••••••a1B2". */
export function maskKey(prefix: string, lastFour: string) {
    return `${prefix}${'•'.repeat(12)}${lastFour}`
}
