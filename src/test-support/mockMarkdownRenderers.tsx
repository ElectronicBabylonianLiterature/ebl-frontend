import React from 'react'

jest.mock('common/utils/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({ markdownAndHtml }: { markdownAndHtml: string }) => (
    <div>{markdownAndHtml}</div>
  ),
}))

jest.mock('common/ui/InlineMarkdown', () => ({
  __esModule: true,
  default: ({ source }: { source: string }) => <span>{source}</span>,
}))
