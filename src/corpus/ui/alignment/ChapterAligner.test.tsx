import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import { whenClicked, clickNth } from 'test-support/utils'
import { Chapter } from 'corpus/domain/text'
import { ChapterAlignment } from 'corpus/domain/alignment'
import ChapterAligner from './ChapterAligner'
import { text } from 'test-support/test-corpus-text'
import produce, { Draft } from 'immer'

let onSave: jest.Mock<void, [ChapterAlignment]>
let chapter: Chapter

beforeEach(async () => {
  onSave = jest.fn()
  chapter = text.chapters[0]
  render(<ChapterAligner chapter={chapter} onSave={onSave} disabled={false} />)
  await screen.findByText(chapter.getSiglum(chapter.lines[0].manuscripts[0]))
})

test('Align word', async () => {
  const expected: ChapterAlignment = new ChapterAlignment([
    [
      {
        alignment: [
          {
            value: 'kur',
            alignment: 1,
            variant: {
              value: 'variant',
              language: 'AKKADIAN',
              isNormalized: true,
            },
            isAlignable: true,
          },
          {
            value: 'ra',
            alignment: 1,
            variant: {
              value: 'ra',
              language: 'AKKADIAN',
              isNormalized: true,
            },
            isAlignable: true,
          },
          {
            value: '...',
            alignment: null,
            variant: null,
            isAlignable: false,
          },
        ],
        omittedWords: [],
      },
    ],
  ])

  await screen.findByText('kur')
  clickNth(screen, 'kur', 0)
  userEvent.selectOptions(screen.getByLabelText('Ideal word'), ['1'])
  userEvent.type(screen.getByLabelText('Variant'), 'variant')
  userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))
  await whenClicked(screen, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})

test('Omit word', async () => {
  const expected: ChapterAlignment = produce(
    chapter.alignment,
    (draft: Draft<ChapterAlignment>) => {
      draft.lines[0][0].omittedWords = [1]
    }
  )

  await selectEvent.select(
    await screen.findByLabelText('Omitted words'),
    'kur-kur'
  )
  await whenClicked(screen, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})
