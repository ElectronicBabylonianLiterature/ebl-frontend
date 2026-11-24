import { waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  listAlignments,
  manuscriptRow,
  queryActivePopover,
  renderLoadedView,
  viewPanel,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)

test('on the last word Enter and Tab save what was accepted and leave no word active', async () => {
  const { source } = await renderLoadedView('Alignment', { lines })
  await userEvent.keyboard('{Tab}{Tab}{Tab}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(source.saveAlignment).not.toHaveBeenCalled()

  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(source.saveAlignment).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(button('Preview request')).toBeEnabled())

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(listAlignments(await source.loadAnnotatedLine(0))).toEqual([
    [null, null],
    [3],
  ])
  expect(wordLabel(manuscriptRow(2), 'e-li-iš')).not.toHaveClass(
    'Word--suggestion',
  )
})

test('a source that cannot save keeps the accepted values on the line', async () => {
  const source = createFakeChapterEditSource({ lines, canSave: false })
  const { getState } = await renderLoadedView('Alignment', { source, lines })
  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))
  await userEvent.keyboard('{Enter}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(source.saveAlignment).not.toHaveBeenCalled()
  expect(getState().lines[0].annotation?.draft).not.toBeNull()
})

test('a line without alignable words has no active word', async () => {
  const line: Line = createLine({
    number: '1',
    variants: [
      createVariant({
        reconstruction: '%n kur',
        manuscripts: [
          createManuscriptLine({ manuscriptId: 1, number: '1', atf: '[x x]' }),
        ],
      }),
    ],
  })
  await renderLoadedView('Alignment', { lines: [line] })
  await userEvent.keyboard('{Enter}{Tab}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(
    within(viewPanel('Alignment')).queryByRole('button', { name: /x/ }),
  ).not.toBeInTheDocument()
})
