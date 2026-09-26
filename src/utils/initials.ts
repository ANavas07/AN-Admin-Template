/** Up to `max` uppercase initials of a person's name: "Ana María López" → "AM". */
export function getInitials(name: string, max = 2) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, max)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
}
