import React from 'react'
import { render, screen } from '@testing-library/react'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'

test('renders a single paragraph inline with sub, sup and italics', async () => {
  render(
    <MarkdownAndHtmlToHtml
      markdownAndHtml="*word* x^2^ y~3~"
      container="span"
      className="converted"
    />,
  )
  const italic = await screen.findByText('word')
  expect(italic.tagName).toEqual('EM')
  expect(screen.getByText('2').tagName).toEqual('SUP')
  expect(screen.getByText('3').tagName).toEqual('SUB')
  expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
})

test('keeps block markup that is not a paragraph', async () => {
  render(<MarkdownAndHtmlToHtml markdownAndHtml="# Title" />)
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Title' }),
  ).toBeInTheDocument()
})
