import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  alignWord,
  button,
  manuscriptRow,
  omitWord,
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

async function waitForSavedView(): Promise<void> {
  await waitFor(() => expect(button('Reset')).toBeInTheDocument())
  await waitFor(() => expect(button('Reset')).toBeDisabled())
}

test('while the alignment is saved the line shows the progress and is locked', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.saveAlignment)
  await renderLoadedView('Alignment', { source, lines })
  await omitWord(manuscriptRow(1), 'eliš')
  await userEvent.click(button('Save alignment'))

  expect(within(viewPanel('Alignment')).getByText('Saving...')).toBeVisible()
  expect(button('Save alignment')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()
  expect(
    within(manuscriptRow(1)).queryByRole('button', { name: /^e-/ }),
  ).not.toBeInTheDocument()
  expect(
    within(manuscriptRow(1)).getByLabelText('Omitted words'),
  ).toBeDisabled()
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')

  await act(async () => held.resolve())
  await waitForSavedView()

  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
  expect(
    within(manuscriptRow(1)).getByText('eliš', { selector: 'div' }),
  ).toBeVisible()
})

test('reset discards the changes and keeps the loaded tokens', async () => {
  const { source } = await renderLoadedView('Alignment', { lines })
  await alignWord(manuscriptRow(1), 'e-nu-ma', 'eliš')
  await omitWord(manuscriptRow(1), 'enūma')

  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maeliš$/,
  )

  await userEvent.click(button('Reset'))

  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maenūma$/,
  )
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')
  expect(within(manuscriptRow(1)).getByText('Omitted words')).toBeVisible()
  expect(button('Reset')).toBeDisabled()
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
  expect(source.saveAlignment).not.toHaveBeenCalled()
})

test('saving sends the alignment of the line as the body of the request', async () => {
  const { source } = await renderLoadedView('Alignment', { lines })
  await omitWord(manuscriptRow(2), 'eliš')
  await userEvent.click(button('Save alignment'))
  await waitForSavedView()
  const [[index, alignment]] = source.saveAlignment.mock.calls

  expect(index).toBe(0)
  expect(toChapterUpdate({ type: 'saveAlignment', index, alignment })).toEqual({
    endpoint: 'lines/0/alignment',
    body: {
      alignment: [
        [
          {
            alignment: [
              {
                value: 'e-nu-ma',
                alignment: null,
                variant: '',
                type: '',
                language: '',
              },
              {
                value: 'e-liš',
                alignment: null,
                variant: '',
                type: '',
                language: '',
              },
            ],
            omittedWords: [],
          },
          {
            alignment: [
              { value: '[x' },
              { value: 'x' },
              { value: 'x]' },
              {
                value: 'e-li-iš',
                alignment: null,
                variant: '',
                type: '',
                language: '',
              },
            ],
            omittedWords: [3],
          },
        ],
      ],
    },
  })
})
