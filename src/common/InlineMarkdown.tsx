import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

export default function InlineMarkdown({
  source,
  className = '',
  allowParagraphs = false,
}: {
  source: string
  className?: string
  allowParagraphs?: boolean
}): JSX.Element {
  const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), 'sub', 'sup'],
  }
  const formattedSource = source
    .replace(/~([^~]+)~/g, '<sub>$1</sub>')
    .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')

  return (
    <ReactMarkdown
      className={className}
      rehypePlugins={[
        rehypeRaw as unknown as never,
        [rehypeSanitize, sanitizeSchema] as unknown as never,
      ]}
      disallowedElements={allowParagraphs ? [] : ['p']}
      unwrapDisallowed
      components={{
        sub: ({ children }) => <sub>{children}</sub>,
        sup: ({ children }) => <sup>{children}</sup>,
      }}
    >
      {formattedSource}
    </ReactMarkdown>
  )
}
