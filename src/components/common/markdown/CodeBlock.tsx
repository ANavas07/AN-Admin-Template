import { Highlight } from 'prism-react-renderer'
import CopyButton from '../../ui/copy-button/CopyButton'
import { codeTheme } from './codeTheme'

type CodeBlockProps = {
    code: string
    language?: string
}

/** Highlighted code with its language and a copy action. Renders tokens, never raw HTML. */
export default function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
    return (
        <div className="my-3 overflow-hidden rounded-lg border border-line bg-code-bg">
            <div className="flex items-center justify-between border-b border-line px-3 py-1">
                <span className="font-mono text-2xs uppercase tracking-caps text-fg-subtle">{language}</span>
                <CopyButton value={code} label="Copiar código" showLabel />
            </div>
            <Highlight code={code} language={language} theme={codeTheme}>
                {({ tokens, getLineProps, getTokenProps }) => (
                    <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-6">
                        {tokens.map((line, lineIndex) => (
                            <div key={lineIndex} {...getLineProps({ line })}>
                                {line.map((token, tokenIndex) => (
                                    <span key={tokenIndex} {...getTokenProps({ token })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    )
}
