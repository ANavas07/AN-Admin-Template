/** Short reference to quote to support, e.g. "ERR-20260926-7K3QX2". */
export function createErrorReference(date = new Date()) {
    const day = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0')
    return `ERR-${day}-${random}`
}

/** Support ticket prefilled with an error reference. */
export function supportTicketUrl(params: { subject: string; category: string; reference?: string }) {
    const query = new URLSearchParams({ subject: params.subject, category: params.category })
    if (params.reference) query.set('ref', params.reference)
    return `/support/new?${query.toString()}`
}
