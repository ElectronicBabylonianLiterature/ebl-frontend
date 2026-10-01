import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { castDraft, produce } from 'immer'
import ChapterLines from 'corpus/ui/lines/ChapterLines'
import { Chapter } from 'corpus/domain/chapter'
import { EditStatus, Line } from 'corpus/domain/line'
import { chapter } from 'test-support/test-corpus-text'

const onChange = jest.fn<void, [Chapter]>()

function renderLines(lines: readonly Line[]): void {
  render(
    <ChapterLines
      chapter={produce(chapter, (draft) => {
        draft.lines = castDraft(lines)
      })}
      onChange={onChange}
      onSave={jest.fn()}
    />,
  )
}

function changedLines(): readonly Line[] {
  return onChange.mock.calls[0][0].lines
}

beforeEach(() => {
  onChange.mockClear()
})

it('adds a line after the last line', async () => {
  renderLines(chapter.lines)

  await userEvent.click(screen.getByRole('button', { name: 'Add line' }))

  expect(changedLines()).toHaveLength(chapter.lines.length + 1)
  expect(changedLines()[chapter.lines.length].status).toEqual(EditStatus.NEW)
})

it.each([
  [EditStatus.CLEAN, EditStatus.EDITED],
  [EditStatus.NEW, EditStatus.NEW],
])(
  'adds a variant to a line with status %s and marks it %s',
  async (status, expectedStatus) => {
    const line = { ...chapter.lines[0], status }
    renderLines([line])

    await userEvent.click(screen.getByRole('button', { name: 'Add variant' }))

    expect(changedLines()[0].variants).toHaveLength(line.variants.length + 1)
    expect(changedLines()[0].status).toEqual(expectedStatus)
  },
)

it('adds a manuscript line to a variant', async () => {
  const line = chapter.lines[0]
  renderLines([line])

  await userEvent.click(
    screen.getAllByRole('button', { name: 'Add manuscript' })[0],
  )

  expect(changedLines()[0].variants[0].manuscripts).toHaveLength(
    line.variants[0].manuscripts.length + 1,
  )
})

it.each([
  [EditStatus.CLEAN, EditStatus.EDITED],
  [EditStatus.NEW, EditStatus.NEW],
])(
  'changes the number of a line with status %s and marks it %s',
  (status, expectedStatus) => {
    renderLines([{ ...chapter.lines[0], status }])

    fireEvent.change(screen.getByLabelText('Number'), {
      target: { value: '42' },
    })

    expect(changedLines()[0].number).toEqual('42')
    expect(changedLines()[0].status).toEqual(expectedStatus)
  },
)

it('keeps a new line new when a flag changes', async () => {
  renderLines([{ ...chapter.lines[0], status: EditStatus.NEW }])

  await userEvent.click(screen.getByLabelText('beginning of a section'))

  expect(changedLines()[0].status).toEqual(EditStatus.NEW)
  expect(changedLines()[0].isBeginningOfSection).toEqual(
    !chapter.lines[0].isBeginningOfSection,
  )
})
