type PlainObject = object

/** Trim all string values one level deep */
export function trimStrings<T extends PlainObject>(data: T): T {
    return Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ) as T
}

/** Remove null / undefined / empty-string fields */
export function stripEmpty<T extends PlainObject>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ) as Partial<T>
}

/** Trim + strip empty — use before every POST/PUT/PATCH */
export function sanitize<T extends PlainObject>(data: T): Partial<T> {
    return stripEmpty(trimStrings(data))
}
