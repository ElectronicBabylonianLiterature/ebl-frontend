import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as editLiteReducer from 'corpus/ui/edit-lite/editLiteReducer'
import {
  block,
  editing,
  editingButton,
  editors,
  renderLoadedScore,
  renderScore,
} from 'corpus/ui/edit-lite/ScoreLines.testSupport'
import { pendingText } from 'corpus/ui/edit-lite/StaticScoreContent'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

function done(lineNumber: string): HTMLElement {
  return editingButton(lineNumber, 'Done')
}

afterEach(() => {
  jest.restoreAllMocks()
})

test('shows the outline of every line at once', async () => {
  renderScore()

  expect(block('1')).toHaveTextContent('When on high')
  expect(block('1')).toHaveTextContent('%n enūma | eliš')
  expect(block('1')).toHaveTextContent(`NinNA1a ${pendingText}`)
  expect(block('2')).toHaveTextContent('%n šapliš | erṣetu')
  expect(block('3')).toHaveTextContent(`BabaNBSch1 ${pendingText}`)
  expect(editors()).toHaveLength(0)

  await within(block('3')).findByText('8. ap-su-um-ma')
})

test('lists the manuscript lines once they are loaded', async () => {
  const { source } = await renderLoadedScore()

  expect(block('1')).toHaveTextContent('NinNA1a o 1. e-nu-ma e-liš')
  expect(block('1')).toHaveTextContent("BabaNBSch1 o i 6'. [x x x] e-li-iš")
  expect(block('2')).toHaveTextContent('NinNA1a o 2. šap-liš am-ma-tu')
  expect(block('3')).toHaveTextContent('BabaNBSch1 8. ap-su-um-ma')
  expect(screen.queryByText(pendingText)).not.toBeInTheDocument()
  expect(editors()).toHaveLength(0)
  expect(source.loadLines.mock.calls).toEqual([[0, 3]])
})

test('clicking a line swaps it to its editor and Done swaps it back', async () => {
  const { getState } = await renderLoadedScore()
  await userEvent.click(block('2'))

  expect(done('2')).toHaveFocus()
  expect(within(editing('2')).getByLabelText('Number')).toHaveValue('2')
  expect(editors()).toHaveLength(1)
  expect(block('1')).toBeVisible()
  expect(block('3')).toBeVisible()
  expect(within(editing('2')).queryByText('edited')).not.toBeInTheDocument()

  await userEvent.type(within(editing('2')).getByLabelText('Number'), 'b')

  expect(within(editing('2b')).getByText('edited')).toBeVisible()
  expect(within(editing('2b')).getByText('Line 2b')).toBeVisible()

  await userEvent.click(done('2b'))

  expect(editors()).toHaveLength(0)
  expect(block('2b')).toHaveFocus()
  expect(block('2b')).toHaveTextContent('edited')
  expect(block('2b')).toHaveTextContent('NinNA1a o 2. šap-liš am-ma-tu')
  expect(block('1')).not.toHaveTextContent('edited')
  expect(getState().lines[1].draft?.number).toBe('2b')

  await userEvent.click(block('2b'))

  expect(within(editing('2b')).getByLabelText('Number')).toHaveValue('2b')
})

test('Enter and Space open a line like a button', async () => {
  await renderLoadedScore()
  await userEvent.tab()

  expect(block('1')).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(done('1')).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(block('1')).toHaveFocus()
  expect(editors()).toHaveLength(0)

  await userEvent.keyboard(' ')

  expect(done('1')).toHaveFocus()

  await userEvent.keyboard(' ')

  expect(block('1')).toHaveFocus()
  expect(editors()).toHaveLength(0)
})

test('other keys are left alone and Space does not scroll the page', async () => {
  await renderLoadedScore()

  expect(fireEvent.keyDown(block('1'), { key: 'a' })).toBe(true)
  expect(fireEvent.keyUp(block('1'), { key: 'a' })).toBe(true)
  expect(fireEvent.keyDown(block('1'), { key: ' ' })).toBe(false)
  expect(editors()).toHaveLength(0)
  expect(fireEvent.keyDown(block('1'), { key: 'Enter' })).toBe(false)
  expect(editors()).toHaveLength(1)
})

test('typing renders the edited line only', async () => {
  const isLineDirty = jest.spyOn(editLiteReducer, 'isLineDirty')
  await renderLoadedScore()
  await userEvent.click(block('2'))
  isLineDirty.mockClear()
  await userEvent.type(within(editing('2')).getByLabelText('Number'), 'b')

  expect(
    new Set(
      isLineDirty.mock.calls.map(([lineState]) => lineState?.original?.number),
    ),
  ).toEqual(new Set(['2']))
})

test('several lines can be edited at the same time', async () => {
  await renderLoadedScore()
  await userEvent.click(block('1'))
  await userEvent.click(block('3'))

  expect(editors()).toHaveLength(2)
  expect(block('2')).toBeVisible()

  await userEvent.click(done('1'))

  expect(editors()).toHaveLength(1)
  expect(within(editing('3')).getByLabelText('Number')).toHaveValue('3')
  expect(block('1')).toHaveFocus()
})

test('selecting text does not open the editor', async () => {
  await renderLoadedScore()
  window.getSelection()?.selectAllChildren(block('1'))
  fireEvent.click(block('1'))

  expect(editors()).toHaveLength(0)

  window.getSelection()?.removeAllRanges()
  fireEvent.click(block('1'))

  expect(editors()).toHaveLength(1)
})

test('a saved line is shown without the edited marker', async () => {
  const { source } = await renderLoadedScore()
  await userEvent.click(block('1'))
  await userEvent.type(within(editing('1')).getByLabelText('Number'), 'a')
  await userEvent.click(editingButton('1a', 'Save line'))
  await waitFor(() =>
    expect(within(editing('1a')).queryByText('edited')).not.toBeInTheDocument(),
  )
  await userEvent.click(done('1a'))

  expect(block('1a')).not.toHaveTextContent('edited')
  expect(block('1a')).toHaveTextContent('NinNA1a o 1. e-nu-ma e-liš')
  expect(source.saveLine).toHaveBeenCalledTimes(1)
})

test('says so when the chapter has no lines', () => {
  const { source } = renderScore({ lines: [] })

  expect(screen.getByText('This chapter has no lines.')).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(source.loadLines).not.toHaveBeenCalled()
})
