import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  elish,
  lemmaOptions,
  listStoredLemmas,
  storedLemmaLines,
  twoVariantLines,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import {
  chooseLemma,
  expectActiveWord,
  openLoadedView,
  queryActivePopover,
  selectedView,
  variantRow,
  wordButton,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const firstManuscript = 'Manuscript line 1'

async function openLemmatization(
  lines: readonly Line[],
): Promise<FakeChapterEditSource> {
  const source = createFakeChapterEditSource({ ...lemmaOptions, lines })
  renderSplit(0, { ...lemmaOptions, lines, source })
  await loadedEditor('1')
  await openLoadedView('Lemmatization')
  return source
}

async function expectNextLineOpened(): Promise<void> {
  await waitFor(() => expect(selectedOptions()).toEqual([options()[1]]))
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())

  expect(selectedView()).toBe('Lemmatization')
  expectActiveWord(variantRow(1), 'šapliš', 'Lemma')
}

test('Tab goes through the reconstruction words of all variants and from the last one saves the line and opens the next', async () => {
  const source = await openLemmatization(twoVariantLines)

  expectActiveWord(variantRow(1), 'enūma', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(1), 'eliš', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(2), 'šapliš', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(2), 'erṣetu', 'Lemma')

  await chooseLemma(new Lemma(elish))
  await userEvent.keyboard('{Tab}')
  await expectNextLineOpened()

  expect(source.saveLemmatization.mock.calls.map(([index]) => index)).toEqual([
    0,
  ])
  await expect(listStoredLemmas(source, 1)).resolves.toEqual([
    [[], ['eliš I']],
    [[], ['eliš I']],
  ])
  await expect(listStoredLemmas(source)).resolves.toEqual([
    [[], []],
    [[], []],
  ])
})

test('a clicked manuscript word goes on with Tab through the manuscript words and Shift+Tab goes back to the reconstruction', async () => {
  const source = await openLemmatization(twoVariantLines)
  await userEvent.click(wordButton(variantRow(1, firstManuscript), 'e-nu-ma'))

  expectActiveWord(variantRow(1, firstManuscript), 'e-nu-ma', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(1, firstManuscript), 'e-liš', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(2, firstManuscript), 'šap-liš', 'Lemma')

  await userEvent.keyboard('{Shift>}{Tab}{Tab}{Tab}{/Shift}')

  expectActiveWord(variantRow(2), 'erṣetu', 'Lemma')

  await userEvent.click(wordButton(variantRow(2, firstManuscript), 'er-ṣe-tu'))
  await userEvent.keyboard('{Tab}')
  await expectNextLineOpened()

  expect(source.saveLemmatization).not.toHaveBeenCalled()
})

test('Enter on a reconstruction word with a stored lemma sets it on the aligned manuscript words without a lemma', async () => {
  const source = await openLemmatization(storedLemmaLines)
  await userEvent.keyboard('{Tab}')

  expectActiveWord(variantRow(1), 'eliš', 'Lemma')
  expect(wordButton(variantRow(1), 'eliš')).toHaveTextContent(/^elišeliš$/)
  expect(wordButton(variantRow(1, firstManuscript), 'e-liš')).toHaveTextContent(
    /^e-liš$/,
  )

  await userEvent.keyboard('{Enter}')
  await expectNextLineOpened()

  expect(source.saveLemmatization).toHaveBeenCalledTimes(1)
  await expect(listStoredLemmas(source)).resolves.toEqual([
    [[], ['eliš I']],
    [[], ['eliš I']],
    [['eliš II']],
  ])
})
