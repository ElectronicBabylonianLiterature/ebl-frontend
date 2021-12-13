import React from 'react'
import { render, screen } from '@testing-library/react'
import { text } from 'test-support/test-corpus-text'
import CorpusTextCrumb from './CorpusTextCrumb'

const crumb = CorpusTextCrumb.ofText(text)

test('text', () => {
  render(<>{crumb.text}</>)
  expect(screen.getByText(text.title)).toBeVisible()
})

test('link', () => {
  expect(crumb.link).toEqual(
    `/corpus/${text.genre}/${text.category}/${text.index}`
  )
})
