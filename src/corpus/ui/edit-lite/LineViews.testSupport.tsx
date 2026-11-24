import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import Lemma from 'transliteration/domain/Lemma'

export type LineViewName = 'Text' | 'Alignment' | 'Lemmatization'

export const lineViewNames: readonly LineViewName[] = [
  'Text',
  'Alignment',
  'Lemmatization',
]

export function viewTab(name: LineViewName): HTMLElement {
  return screen.getByRole('tab', { name })
}

export function viewPanel(name: LineViewName): HTMLElement {
  return screen.getByRole('tabpanel', { name })
}

export function listDisabledViews(): LineViewName[] {
  return lineViewNames.filter((name) => viewTab(name).hasAttribute('disabled'))
}

export function selectedView(): string | null {
  return within(
    screen.getByRole('tablist', { name: 'Views of the line' }),
  ).getByRole('tab', { selected: true }).textContent
}

export async function openLineView(name: LineViewName): Promise<void> {
  await userEvent.click(viewTab(name))
}

export async function openLoadedView(
  name: 'Alignment' | 'Lemmatization',
): Promise<HTMLElement> {
  await openLineView(name)
  await within(viewPanel(name)).findAllByRole('group', {
    name: 'Reconstruction',
  })
  return viewPanel(name)
}

export async function renderLoadedView(
  name: 'Alignment' | 'Lemmatization',
  options: EditLiteRenderOptions,
): Promise<EditLiteRenderResult> {
  const view = await renderLoadedContainer(options)
  await openLoadedView(name)
  return view
}

export function manuscriptRow(manuscriptNumber: number): HTMLElement {
  return screen.getByRole('group', {
    name: `Manuscript line ${manuscriptNumber}`,
  })
}

export function reconstructionRow(): HTMLElement {
  return screen.getByRole('group', { name: 'Reconstruction' })
}

export function wordButton(row: HTMLElement, word: string): HTMLElement {
  return within(row).getByRole('button', {
    name: (name: string): boolean => name.startsWith(word),
  })
}

export function activePopover(): HTMLElement {
  return screen.getByRole('dialog', { name: /^(Alignment|Lemma) of / })
}

export function queryActivePopover(): HTMLElement | null {
  return screen.queryByRole('dialog', { name: /^(Alignment|Lemma) of / })
}

export function popoverField(name: string): HTMLElement {
  return within(activePopover()).getByLabelText(name)
}

export function expectActiveWord(
  row: HTMLElement,
  word: string,
  field: 'Ideal word' | 'Lemma',
): void {
  const toggle = wordButton(row, word)
  const kind = field === 'Lemma' ? 'Lemma' : 'Alignment'

  expect(activePopover()).toHaveAccessibleName(`${kind} of ${word}`)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(toggle).toHaveAttribute('aria-controls', activePopover().id)
  expect(popoverField(field)).toHaveFocus()
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
}

export async function openWord(row: HTMLElement, word: string): Promise<void> {
  const toggle = wordButton(row, word)
  if (toggle.getAttribute('aria-expanded') !== 'true') {
    await userEvent.click(toggle)
  }
}

export async function chooseIdealWord(
  idealWord: string,
  variant = '',
): Promise<void> {
  const select = popoverField('Ideal word')
  await userEvent.selectOptions(
    select,
    within(select).getByRole('option', { name: idealWord }),
  )
  if (variant !== '') {
    await userEvent.type(popoverField('Variant'), variant)
  }
}

export async function alignWord(
  row: HTMLElement,
  word: string,
  idealWord: string,
  variant = '',
): Promise<void> {
  await openWord(row, word)
  await chooseIdealWord(idealWord, variant)
  await userEvent.click(
    within(activePopover()).getByRole('button', { name: 'Set alignment' }),
  )
}

export function wordLabel(row: HTMLElement, word: string): HTMLElement {
  return within(row).getAllByText(word)[0]
}

export async function omitWord(row: HTMLElement, word: string): Promise<void> {
  await userEvent.type(within(row).getByLabelText('Omitted words'), word)
  await userEvent.click(await within(row).findByRole('option', { name: word }))
}

export function findLemmaOption(lemma: Lemma): Promise<HTMLElement> {
  const optionName = `${lemma.lemma}${lemma.homonym},`
  return screen.findByText(
    (_text, element) =>
      element?.getAttribute('role') === 'option' &&
      String(element.textContent).startsWith(optionName),
  )
}

export async function chooseLemma(lemma: Lemma): Promise<void> {
  await userEvent.type(popoverField('Lemma'), lemma.lemma.slice(0, 2))
  await userEvent.click(await findLemmaOption(lemma))
}

export async function lemmatizeWord(
  row: HTMLElement,
  word: string,
  lemma: Lemma,
): Promise<void> {
  await openWord(row, word)
  await chooseLemma(lemma)
}

export function listAlignments(line: Line): (number | null)[][] {
  return line.variants[0].manuscripts.map((manuscript) =>
    manuscript.atfTokens.flatMap((token) =>
      token.alignment === undefined ? [] : [token.alignment],
    ),
  )
}

export function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}
