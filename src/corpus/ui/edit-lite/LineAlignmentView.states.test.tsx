import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import { staleAnnotationNote } from 'corpus/ui/edit-lite/AnnotationFrame'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  setLineTranslation,
  setLineVariant,
  setManuscriptId,
  setVariantManuscriptLine,
} from 'corpus/ui/edit-lite/lineDraft'
import {
  renderContainer,
  renderLoadedContainer,
} from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import {
  button,
  listDisabledViews,
  manuscriptRow,
  omitWord,
  openLineView,
  openLoadedView,
  reconstructionRow,
  renderLoadedView,
  viewPanel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)

function alert(): HTMLElement {
  return screen.getByRole('alert')
}

test('a failed load shows the reason and is repeated on request', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.loadAnnotatedLine.mockRejectedValueOnce(
    new Error(chapterChangedMessage),
  )
  await renderLoadedContainer({ source, lines })
  await openLineView('Alignment')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    chapterChangedMessage,
  )
  expect(
    within(viewPanel('Alignment')).queryByRole('group'),
  ).not.toBeInTheDocument()

  await userEvent.click(within(alert()).getByRole('button', { name: 'Retry' }))
  await openLoadedView('Alignment')

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(source.loadAnnotatedLine.mock.calls).toEqual([[0], [0]])
  expect(manuscriptRow(1)).toHaveTextContent(/^NinNA1a/)
})

test('a refused save keeps the changes and shows the reason of the server', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.saveAlignment.mockRejectedValueOnce(new Error('Invalid alignment'))
  const { getState } = await renderLoadedView('Alignment', { source, lines })
  await omitWord(manuscriptRow(1), 'eliš')
  await userEvent.click(button('Save alignment'))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid alignment',
  )
  expect(getState().lines[0].status).toBe('failed')
  expect(
    within(manuscriptRow(1)).getByText('eliš', { selector: 'div' }),
  ).toBeVisible()
  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])
  expect(button('Save alignment')).toBeEnabled()

  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(button('Reset')).toBeDisabled())

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(source.saveAlignment).toHaveBeenCalledTimes(2)
  expect(listDisabledViews()).toEqual([])
})

test('a refused save is dismissed with its changes by a reset', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.saveAlignment.mockRejectedValueOnce(new Error('Invalid alignment'))
  await renderLoadedView('Alignment', { source, lines })
  await omitWord(manuscriptRow(1), 'eliš')
  await userEvent.click(button('Save alignment'))
  await screen.findByRole('alert')
  await userEvent.click(button('Reset'))

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(button('Reset')).toBeDisabled()
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test('without permission to write the alignment is shown read-only', async () => {
  const { source } = await renderLoadedView('Alignment', {
    lines,
    canWrite: false,
  })
  const panel = within(viewPanel('Alignment'))

  expect(panel.queryByRole('button')).not.toBeInTheDocument()
  expect(panel.getAllByLabelText('Omitted words')).toHaveLength(2)
  panel
    .getAllByLabelText('Omitted words')
    .forEach((select) => expect(select).toBeDisabled())
  expect(manuscriptRow(1)).toHaveTextContent(
    /^NinNA1ao 1e-nu-maenūma e-lišeliš/,
  )
  expect(panel.getByText('e-nu-ma')).toHaveClass('Word--suggestion')
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test('changes made on a line that changed on the server can only be reset', async () => {
  const source = createFakeChapterEditSource({ lines })
  const view = await renderLoadedView('Alignment', { source, lines })
  const changedLines = [
    setLineTranslation(lines[0], 'changed'),
    ...lines.slice(1),
  ]
  await omitWord(manuscriptRow(1), 'eliš')
  source.importLines.mockResolvedValueOnce(
    buildEditLiteOutline(changedLines, 'revision-2'),
  )
  await act(async () => {
    await view.getContext().actions.importLines('')
  })

  expect(screen.getByRole('status')).toHaveTextContent(staleAnnotationNote)
  expect(button('Save alignment')).toBeDisabled()
  expect(
    within(manuscriptRow(1)).getByLabelText('Omitted words'),
  ).toBeDisabled()
  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])

  await userEvent.click(button('Reset'))
  await openLoadedView('Alignment')

  expect(source.loadLines).toHaveBeenCalledTimes(2)
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(source.saveAlignment).not.toHaveBeenCalled()
})

test('every variant is listed with its own manuscript lines', async () => {
  renderContainer({ lines }, 1)
  await screen.findByLabelText('Number')
  await openLineView('Alignment')
  const first = within(await screen.findByRole('group', { name: 'Variant 1' }))
  const second = within(screen.getByRole('group', { name: 'Variant 2' }))

  expect(screen.getByText('Variant 1')).toBeVisible()
  expect(
    first.getByRole('group', { name: 'Reconstruction' }),
  ).toHaveTextContent('%n šapliš | ammatu')
  expect(
    first.getByRole('group', { name: 'Manuscript line 1' }),
  ).toHaveTextContent(/^NinNA1ao 2šap-liššapliš am-ma-tuammatu/)
  expect(
    second.getByRole('group', { name: 'Reconstruction' }),
  ).toHaveTextContent('%n šapliš | erṣetu')
  expect(
    second.queryByRole('group', { name: /^Manuscript line/ }),
  ).not.toBeInTheDocument()
  expect(reconstructionRow).toThrow()
})

test('a manuscript line without a known manuscript and without labels is still listed', async () => {
  const [variant] = lines[2].variants
  const line: Line = setLineVariant(
    lines[2],
    0,
    setVariantManuscriptLine(
      variant,
      0,
      setManuscriptId(variant.manuscripts[0], 9),
    ),
  )
  await renderLoadedView('Alignment', { lines: [line] })

  expect(manuscriptRow(1)).toHaveTextContent(/^<unknown>8ap-su-um-maapsûm-ma/)
})
