import ReactMarkdown from 'react-markdown'
import React, { ElementType } from 'react'
import remarkSubSuper from 'remark-sub-super'
type MarkdownProps = {
  text: string
  paragraph?: ElementType
  className?: string
  isReplaceCurlyQuotes?: boolean
}
export function replaceByCurlyQuotes(str: string): string {
  return str.replace(/"([^"]*)"/g, '“$1”')
}

export function Markdown({
  text,
  paragraph = 'span',
  className = '',
  isReplaceCurlyQuotes = true,
}: MarkdownProps): JSX.Element {
  return (
    <ReactMarkdown
      className={className}
      plugins={[remarkSubSuper]}
      renderers={{
        paragraph: paragraph,
        sub: 'sub',
        sup: 'sup',
      }}
    >
      {isReplaceCurlyQuotes ? replaceByCurlyQuotes(text) : text}
    </ReactMarkdown>
  )
}

export function MarkdownParagraph(
  props: Omit<MarkdownProps, 'paragraph'>
): JSX.Element {
  return <Markdown paragraph={'p'} {...props} />
}
