/** Joins the truthy class names, so conditional classes can be written inline. */
export function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}
