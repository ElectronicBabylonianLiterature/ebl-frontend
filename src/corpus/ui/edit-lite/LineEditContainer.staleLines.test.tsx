import React from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  EditLiteRenderResult,
  FakeChapterEditSource,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

type Queries = ReturnType<typeof within>

const lines: readonly Line[] = buildEditLiteLines()
const serverLines: readonly Line[] = [setLineNumber(lines[0], '1a'), lines[2]]

function editor(position: number): Queries {
  return within(
    screen.getByRole('group', {
      name: `Editor for the line at position ${position}`,
    }),
  )
}

function createSourceLosingTheSecondLine(): FakeChapterEditSource {
  const source = createFakeChapterEditSource({ lines })
  source.saveLine.mockImplementation(() => {
    source.loadLines.mockImplementation((offset: number, limit: number) =>
      Promise.resolve(serverLines.slice(offset, offset + limit)),
    )
    return Promise.resolve(buildEditLiteOutline(serverLines))
  })
  return source
}

async function renderTwoLoadedLines(): Promise<EditLiteRenderResult> {
  const view = renderWithEditLite(
    (state: EditLiteState) => (
      <>
        <LineEditContainer index={0} lineState={state.lines[0]} />
        <LineEditContainer index={1} lineState={state.lines[1]} />
      </>
    ),
    { source: createSourceLosingTheSecondLine(), lines },
  )
  await editor(1).findByLabelText('Number')
  await editor(2).findByLabelText('Number')
  return view
}

async function saveTheFirstLine(): Promise<void> {
  await userEvent.type(editor(1).getByLabelText('Number'), 'a')
  await userEvent.click(editor(1).getByRole('button', { name: 'Save line' }))
}

test('a line is loaded again when a save shows that it moved', async () => {
  const { source } = await renderTwoLoadedLines()

  expect(editor(2).getByLabelText('Number')).toHaveValue('2')

  await saveTheFirstLine()

  expect(await editor(2).findByDisplayValue('3')).toBeEnabled()
  expect(editor(2).queryByRole('alert')).not.toBeInTheDocument()
  expect(source.loadLines).toHaveBeenLastCalledWith(1, 1)
})

test('a draft is kept and flagged when a save shows that its line moved', async () => {
  await renderTwoLoadedLines()
  await userEvent.type(editor(2).getByLabelText('Number'), 'b')
  await saveTheFirstLine()

  expect(await editor(2).findByRole('alert')).toHaveTextContent(
    lineChangedOnServerMessage,
  )
  expect(editor(2).getByLabelText('Number')).toHaveValue('2b')
  expect(editor(2).getByRole('button', { name: 'Save line' })).toBeEnabled()
})
