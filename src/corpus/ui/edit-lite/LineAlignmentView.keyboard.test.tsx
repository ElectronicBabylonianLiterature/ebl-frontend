import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  activePopover,
  button,
  chooseIdealWord,
  expectActiveWord,
  listAlignments,
  listDisabledViews,
  manuscriptRow,
  popoverField,
  queryActivePopover,
  renderLoadedView,
  viewPanel,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { alignmentKeysHint } from 'corpus/ui/edit-lite/wordKeys'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)

test('the first word is active in a popover at the word when the view opens', async () => {
  await renderLoadedView('Alignment', { lines })

  expectActiveWord(manuscriptRow(1), 'e-nu-ma', 'Ideal word')
  expect(popoverField('Ideal word')).toHaveValue('1')
  expect(popoverField('Variant')).toHaveValue('')
  expect(activePopover()).toHaveClass('popover')
  expect(activePopover()).not.toHaveClass('modal')
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).not.toHaveAttribute(
    'aria-controls',
  )
  expect(
    within(viewPanel('Alignment')).getByText(alignmentKeysHint),
  ).toBeVisible()
  expect(alignmentKeysHint).toBe(
    'Enter sets the alignment and goes to the next word, Tab skips the word, Shift+Tab goes back, Escape closes the word and F2 moves between the ideal word and the variant.',
  )
})

test('Enter accepts the suggestion, Tab skips the word and Shift+Tab goes back', async () => {
  const { source, getState } = await renderLoadedView('Alignment', { lines })
  await userEvent.keyboard('{Enter}')

  expectActiveWord(manuscriptRow(1), 'e-liš', 'Ideal word')
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(getState().lines[0].annotation?.draft).not.toBeNull()
  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])

  await userEvent.keyboard('{Tab}')

  expectActiveWord(manuscriptRow(2), 'e-li-iš', 'Ideal word')
  expect(wordLabel(manuscriptRow(1), 'e-liš')).toHaveClass('Word--suggestion')

  await userEvent.keyboard('{Shift>}{Tab}{Tab}{Tab}{/Shift}')

  expectActiveWord(manuscriptRow(1), 'e-nu-ma', 'Ideal word')
  expect(source.saveAlignment).not.toHaveBeenCalled()

  await userEvent.keyboard('{Escape}')
  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  expect(listAlignments(await source.loadAnnotatedLine(0))).toEqual([
    [1, null],
    [null],
  ])
})

test('Enter applies the chosen ideal word and the variant reached with F2', async () => {
  const { source } = await renderLoadedView('Alignment', { lines })
  await chooseIdealWord('eliš')
  await userEvent.keyboard('{F2}')

  expect(popoverField('Variant')).toHaveFocus()

  await userEvent.keyboard('e-nu{F2}')

  expect(popoverField('Ideal word')).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expectActiveWord(manuscriptRow(1), 'e-liš', 'Ideal word')
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maeliš$/,
  )

  await chooseIdealWord('--')
  await userEvent.keyboard('{Enter}{Escape}')

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-liš$/)
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )

  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  const savedLine = await source.loadAnnotatedLine(0)

  expect(listAlignments(savedLine)).toEqual([[3, null], [null]])
  expect(savedLine.variants[0].manuscripts[0].atfTokens[0]).toMatchObject({
    variant: { value: 'e-nu' },
  })
})

test('Escape closes the popover and gives the focus back to the word', async () => {
  await renderLoadedView('Alignment', { lines })
  await userEvent.keyboard('{Tab}{Escape}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveFocus()
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  await userEvent.keyboard('{Tab}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(within(manuscriptRow(1)).getByLabelText('Omitted words')).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(queryActivePopover()).not.toBeInTheDocument()
})

test('a click makes a word active, closes the active word or dismisses it from outside', async () => {
  const { getState } = await renderLoadedView('Alignment', { lines })
  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))

  expectActiveWord(manuscriptRow(2), 'e-li-iš', 'Ideal word')

  await userEvent.click(popoverField('Variant'))

  expect(activePopover()).toHaveAccessibleName('Alignment of e-li-iš')
  expect(popoverField('Variant')).toHaveFocus()

  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(manuscriptRow(2), 'e-li-iš')).toHaveFocus()

  await userEvent.click(wordButton(manuscriptRow(1), 'e-liš'))
  await userEvent.click(screen.getByText(alignmentKeysHint))

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(getState().lines[0].annotation?.draft).not.toBeInTheDocument()
})

test('the button of the popover sets the alignment and closes the word', async () => {
  const { getState } = await renderLoadedView('Alignment', { lines })
  await userEvent.click(
    within(activePopover()).getByRole('button', { name: 'Set alignment' }),
  )

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveFocus()
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(getState().lines[0].annotation?.draft).not.toBeNull()
})
