import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  block,
  editing,
  editingButton,
  editors,
  renderScore,
} from 'corpus/ui/edit-lite/ScoreLines.testSupport'
import { retryHint } from 'corpus/ui/edit-lite/StaticScoreLine'
import { lineNotReturnedMessage } from 'corpus/ui/edit-lite/useEditLite'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

test('selecting a line that failed to load loads all failed lines again', async () => {
  const source = createFakeChapterEditSource()
  source.loadLines.mockRejectedValueOnce(new Error('Network down'))
  renderScore({ source })

  expect(
    await within(block('1')).findByText(`Network down ${retryHint}`),
  ).toBeVisible()
  expect(block('1')).toHaveTextContent('%n enūma | eliš')
  expect(block('3')).toHaveTextContent(`Network down ${retryHint}`)

  await userEvent.click(block('2'))

  expect(editors()).toHaveLength(0)
  expect(
    await within(block('1')).findByText('o 1. e-nu-ma e-liš'),
  ).toBeVisible()
  expect(block('2')).toHaveTextContent('NinNA1a o 2. šap-liš am-ma-tu')
  expect(block('3')).toHaveTextContent('BabaNBSch1 8. ap-su-um-ma')
  expect(screen.queryByText(/Network down/)).not.toBeInTheDocument()
  expect(source.loadLines.mock.calls).toEqual([
    [0, 3],
    [0, 3],
  ])
})

test('failed lines can be loaded again with the keyboard', async () => {
  const source = createFakeChapterEditSource()
  source.loadLines
    .mockRejectedValueOnce(new Error('Network down'))
    .mockRejectedValueOnce(new Error('Still down'))
  renderScore({ source })
  await within(block('3')).findByText(`Network down ${retryHint}`)
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(
    await within(block('1')).findByText(`Still down ${retryHint}`),
  ).toBeVisible()
  expect(block('1')).toHaveFocus()

  await userEvent.keyboard(' ')

  expect(
    await within(block('1')).findByText('o 1. e-nu-ma e-liš'),
  ).toBeVisible()
  expect(editors()).toHaveLength(0)
  expect(source.loadLines).toHaveBeenCalledTimes(3)
})

test('a failed save is reported on the static line and is not retried', async () => {
  const lines = buildEditLiteLines()
  const source = createFakeChapterEditSource({ lines })
  source.loadLines.mockResolvedValueOnce(lines.slice(0, 2))
  source.saveLine.mockRejectedValueOnce(new Error('The line has changed.'))
  renderScore({ source })
  await within(block('3')).findByText(`${lineNotReturnedMessage} ${retryHint}`)
  await userEvent.click(block('1'))
  await userEvent.type(within(editing('1')).getByLabelText('Number'), 'a')
  await userEvent.click(editingButton('1a', 'Save line'))
  await within(editing('1a')).findByText('The line has changed.')
  await userEvent.click(editingButton('1a', 'Done'))

  expect(block('1a')).toHaveTextContent('The line has changed.')
  expect(block('1a')).toHaveTextContent('edited')
  expect(block('1a')).not.toHaveTextContent(retryHint)

  await userEvent.click(block('3'))

  expect(await within(block('3')).findByText('8. ap-su-um-ma')).toBeVisible()
  expect(block('1a')).toHaveTextContent('The line has changed.')
  expect(source.loadLines.mock.calls).toEqual([
    [0, 3],
    [2, 1],
  ])

  await userEvent.click(block('1a'))

  expect(within(editing('1a')).getByLabelText('Number')).toHaveValue('1a')
  expect(source.loadLines).toHaveBeenCalledTimes(2)
})
