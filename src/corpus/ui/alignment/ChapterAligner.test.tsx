import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import { whenClicked, clickNth } from 'test-support/utils'
import { ChapterAlignment } from 'corpus/domain/alignment'
import ChapterAligner from './ChapterAligner'
import { chapter } from 'test-support/test-corpus-text'
import { produce, Draft } from 'immer'

let onSave: jest.Mock<void, [ChapterAlignment]>

const setup = async () => {
  onSave = jest.fn()
  render(<ChapterAligner chapter={chapter} onSave={onSave} disabled={false} />)
  await screen.findByText(
    chapter.getSiglum(chapter.lines[0].variants[0].manuscripts[0]),
  )
}

test('Align word', async () => {
  await setup()
  const expected: ChapterAlignment = new ChapterAlignment([
    [
      [
        {
          alignment: [
            {
              value: 'kur',
              alignment: 1,
              variant: {
                value: 'variant',
                type: 'AkkadianWord',
                language: 'AKKADIAN',
              },
              isAlignable: true,
              suggested: false,
            },
            {
              value: 'ra',
              alignment: 1,
              variant: {
                value: 'ra',
                type: 'Word',
                language: 'AKKADIAN',
              },
              isAlignable: true,
              suggested: false,
            },
            {
              value: '...',
              alignment: null,
              variant: null,
              isAlignable: false,
              suggested: false,
            },
          ],
          omittedWords: [],
        },
      ],
    ],
  ])

  await screen.findByText('kur')
  clickNth(screen, 'kur', 0)
  await userEvent.selectOptions(screen.getByLabelText('Ideal word'), ['1'])
  await userEvent.type(screen.getByLabelText('Variant'), 'variant')
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))
  await whenClicked(screen, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})

test('Omit word', async () => {
  await setup()
  const expected: ChapterAlignment = produce(
    chapter.alignment,
    (draft: Draft<ChapterAlignment>) => {
      draft.lines[0][0][0].omittedWords = [1]
    },
  )

  await selectEvent.select(
    await screen.findByLabelText('Omitted words'),
    'kur-kur',
  )
  await whenClicked(screen, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})
