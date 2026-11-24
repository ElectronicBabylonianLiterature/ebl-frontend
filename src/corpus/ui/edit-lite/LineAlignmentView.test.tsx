import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import {
  alignWord,
  button,
  listDisabledViews,
  manuscriptRow,
  omitWord,
  openLineView,
  openLoadedView,
  reconstructionRow,
  renderLoadedView,
  viewPanel,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)
const suggestedWord = {
  variant: null,
  isAlignable: true,
  suggested: true,
}
const plainToken = {
  alignment: null,
  variant: null,
  isAlignable: false,
  suggested: false,
}

async function waitForSavedView(): Promise<void> {
  await waitFor(() => expect(button('Preview request')).toBeEnabled())
  await waitFor(() => expect(button('Reset')).toBeDisabled())
}

test('the alignment view loads the line with its tokens when it is opened', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.loadAnnotatedLine)
  await renderLoadedContainer({ source, lines })

  expect(source.loadAnnotatedLine).not.toHaveBeenCalled()

  await openLineView('Alignment')

  expect(
    within(viewPanel('Alignment')).getByText('Loading alignment...'),
  ).toBeVisible()
  expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()

  await act(async () => held.resolve())
  await openLoadedView('Alignment')

  expect(source.loadAnnotatedLine.mock.calls).toEqual([[0]])
  expect(source.loadLemmatization).not.toHaveBeenCalled()
  expect(reconstructionRow()).toHaveTextContent('%n enūma | eliš #note: a note')
  expect(manuscriptRow(1)).toHaveTextContent(
    /^NinNA1ao 1e-nu-maenūma e-lišeliš/,
  )
  expect(manuscriptRow(2)).toHaveTextContent(
    /^BabaNBSch1o i 6'\[x x x\] e-li-išeliš/,
  )
  expect(within(manuscriptRow(2)).getAllByRole('button')).toHaveLength(1)
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')
  expect(screen.queryByText('Variant 1')).not.toBeInTheDocument()
})

test('aligned words, a variant and omitted words are saved and shown again', async () => {
  const { source, getState } = await renderLoadedView('Alignment', { lines })
  await alignWord(manuscriptRow(1), 'e-nu-ma', 'enūma', 'e-nu')
  await alignWord(manuscriptRow(1), 'e-liš', '--')
  await omitWord(manuscriptRow(2), 'enūma')

  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-liš$/)
  expect(source.saveAlignment).not.toHaveBeenCalled()

  await userEvent.click(button('Save alignment'))
  await waitForSavedView()

  expect(source.saveAlignment.mock.calls).toEqual([
    [
      0,
      [
        [
          {
            alignment: [
              {
                value: 'e-nu-ma',
                alignment: 1,
                variant: {
                  value: 'e-nu',
                  type: 'AkkadianWord',
                  language: 'AKKADIAN',
                },
                isAlignable: true,
                suggested: false,
              },
              {
                value: 'e-liš',
                alignment: null,
                variant: null,
                isAlignable: true,
                suggested: false,
              },
            ],
            omittedWords: [],
          },
          {
            alignment: [
              { ...plainToken, value: '[x' },
              { ...plainToken, value: 'x' },
              { ...plainToken, value: 'x]' },
              { ...suggestedWord, value: 'e-li-iš', alignment: 3 },
            ],
            omittedWords: [1],
          },
        ],
      ],
    ],
  ])
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(2)
  expect(getState().lines[0].annotation?.draft).toBeNull()
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maenūma$/,
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-liš$/)
  expect(wordLabel(manuscriptRow(2), 'e-li-iš')).toHaveClass('Word--suggestion')
  expect(
    (await source.loadAnnotatedLine(0)).variants[0].manuscripts.map(
      (manuscript) => manuscript.atfTokens.map((token) => token.alignment),
    ),
  ).toEqual([
    [1, null],
    [undefined, undefined, undefined, null],
  ])
  expect(within(manuscriptRow(2)).getByText('enūma')).toBeVisible()
  expect(button('Save alignment')).toBeDisabled()
})

test('suggestions that were not accepted are no unsaved change and are not saved', async () => {
  const { source, getState } = await renderLoadedView('Alignment', { lines })

  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')
  expect(button('Save alignment')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()
  expect(listDisabledViews()).toEqual([])
  expect(screen.queryByRole('note')).not.toBeInTheDocument()

  await userEvent.keyboard('{Tab}{Tab}{Shift>}{Tab}{/Shift}{Escape}')

  expect(getState().lines[0].annotation?.draft).toBeNull()
  expect(button('Save alignment')).toBeDisabled()
  expect(listDisabledViews()).toEqual([])
  expect(source.saveAlignment).not.toHaveBeenCalled()
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')
})
