import React from 'react'
import { render, screen } from '@testing-library/react'
import { Anchor, LineNumber } from './line-number'
import textLine from 'test-support/lines/text-line'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

test('LineNumber', () => {
  render(<LineNumber line={textLine} />)
  expect(
    screen.getByText(`(${lineNumberToString(textLine.lineNumber)})`),
  ).toBeVisible()
})

test('Anchor', () => {
  const children = '1-2'
  const id = 'my id'
  const className = 'block__element'

  render(
    <Anchor id={id} className={className}>
      {children}
    </Anchor>,
  )

  expect(screen.getByRole('link', { name: children })).toHaveAttribute('id', id)
  expect(screen.getByRole('link', { name: children })).toHaveAttribute(
    'href',
    `#${encodeURIComponent(id)}`,
  )
  expect(screen.getByRole('link', { name: children })).toHaveAttribute(
    'class',
    className,
  )
})
