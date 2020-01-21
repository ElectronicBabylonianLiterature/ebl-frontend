import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function InlineMarkdown({
  source
}: {
  source: string
}): JSX.Element {
  return (
    <ReactMarkdown
      source={source}
      disallowedTypes={['paragraph']}
      unwrapDisallowed
    />
  )
}
