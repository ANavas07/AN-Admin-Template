/** True on macOS / iOS, where shortcuts use ⌘ instead of Ctrl. */
export function isApplePlatform() {
    if (typeof navigator === 'undefined') return false
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** Label of the primary modifier key for shortcut hints. */
export function modifierKeyLabel() {
    return isApplePlatform() ? '⌘' : 'Ctrl'
}
