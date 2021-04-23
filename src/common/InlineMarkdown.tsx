import React from 'react'
import ReactMarkdown from 'react-markdown'
import * as remarkSubSuper from 'remark-sub-super'

export default function InlineMarkdown({
  source,
}: {
  source: string
}): JSX.Element {
  return (
    <ReactMarkdown
      source={source}
      plugins={[remarkSubSuper]}
      disallowedTypes={['paragraph']}
      unwrapDisallowed
      renderers={{
        sub: 'sub',
        sup: 'sup',
      }}
    />
  )
}
