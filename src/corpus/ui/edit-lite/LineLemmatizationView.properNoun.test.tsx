import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  lemmaOptions,
  properNounSession,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import {
  activePopover,
  button,
  expectActiveWord,
  listDisabledViews,
  manuscriptRow,
  openWord,
  popoverField,
  reconstructionRow,
  renderLoadedView,
  wordButton,
} from 'corpus/ui/edit-lite/LineViews.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const permittedOptions = { ...lemmaOptions, session: properNounSession }
const itemName = /^Create a new proper noun for /

async function openActions(): Promise<void> {
  await userEvent.click(
    within(activePopover()).getByRole('button', { name: 'Open token actions' }),
  )
}

function queryItem(): HTMLElement | null {
  return within(activePopover()).queryByRole('button', { name: itemName })
}

async function openPanel(): Promise<void> {
  await openActions()
  await userEvent.click(queryItem() as HTMLElement)
}

test('a proper noun is offered with the permission for a word that is changed, has no lemma or has only a suggestion', async () => {
  await renderLoadedView('Lemmatization', permittedOptions)
  await openActions()

  expect(wordButton(reconstructionRow(), 'enūma')).toHaveTextContent('enūma')
  expect(queryItem()).toHaveTextContent('Create a new proper noun for enūma')

  await userEvent.keyboard('{Escape}{F2}{Enter}{Shift>}{Tab}{/Shift}')
  await openActions()

  expect(queryItem()).toHaveTextContent('Create a new proper noun for enūma')

  await openWord(reconstructionRow(), 'eliš')
  await openActions()

  expect(queryItem()).toHaveTextContent('Create a new proper noun for eliš')

  await openWord(manuscriptRow(2), 'e-li-iš')
  await openActions()

  expect(queryItem()).not.toBeInTheDocument()
})

test('a created proper noun becomes the lemma of the word and is saved with the line', async () => {
  const { source, getState } = await renderLoadedView(
    'Lemmatization',
    permittedOptions,
  )
  await userEvent.keyboard('{Tab}')
  await openPanel()
  const nameInput = within(activePopover()).getByLabelText('properNoun-input')

  expect(nameInput).toHaveFocus()
  expect(
    within(activePopover()).queryByLabelText('Lemma'),
  ).not.toBeInTheDocument()

  await userEvent.keyboard('marduk{Enter}{Tab}')

  expect(activePopover()).toHaveAccessibleName('Lemma of eliš')
  expect(nameInput).toHaveValue('Marduk')

  await userEvent.selectOptions(
    within(activePopover()).getByLabelText('properNoun-type-select'),
    'DN',
  )
  await userEvent.click(
    within(activePopover()).getByRole('button', {
      name: 'save-properNoun-creation',
    }),
  )
  await waitFor(() => expect(popoverField('Lemma')).toHaveFocus())

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišMarduk DN$/,
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(
    /^e-lišMarduk DN$/,
  )
  expect(source.createProperNoun.mock.calls).toEqual([['Marduk', 'DN']])
  expect(source.saveLemmatization).not.toHaveBeenCalled()
  expect(getState().lines[0].annotation?.draft).not.toBeNull()

  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
  const [variant] = (await source.loadAnnotatedLine(0)).variants

  expect(variant.reconstructionTokens[3].uniqueLemma).toEqual(['Marduk DN'])
  expect(variant.manuscripts[0].atfTokens[1].uniqueLemma).toEqual([])
})

test('cancelling the proper noun gives the lemma select back with the focus', async () => {
  const { source, getState } = await renderLoadedView(
    'Lemmatization',
    permittedOptions,
  )
  await userEvent.keyboard('{Tab}')
  await openPanel()
  await userEvent.click(
    within(activePopover()).getByRole('button', {
      name: 'cancel-properNoun-creation',
    }),
  )

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(screen.queryByLabelText('properNoun-input')).not.toBeInTheDocument()
  expect(source.createProperNoun).not.toHaveBeenCalled()
  expect(getState().lines[0].annotation?.draft).toBeNull()
})
