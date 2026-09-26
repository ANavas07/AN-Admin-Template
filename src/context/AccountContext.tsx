import { useEffect, useState, type ReactNode } from 'react'
import { accountService, DEFAULT_PREFERENCES } from '../services/account/account.service'
import type { AccountState, ProfileDetails } from '../services/account/account.service'
import { AccountContext } from './account-context'

type AccountProviderProps = {
    userId: string
    /** Receives the stored profile details so the session user reflects them */
    onProfileChange: (profile: Partial<ProfileDetails>) => void
    children: ReactNode
}

/** Profile, preferences and security of the signed-in user, loaded when the session starts. */
export function AccountProvider({ userId, onProfileChange, children }: AccountProviderProps) {
    const [account, setAccount] = useState<AccountState | null>(null)

    useEffect(() => {
        let cancelled = false
        accountService.load(userId).then((loaded) => {
            if (cancelled) return
            setAccount(loaded)
            onProfileChange(loaded.profile)
        })
        return () => {
            cancelled = true
        }
        // onProfileChange is a parent setter wrapper; reloading only depends on the user
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    return (
        <AccountContext.Provider
            value={{
                account,
                preferences: account?.preferences ?? DEFAULT_PREFERENCES,
                updateProfile: async (patch) => {
                    const next = await accountService.updateProfile(userId, patch)
                    setAccount(next)
                    onProfileChange(next.profile)
                },
                updatePreferences: (patch) => {
                    accountService.updatePreferences(userId, patch).then(setAccount)
                },
                changePassword: async (current, next) => {
                    setAccount(await accountService.changePassword(userId, current, next))
                },
                setTwoFactor: async (enabled) => {
                    setAccount(await accountService.setTwoFactor(userId, enabled))
                },
                revokeSessions: async (sessionId) => {
                    setAccount(await accountService.revokeSessions(userId, sessionId))
                },
            }}
        >
            {children}
        </AccountContext.Provider>
    )
}
