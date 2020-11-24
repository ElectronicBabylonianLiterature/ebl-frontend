import { RenderResult } from '@testing-library/react'
import { clickNth, changeValueByLabel } from './utils'
import Lemma from 'transliteration/domain/Lemma'

export async function lemmatizeWord(
  element: RenderResult,
  word: string,
  lemma: Lemma
): Promise<void> {
  await element.findByText(word)
  await clickNth(element, word, 0)
  await element.findByLabelText('Lemma')
  changeValueByLabel(element, 'Lemma', 'a')
  await element.findByText(lemma.lemma)
  await clickNth(element, lemma.lemma, 0)
}
