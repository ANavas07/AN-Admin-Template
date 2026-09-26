/**
 * File attachments shared by every module (process documents, support
 * tickets, mail, assistant). Small files keep their content inline so they
 * can be downloaded from localStorage; larger ones keep metadata only until a
 * file server exists.
 */
export type Attachment = {
    id: string
    name: string
    /** Bytes */
    size: number
    mimeType: string
    addedAt: string
    /** Inline content for small files; larger files keep metadata only */
    dataUrl?: string
}

/** Files up to this size keep their content inline. */
export const INLINE_ATTACHMENT_LIMIT = 300_000

function readAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

export function newAttachmentId() {
    return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Turns selected files into attachments (inline content for small files). */
export async function readFilesAsAttachments(files: Iterable<File>, inlineLimit = INLINE_ATTACHMENT_LIMIT) {
    const attachments: Attachment[] = []
    for (const file of files) {
        const attachment: Attachment = {
            id: newAttachmentId(),
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            addedAt: new Date().toISOString(),
        }
        if (file.size <= inlineLimit) {
            try {
                attachment.dataUrl = await readAsDataUrl(file)
            } catch {
                // Keep metadata only when the file cannot be read
            }
        }
        attachments.push(attachment)
    }
    return attachments
}

/** Downloads an attachment. Returns false when only its metadata is stored. */
export function downloadAttachment(attachment: Attachment) {
    if (!attachment.dataUrl) return false
    const anchor = document.createElement('a')
    anchor.href = attachment.dataUrl
    anchor.download = attachment.name
    anchor.click()
    return true
}
