import { createContext, useContext } from 'react'
import type { AccountState, Preferences, ProfileDetails } from '../services/account/account.service'

export type AccountContextType = {
    /** null until the account of the current user has been loaded */
    account: AccountState | null
    preferences: Preferences
    updateProfile: (patch: Partial<ProfileDetails>) => Promise<void>
    updatePreferences: (patch: Partial<Preferences>) => void
    changePassword: (current: string, next: string) => Promise<void>
    setTwoFactor: (enabled: boolean) => Promise<void>
    /** Closes one session, or all the others when no id is given */
    revokeSessions: (sessionId?: string) => Promise<void>
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function useAccount() {
    const context = useContext(AccountContext)
    if (context === undefined) throw new Error('useAccount debe ser usado dentro de AccountProvider')
    return context
}
