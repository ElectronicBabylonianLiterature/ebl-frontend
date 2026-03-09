import React from 'react'
import { render, screen } from '@testing-library/react'
import { text } from 'test-support/test-corpus-text'
import CorpusTextCrumb from './CorpusTextCrumb'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { textIdToString } from 'transliteration/domain/text-id'

describe('ofText', () => {
  const crumb = CorpusTextCrumb.ofText(text)
  const title = `${textIdToString(text.id)} ${text.name}`

  test('text', () => {
    render(<>{crumb.text}</>)
    expect(
      screen.getAllByText((_, element) => element?.textContent === title)[0],
    ).toBeVisible()
  })

  test('link', () => {
    expect(crumb.link).toEqual(
      `/corpus/${text.genre}/${text.category}/${text.index}`,
    )
  })
})

describe('ofChapterDisplay', () => {
  const chapterDisplay = chapterDisplayFactory.build()
  const crumb = CorpusTextCrumb.ofChapterDisplay(chapterDisplay)
  const title = `${textIdToString(chapterDisplay.id.textId)} ${
    chapterDisplay.textName
  }`

  test('text', () => {
    render(<>{crumb.text}</>)
    expect(
      screen.getAllByText((_, element) => element?.textContent === title)[0],
    ).toBeVisible()
  })

  test('link', () => {
    expect(crumb.link).toEqual(
      `/corpus/${chapterDisplay.id.textId.genre}/${chapterDisplay.id.textId.category}/${chapterDisplay.id.textId.index}`,
    )
  })
})
