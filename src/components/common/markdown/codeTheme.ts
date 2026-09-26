import type { PrismTheme } from 'prism-react-renderer'

/** Syntax colors from the design tokens, so code follows light / dark mode. */
export const codeTheme: PrismTheme = {
    plain: { color: 'var(--color-code-fg)', backgroundColor: 'transparent' },
    styles: [
        { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--color-code-comment)', fontStyle: 'italic' } },
        { types: ['keyword', 'boolean', 'important', 'atrule', 'selector'], style: { color: 'var(--color-code-keyword)' } },
        { types: ['string', 'char', 'attr-value', 'inserted', 'regex'], style: { color: 'var(--color-code-string)' } },
        { types: ['number', 'constant', 'symbol'], style: { color: 'var(--color-code-number)' } },
        { types: ['function', 'class-name', 'builtin'], style: { color: 'var(--color-code-function)' } },
        { types: ['punctuation', 'operator'], style: { color: 'var(--color-code-punctuation)' } },
        { types: ['tag', 'property', 'deleted', 'variable'], style: { color: 'var(--color-code-tag)' } },
        { types: ['attr-name'], style: { color: 'var(--color-code-function)' } },
    ],
}
