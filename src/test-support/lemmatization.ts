import { RenderResult } from '@testing-library/react'
import { clickNth, changeValueByLabel } from './utils'
import Lemma from 'transliteration/domain/Lemma'

export async function lemmatizeWord(
  element: RenderResult,
  lemma: Lemma
): Promise<void> {
  await element.findByText('kur')
  await clickNth(element, 'kur', 0)
  await element.findByLabelText('Lemma')
  changeValueByLabel(element, 'Lemma', 'a')
  await element.findByText(lemma.lemma)
  await clickNth(element, lemma.lemma, 0)
}
