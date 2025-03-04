import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkSubSuper from 'remark-sub-super'

interface RenderProps {
  children: React.ReactNode
}

export default function InlineMarkdown({
  source,
  className = '',
  allowParagraphs = false,
}: {
  source: string
  className?: string
  allowParagraphs?: boolean
}): JSX.Element {
  return (
    <ReactMarkdown
      className={className}
      source={source}
      plugins={[remarkSubSuper]}
      disallowedTypes={allowParagraphs ? [] : ['paragraph']}
      unwrapDisallowed
      renderers={{
        sub: ({ children }: RenderProps) => <sub>{children}</sub>,
        sup: ({ children }: RenderProps) => <sup>{children}</sup>,
      }}
    />
  )
}
