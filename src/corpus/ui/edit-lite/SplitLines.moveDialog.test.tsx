import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildMoveUrl,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { moveDryRunNotice } from 'corpus/ui/edit-lite/LineMoveControls'
import { numberingNote } from 'corpus/ui/edit-lite/LineMoveDialog'
import {
  button,
  loadedEditor,
  optionNumbers,
  options,
  renderSplit,
  selectedOptions,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)
const initialOrder: readonly string[] = ['1', '2', '3', '4', '5']
const moveUrl = buildMoveUrl('revision-1')

function dialog(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Move line' })
}

async function openDialog(lineNumber: string): Promise<HTMLElement> {
  await loadedEditor(lineNumber)
  await userEvent.click(button('Move to...'))
  return within(dialog()).getByRole('combobox', {
    name: `Move line ${lineNumber}`,
  })
}

async function confirmMove(): Promise<void> {
  await userEvent.click(
    within(dialog()).getByRole('button', { name: 'Move line' }),
  )
}

function expectPreview(body: { from: number; to: number }): void {
  const preview = within(
    screen.getByRole('dialog', { name: 'Request preview' }),
  )

  expect(preview.getByText(moveDryRunNotice)).toBeVisible()
  expect(preview.getByText(`POST ${moveUrl}`)).toBeVisible()
  expect(preview.getByLabelText('Request body')).toHaveTextContent(
    JSON.stringify(body, null, 2),
    { normalizeWhitespace: false },
  )
}

test('the places are listed only while the dialog is open', async () => {
  const { source } = renderSplit(2, { lines })
  await loadedEditor('3')

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.queryByText(/^After line/)).not.toBeInTheDocument()

  const select = await openDialog('3')

  expect(
    within(select)
      .getAllByRole('option')
      .map((option) => option.textContent),
  ).toEqual([
    'At the beginning',
    'After line 1',
    'After line 4',
    'After line 5',
  ])
  expect(select).toHaveValue('0')
  expect(screen.getAllByRole('combobox')).toEqual([select])
  expect(within(dialog()).getByText(numberingNote)).toBeVisible()
  expect(numberingNote).toContain('not renumbered')
  expect(
    within(dialog()).getByRole('button', { name: 'Move line' }),
  ).toHaveClass('btn-primary')
  expect(source.moveLine).not.toHaveBeenCalled()
})

test('the select names the number of a line that is no longer at its first place', async () => {
  renderSplit(1, { lines })
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '3', '2', '4', '5'])

  expect(await openDialog('2')).toBeVisible()
})

test.each<[string, number, string[]]>([
  ['At the beginning', 0, ['3', '1', '2', '4', '5']],
  ['After line 1', 1, ['1', '3', '2', '4', '5']],
  ['After line 4', 3, ['1', '2', '4', '3', '5']],
  ['After line 5', 4, ['1', '2', '4', '5', '3']],
])('choosing "%s" moves the line to position %i', async (place, to, order) => {
  const { source } = renderSplit(2, { lines })
  await userEvent.selectOptions(await openDialog('3'), place)
  await confirmMove()
  await waitForOrder(order)

  expect(source.moveLine.mock.calls).toEqual([[2, to]])
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(selectedOptions()).toEqual([options()[to]])
  expect(selectedOptions()[0]).toHaveTextContent(/^3/)
  expect(await loadedEditor('3')).toHaveTextContent(`${to + 1} of 5`)
  expect(button('Move to...')).toHaveFocus()
})

test.each<[string, number, string[], string]>([
  ['the first', 0, ['After line 2', 'After line 3'], '1'],
  ['the second', 1, ['At the beginning', 'After line 3'], '0'],
  ['the last', 2, ['At the beginning', 'After line 1'], '0'],
])(
  'the places of %s line leave out where it already is',
  async (_name, index, places, firstTarget) => {
    const { source } = renderSplit(index, { lines: lines.slice(0, 3) })
    const select = await openDialog(`${index + 1}`)

    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(places)
    expect(select).toHaveValue(firstTarget)

    await confirmMove()
    await loadedEditor(`${index + 1}`)

    expect(source.moveLine.mock.calls).toEqual([[index, Number(firstTarget)]])
  },
)

test.each<[string, () => Promise<void>]>([
  [
    'Cancel',
    (): Promise<void> =>
      userEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' })),
  ],
  [
    'Escape',
    async (): Promise<void> => {
      await userEvent.keyboard('{Escape}')
    },
  ],
])('%s closes the dialog without moving the line', async (_name, cancel) => {
  const { source } = renderSplit(2, { lines })
  await userEvent.selectOptions(await openDialog('3'), 'After line 5')
  await cancel()

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(source.moveLine).not.toHaveBeenCalled()
  expect(optionNumbers()).toEqual(initialOrder)
  expect(button('Move to...')).toHaveFocus()

  expect(await openDialog('3')).toHaveValue('0')
})

test.each<[string, number]>([
  ['Move up', 0],
  ['Move down', 2],
])(
  '%s on a read-only source shows the request instead of sending it',
  async (name, to) => {
    const { source } = renderSplit(1, { kind: 'legacy', lines })
    await loadedEditor('2')
    await userEvent.click(button(name))

    expectPreview({ from: 1, to })
    expect(source.describeChange).toHaveBeenCalledWith({
      type: 'moveLine',
      from: 1,
      to,
    })
    expect(source.moveLine).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('Close', { selector: '.btn' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(optionNumbers()).toEqual(initialOrder)
    expect(selectedOptions()).toEqual([options()[1]])
    expect(button(name)).toHaveFocus()
  },
)

test('a chosen place on a read-only source shows the request as well', async () => {
  const { source } = renderSplit(1, { kind: 'legacy', lines })
  await userEvent.selectOptions(await openDialog('2'), 'After line 5')
  await confirmMove()

  expectPreview({ from: 1, to: 4 })
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(moveDryRunNotice).toBe(
    'Dry run: nothing was sent to the server. This is the request that moving the line would send. The real request also carries the chapter revision, which the read-only snapshot does not have.',
  )
  expect(source.moveLine).not.toHaveBeenCalled()
  expect(optionNumbers()).toEqual(initialOrder)

  await userEvent.click(screen.getByText('Close', { selector: '.btn' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(button('Move to...')).toHaveFocus()
})
