import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  return screen.getByRole('tab', { selected: true }).textContent
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

export async function alignWord(
  row: HTMLElement,
  word: string,
  idealWord: string,
  variant = '',
): Promise<void> {
  await userEvent.click(wordButton(row, word))
  const select = screen.getByLabelText('Ideal word')
  await userEvent.selectOptions(
    select,
    within(select).getByRole('option', { name: idealWord }),
  )
  if (variant !== '') {
    await userEvent.type(screen.getByLabelText('Variant'), variant)
  }
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))
}

export function wordLabel(row: HTMLElement, word: string): HTMLElement {
  return within(row).getAllByText(word)[0]
}

export async function omitWord(row: HTMLElement, word: string): Promise<void> {
  await userEvent.type(within(row).getByLabelText('Omitted words'), word)
  await userEvent.click(await within(row).findByRole('option', { name: word }))
}

export async function lemmatizeWord(
  row: HTMLElement,
  word: string,
  lemma: Lemma,
): Promise<void> {
  const optionName = `${lemma.lemma}${lemma.homonym},`
  await userEvent.click(wordButton(row, word))
  await userEvent.type(screen.getByLabelText('Lemma'), lemma.lemma.slice(0, 2))
  await userEvent.click(
    await screen.findByText(
      (_text, element) =>
        element?.getAttribute('role') === 'option' &&
        String(element.textContent).startsWith(optionName),
    ),
  )
}

export function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}
