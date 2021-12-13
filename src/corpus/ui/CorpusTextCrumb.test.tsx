import React from 'react'
import { render, screen } from '@testing-library/react'
import { chapterDto, text, textDto } from 'test-support/test-corpus-text'
import CorpusTextCrumb from './CorpusTextCrumb'
import { ChapterDisplay } from 'corpus/domain/chapter'

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
  const chapterDisplay: ChapterDisplay = {
    id: {
      textId: {
        genre: textDto.genre,
        category: textDto.category,
        index: textDto.index,
      },
      stage: chapterDto.stage,
      name: chapterDto.name,
    },
    textName: textDto.name,
    lines: [
      {
        number: {
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
          type: 'LineNumber',
        },
        reconstruction: chapterDto.lines[0].variants[0].reconstructionTokens,
        translation: [],
      },
    ],
  }
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
