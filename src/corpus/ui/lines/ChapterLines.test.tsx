import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { produce, castDraft } from 'immer'
import { chapter } from 'test-support/test-corpus-text'
import { createLine, EditStatus } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import ChapterLines from 'corpus/ui/lines/ChapterLines'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lastLine = chapter.lines[0]
const deletedLine = createLine({ number: '5', status: EditStatus.DELETED })
const chapterWithDeletedLine = produce(chapter, (draft) => {
  draft.lines = castDraft([lastLine, deletedLine])
})

test('Add line continues from the last line that is not deleted', async () => {
  const onChange = jest.fn<void, [Chapter]>()
  render(
    <ChapterLines
      chapter={chapterWithDeletedLine}
      onChange={onChange}
      onSave={jest.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Add line' }))

  expect(onChange).toHaveBeenCalledWith(
    produce(chapterWithDeletedLine, (draft) => {
      draft.lines.push(castDraft(createDefaultLineFactory(lastLine)()))
    }),
  )
})
