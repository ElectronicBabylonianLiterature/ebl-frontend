import React from 'react'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditStatus, Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import { button } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import { findLineActivity, findLineState } from 'corpus/ui/edit-lite/lineStates'
import {
  missingSiglumMessage,
  missingVariantMessage,
} from 'corpus/ui/edit-lite/lineValidation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines()

function renderLine(
  index: number,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => (
      <LineEditContainer
        index={index}
        lineState={findLineState(state, index)}
        isNew={state.newLine !== null && index === state.outline.lines.length}
        activity={findLineActivity(state)}
      />
    ),
    { lines, ...options },
  )
}

async function renderNewLine(
  options: EditLiteRenderOptions = {},
): Promise<EditLiteRenderResult> {
  const view = renderLine(3, options)
  act(() => view.getContext().actions.addLine())
  await screen.findByLabelText('Number')
  return view
}

function newLineOf(view: EditLiteRenderResult): Line {
  return view.getState().newLine?.draft as Line
}

test('shows a spinner while the new line is prepared', async () => {
  const view = renderLine(3)
  act(() => view.getContext().actions.addLine())

  expect(screen.getByText('Loading line...')).toBeVisible()
  expect(await screen.findByLabelText('Number')).toHaveValue('4')
  expect(view.source.loadLines.mock.calls).toEqual([[2, 1]])
})

test('a new line can be saved and discarded but not deleted', async () => {
  await renderNewLine()

  expect(button('Save line')).toBeEnabled()
  expect(button('Discard new line')).toBeEnabled()
  expect(
    screen.queryByRole('button', { name: 'Reset' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Delete line' }),
  ).not.toBeInTheDocument()
})

test('saving posts the new line and shows it as a normal line', async () => {
  const view = await renderNewLine()
  await userEvent.type(screen.getByLabelText('Number'), 'a')
  const draft = newLineOf(view)
  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('button', { name: 'Reset' })).toBeDisabled()
  expect(view.source.addLine.mock.calls).toEqual([[draft]])
  expect(draft).toMatchObject({ number: '4a', status: EditStatus.NEW })
  expect(view.getState().newLine).toBeNull()
  expect(view.getState().outline.lines[3].number).toBe('4a')
  expect(screen.getByLabelText('Number')).toHaveValue('4a')
  expect(button('Save line')).toBeDisabled()
  expect(button('Delete line')).toBeEnabled()
})

test('a failed save keeps the new line and shows the error', async () => {
  const view = await renderNewLine()
  view.source.addLine.mockRejectedValueOnce(new Error('Invalid line number'))
  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid line number',
  )
  expect(screen.getByLabelText('Number')).toHaveValue('4')
  expect(button('Save line')).toBeEnabled()
  expect(button('Discard new line')).toBeEnabled()
})

test('discarding removes the new line', async () => {
  const view = await renderNewLine()
  await userEvent.click(button('Discard new line'))

  expect(view.getState().newLine).toBeNull()
  expect(view.source.addLine).not.toHaveBeenCalled()
  expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()
})

test('a manuscript line without a siglum blocks saving with a message', async () => {
  const view = await renderNewLine()
  await userEvent.click(
    screen.getByRole('button', { name: 'Add manuscript line' }),
  )

  expect(screen.getByRole('status')).toHaveTextContent(missingSiglumMessage)
  expect(button('Save line')).toBeDisabled()

  await userEvent.click(button('Save line'))

  expect(view.source.addLine).not.toHaveBeenCalled()

  await userEvent.click(
    screen.getByRole('button', { name: 'Siglum <unknown>' }),
  )
  await userEvent.selectOptions(screen.getByRole('combobox'), 'NinNA1a')

  expect(screen.queryByText(missingSiglumMessage)).not.toBeInTheDocument()
  expect(button('Save line')).toBeEnabled()
})

test('an edited line without a siglum is blocked the same way', async () => {
  const view = renderLine(0)
  await screen.findByLabelText('Number')

  expect(screen.queryByRole('status')).not.toBeInTheDocument()

  await userEvent.click(
    screen.getByRole('button', { name: 'Add manuscript line' }),
  )

  expect(screen.getByRole('status')).toHaveTextContent(missingSiglumMessage)
  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeEnabled()

  await userEvent.click(button('Delete manuscript line 3'))
  await userEvent.type(screen.getByLabelText('Number'), 'a')

  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(button('Save line')).toBeEnabled()
  expect(view.source.saveLine).not.toHaveBeenCalled()
})

test('a line without variants says what is missing', async () => {
  renderLine(0, { lines: [{ ...lines[0], variants: [] }, ...lines.slice(1)] })
  await screen.findByLabelText('Number')

  expect(screen.getByRole('status')).toHaveTextContent(missingVariantMessage)

  await userEvent.click(screen.getByRole('button', { name: 'Add variant' }))

  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(button('Save line')).toBeEnabled()
})
