import { screen } from '@testing-library/react'
import { clickNth, changeValueByLabel } from './utils'
import Lemma from 'transliteration/domain/Lemma'

export async function lemmatizeWord(word: string, lemma: Lemma): Promise<void> {
  await screen.findByText(word)
  clickNth(screen, word, 0)
  await screen.findByLabelText('Lemma')
  changeValueByLabel(screen, 'Lemma', 'a')
  await screen.findByText(lemma.lemma)
  clickNth(screen, lemma.lemma, 0)
}
