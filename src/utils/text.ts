/** Lowercase without accents, so a search for "sesion" finds "sesión". */
export function normalizeText(text: string) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
