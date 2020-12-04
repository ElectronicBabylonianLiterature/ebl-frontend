import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { whenClicked, clickNth } from 'test-support/utils'
import { Chapter } from 'corpus/domain/text'
import { ChapterAlignment } from 'corpus/domain/alignment'
import ChapterAligner from './ChapterAligner'
import { text } from 'test-support/test-corpus-text'

let element: RenderResult
let onSave: jest.Mock<void, [ChapterAlignment]>
let chapter: Chapter

beforeEach(async () => {
  onSave = jest.fn()
  chapter = text.chapters[0]
  element = render(
    <ChapterAligner chapter={chapter} onSave={onSave} disabled={false} />
  )
  await element.findByText(chapter.getSiglum(chapter.lines[0].manuscripts[0]))
})

test('Align word', async () => {
  const expected: ChapterAlignment = [
    [
      [
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
    ],
  ]

  await element.findByText('kur')
  clickNth(element, 'kur', 0)
  userEvent.selectOptions(element.getByLabelText('Ideal word'), ['1'])
  userEvent.type(element.getByLabelText('Variant'), 'variant')
  userEvent.click(element.getByRole('button', { name: 'Set alignment' }))
  await whenClicked(element, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})
