import React from 'react'
import { render, screen } from '@testing-library/react'
import { text } from 'test-support/test-corpus-text'
import CorpusTextCrumb from './CorpusTextCrumb'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'

describe('ofText', () => {
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
})

describe('ofChapterDisplay', () => {
  const chapterDisplay = chapterDisplayFactory.build()
  const crumb = CorpusTextCrumb.ofChapterDisplay(chapterDisplay)

  test('text', () => {
    render(<>{crumb.text}</>)
    expect(screen.getByText(chapterDisplay.textName)).toBeVisible()
  })

  test('link', () => {
    expect(crumb.link).toEqual(
      `/corpus/${chapterDisplay.id.textId.genre}/${chapterDisplay.id.textId.category}/${chapterDisplay.id.textId.index}`
    )
  })
})
