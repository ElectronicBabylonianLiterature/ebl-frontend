import { render, RenderResult, screen } from '@testing-library/react'
import React from 'react'
import InlineMarkdown from 'common/InlineMarkdown'
import { Markdown } from 'dictionary/ui/display/WordDisplayParts'
import ReactMarkdown from 'react-markdown'
import * as remarkSubSuper from 'remark-sub-super'

it('Word parts are displayed correctly', async () => {
  renderInlineMarkdown()
  expect(screen.getByText('<sub>hey</sub>')).toBeVisible()
})
it('Render Markdown', async () => {
  renderMarkdown()
  expect(screen.getByText('<sub>hey</sub>')).toBeVisible()
})
it('Render ReactMarkdown', async () => {
  renderReactMarkdown()
  expect(screen.getByText('<sub>hey</sub>')).toBeVisible()
})
it('Render ReactMarkdown', async () => {
  renderReactMarkdown1()
  expect(screen.getByText('<sub>hey</sub>')).toBeVisible()
})

it('Render ReactMarkdown123', async () => {
  renderReactMarkdownTest()
  expect(screen.getByText('<sub>hey</sub>')).toBeVisible()
})

function renderInlineMarkdown(): RenderResult {
  return render(<InlineMarkdown source={'hey'} />)
}

function renderMarkdown(): RenderResult {
  return render(<Markdown text={'#Hey **asd**'} />)
}
function renderReactMarkdown1(): RenderResult {
  return render(<ReactMarkdown source={'#Hello, *world*!'} />)
}
function renderReactMarkdownTest(): RenderResult {
  return render(
    <InlineMarkdownTest>#Hello, *world!* ~sub~ ^super^</InlineMarkdownTest>
  )
}

function InlineMarkdownTest({ children }): JSX.Element {
  return (
    <ReactMarkdown
      plugins={[remarkSubSuper]}
      renderers={{
        paragraph: 'span',
        sub: 'sub',
        sup: 'sup',
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
