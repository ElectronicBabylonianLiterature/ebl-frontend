import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  EditLiteRenderOptions,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  activePopover,
  expectActiveWord,
  openLoadedView,
  queryActivePopover,
  reconstructionRow,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  loadedEditor,
  options,
  renderSplit,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import Word from 'dictionary/domain/Word'

export const lineWord: Word = buildDictionaryWord('line')
export const kurWord: Word = buildDictionaryWord('kur')
export const instanceLines: readonly Line[] = buildEditLiteLines(6)
export const instanceOptions: EditLiteRenderOptions = {
  lines: instanceLines,
  words: [lineWord, kurWord],
  suggestions: [{ word: 'line', isNormalized: true, lemmas: [['line I']] }],
}

export function updateAllItem(): HTMLElement {
  return within(activePopover()).getByRole('button', {
    name: /^Update all instances of /,
  })
}

export async function openWordActions(): Promise<void> {
  await userEvent.click(
    within(activePopover()).getByRole('button', { name: 'Open token actions' }),
  )
}

export async function requestUpdateAll(): Promise<HTMLElement> {
  await openWordActions()
  await userEvent.click(updateAllItem())
  return screen.findByRole('dialog', { name: 'Update all instances' })
}

export async function confirmUpdateAll(): Promise<void> {
  const dialog = await requestUpdateAll()
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Update all instances' }),
  )
}

export function listReconstructionLemmas(
  lines: readonly Line[],
): (readonly string[] | null | undefined)[][] {
  return lines.map((line) =>
    line.variants[0].reconstructionTokens.map((token) => token.uniqueLemma),
  )
}

export async function openLemmatization(
  lineNumber: string,
  source: FakeChapterEditSource = createFakeChapterEditSource(instanceOptions),
): Promise<FakeChapterEditSource> {
  renderSplit(Number(lineNumber) - 1, { source, lines: instanceLines })
  await loadedEditor(lineNumber)
  await openLoadedView('Lemmatization')
  return source
}

export async function selectLine(lineNumber: string): Promise<void> {
  await userEvent.click(options()[Number(lineNumber) - 1])
  await loadedEditor(lineNumber)
}

export async function waitForReloadedWord(word: string): Promise<void> {
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())
  expectActiveWord(reconstructionRow(), word, 'Lemma')
}
