import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildAnnotationUrl,
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

const lines: readonly Line[] = buildEditLiteLines(3)

async function waitForSavedView(): Promise<void> {
  await waitFor(() => expect(button('Preview request')).toBeEnabled())
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

test('the request preview shows the address and the body of the save', async () => {
  const { source } = await renderLoadedView('Alignment', { lines })
  await omitWord(manuscriptRow(2), 'eliš')
  await userEvent.click(button('Preview request'))
  const preview = within(
    screen.getByRole('dialog', { name: 'Request preview' }),
  )

  expect(
    preview.getByText(
      `POST ${buildAnnotationUrl('alignment', 0, 'revision-1')}`,
    ),
  ).toBeVisible()
  expect(
    JSON.parse(preview.getByLabelText('Request body').textContent ?? ''),
  ).toEqual({
    alignment: [
      [
        {
          alignment: [
            {
              value: 'e-nu-ma',
              alignment: 1,
              variant: '',
              type: '',
              language: '',
            },
            {
              value: 'e-liš',
              alignment: 3,
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
              alignment: 3,
              variant: '',
              type: '',
              language: '',
            },
          ],
          omittedWords: [3],
        },
      ],
    ],
  })
  expect(source.saveAlignment).not.toHaveBeenCalled()
})
