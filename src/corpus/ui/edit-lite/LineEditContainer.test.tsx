import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import {
  button,
  renderContainer,
  renderEditedContainer,
  renderLoadedContainer,
} from 'corpus/ui/edit-lite/LineEditContainer.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines = buildEditLiteLines()

test('requests its line and shows a spinner until it is loaded', async () => {
  const { source } = renderContainer({}, 1)

  expect(screen.getByText('Loading line...')).toBeVisible()
  expect(
    screen.getByRole('group', { name: 'Editor for the line at position 2' }),
  ).toBeVisible()

  expect(await screen.findByLabelText('Number')).toHaveValue('2')
  expect(screen.queryByText('Loading line...')).not.toBeInTheDocument()
  expect(source.loadLines.mock.calls).toEqual([[1, 1]])
})

test('does not request a line that is already known', async () => {
  const { source } = renderWithEditLite((state: EditLiteState) => (
    <>
      <LineEditContainer index={0} lineState={state.lines[0]} />
      {state.lines[0]?.status === 'ready' && (
        <LineEditContainer index={0} lineState={state.lines[0]} />
      )}
    </>
  ))

  await waitFor(() =>
    expect(screen.getAllByLabelText('Number')).toHaveLength(2),
  )
  expect(source.loadLines).toHaveBeenCalledTimes(1)
})

test('shows a load failure and retries on request', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  renderContainer({ source })

  expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()

  await userEvent.click(button('Retry'))

  expect(await screen.findByLabelText('Number')).toHaveValue('1')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(source.loadLines).toHaveBeenCalledTimes(2)
})

test('a loaded line cannot be saved or reset until it is edited', async () => {
  await renderLoadedContainer()

  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()
  expect(button('Preview request')).toBeEnabled()
  expect(screen.queryByText(/dry run/)).not.toBeInTheDocument()
})

test('editing updates the draft and enables saving', async () => {
  const { getState } = await renderEditedContainer({ lines })

  expect(screen.getByLabelText('Number')).toHaveValue('1a')
  expect(getState().lines[0].draft?.number).toBe('1a')
  expect(getState().lines[0].original).toBe(lines[0])
  expect(button('Save line')).toBeEnabled()
  expect(button('Reset')).toBeEnabled()
})

test('reset restores the loaded line', async () => {
  const { getState } = await renderEditedContainer({ lines })
  await userEvent.click(button('Reset'))

  expect(screen.getByLabelText('Number')).toHaveValue('1')
  expect(getState().lines[0].draft).toBe(lines[0])
  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()
})

test('typing the original content again makes the line clean', async () => {
  await renderEditedContainer()
  await userEvent.type(screen.getByLabelText('Number'), '{Backspace}')

  expect(screen.getByLabelText('Number')).toHaveValue('1')
  expect(button('Save line')).toBeDisabled()
})
