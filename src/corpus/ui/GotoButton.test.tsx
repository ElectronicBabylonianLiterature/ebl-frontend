import React from 'react'
import { render, screen } from '@testing-library/react'
import GotoButton from './GotoButton'
import { text } from 'test-support/test-corpus-text'
import userEvent from '@testing-library/user-event'

const title = 'goto'

test('Go to dropdown', () => {
  render(<GotoButton title={title} text={text} />)
  userEvent.click(screen.getByRole('button', { name: title }))
  expect(
    screen.getByRole('link', { name: text.chapters[0].name })
  ).toHaveAttribute('href', '/corpus/L/1/1/Old Babylonian/The Only Chapter')
  expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
    'href',
    '/corpus/L/1/1'
  )
})
