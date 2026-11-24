import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  elish,
  lemmaLines,
  lemmaOptions,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import { noLemmaProblem } from 'corpus/ui/edit-lite/LemmaWord'
import {
  activePopover,
  chooseLemma,
  expectActiveWord,
  lemmatizeWord,
  listDisabledViews,
  manuscriptRow,
  openWord,
  popoverField,
  queryActivePopover,
  reconstructionRow,
  renderLoadedView,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const variantLines = { ...lemmaOptions, lines: lemmaLines.slice(1) }

function resetButton(): HTMLElement {
  return within(activePopover()).getByRole('button', {
    name: 'reset-current-token',
  })
}

function actionsToggle(): HTMLElement {
  return within(activePopover()).getByRole('button', {
    name: 'Open token actions',
  })
}

function menuItem(name: RegExp): HTMLElement {
  return within(activePopover()).getByRole('button', { name })
}

function variantRow(variantNumber: number): HTMLElement {
  return within(
    screen.getByRole('group', { name: `Variant ${variantNumber}` }),
  ).getByRole('group', { name: 'Reconstruction' })
}

function listPendingWords(): (string | null)[] {
  return Array.from(document.querySelectorAll('.edit-lite-word--pending')).map(
    (word) => word.textContent,
  )
}

test('reset puts an accepted suggestion back and leaves no unsaved change', async () => {
  const { getState } = await renderLoadedView('Lemmatization', lemmaOptions)

  expect(resetButton()).toBeDisabled()

  await userEvent.keyboard('{Enter}{Shift>}{Tab}{/Shift}')

  expect(resetButton()).toBeEnabled()
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).toHaveClass('Word--suggestion')

  await userEvent.click(resetButton())

  expectActiveWord(reconstructionRow(), 'enūma', 'Lemma')
  expect(resetButton()).toBeDisabled()
  expect(wordLabel(reconstructionRow(), 'enūma')).toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(/^e-nu-ma$/)
  expect(getState().lines[0].annotation?.draft).toBeNull()
  expect(listDisabledViews()).toEqual([])
})

test('reset puts a word that was set by hand back to what was stored', async () => {
  const { getState } = await renderLoadedView('Lemmatization', lemmaOptions)
  await lemmatizeWord(manuscriptRow(2), 'e-li-iš', new Lemma(elish))
  await lemmatizeWord(manuscriptRow(1), 'e-liš', new Lemma(elish))
  await openWord(manuscriptRow(2), 'e-li-iš')

  expect(wordButton(manuscriptRow(2), 'e-li-iš')).toHaveTextContent(
    /^e-li-išeliš II, eliš$/,
  )

  await userEvent.click(resetButton())

  expect(wordButton(manuscriptRow(2), 'e-li-iš')).toHaveTextContent(
    /^e-li-išeliš II$/,
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(getState().lines[0].annotation?.draft).not.toBeNull()
  expect(popoverField('Lemma')).toHaveFocus()
})

test('the actions of a word are reached with F2 and used with the keyboard', async () => {
  await renderLoadedView('Lemmatization', variantLines)
  await chooseLemma(new Lemma(elish))
  await userEvent.keyboard('{F2}')

  expect(actionsToggle()).toHaveFocus()

  await userEvent.keyboard('{F2}')

  expect(popoverField('Lemma')).toHaveFocus()

  await userEvent.keyboard('{F2}{Enter}{ArrowDown}')

  expect(menuItem(/^Update all instances of šapliš/)).toHaveFocus()
  expect(listPendingWords()).toEqual(['šaplišeliš', 'šapliš'])

  await userEvent.keyboard('{ArrowDown}')

  expect(menuItem(/^Reset all instances of šapliš/)).toHaveFocus()
  expect(listPendingWords()).toEqual(['šaplišeliš', 'šapliš'])

  await userEvent.keyboard('{Enter}')

  expect(variantRow(1)).toHaveTextContent(/^%n šapliš \| ammatu$/)
  expect(popoverField('Lemma')).toHaveFocus()
  expect(listPendingWords()).toEqual([])
  expectActiveWord(variantRow(1), 'šapliš', 'Lemma')
})

test('the instances of a word in the line are highlighted from the menu and reset together', async () => {
  const { getState } = await renderLoadedView('Lemmatization', variantLines)
  await chooseLemma(new Lemma(elish))
  await lemmatizeWord(variantRow(2), 'šapliš', new Lemma(elish))
  await lemmatizeWord(variantRow(2), 'erṣetu', new Lemma(elish))
  await openWord(variantRow(2), 'šapliš')
  await userEvent.click(actionsToggle())
  await userEvent.hover(menuItem(/^Update all instances of šapliš/))

  expect(listPendingWords()).toEqual(['šaplišeliš', 'šaplišeliš'])

  await userEvent.unhover(menuItem(/^Update all instances of šapliš/))

  expect(listPendingWords()).toEqual([])

  await userEvent.click(menuItem(/^Reset all instances of šapliš/))

  expect(variantRow(1)).toHaveTextContent(/^%n šapliš \| ammatu$/)
  expect(variantRow(2)).toHaveTextContent(/^%n šapliš \| erṣetueliš$/)
  expect(getState().lines[0].annotation?.draft).not.toBeNull()
  expect(popoverField('Lemma')).toHaveFocus()

  await userEvent.click(actionsToggle())

  expect(menuItem(/^Reset all instances of šapliš/)).toHaveClass('disabled')
})

test('a word without a lemma cannot be the source of the other instances', async () => {
  await renderLoadedView('Lemmatization', lemmaOptions)
  await userEvent.keyboard('{Tab}')
  await userEvent.click(actionsToggle())
  const item = menuItem(/^Update all instances of eliš/)
  await userEvent.click(item)

  expect(item).toHaveClass('disabled')
  expect(item).toHaveTextContent(
    `Update all instances of eliš${noLemmaProblem}`,
  )
  expect(noLemmaProblem).toBe('The word has no lemma.')
  expect(
    within(activePopover()).queryByRole('button', { name: /proper noun/ }),
  ).not.toBeInTheDocument()

  await userEvent.keyboard('{Escape}')

  expect(queryActivePopover()).toBeInTheDocument()
  expect(actionsToggle()).toHaveAttribute('aria-expanded', 'false')

  await userEvent.keyboard('{Escape}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveFocus()
})
