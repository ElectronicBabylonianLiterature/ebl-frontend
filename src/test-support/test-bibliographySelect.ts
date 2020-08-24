import { changeValueByLabel, clickNth } from './utils'
import BibliographyEntry from '../bibliography/domain/BibliographyEntry'
import { RenderResult } from '@testing-library/react'

export async function fillBibliographySelect(
  entry: BibliographyEntry,
  bibliographySelectLabel: string,
  element: RenderResult,
  value: string
): Promise<void> {
  const label = expectedLabel(entry)
  changeValueByLabel(element, bibliographySelectLabel, value)
  await element.findByText(label)
  await clickNth(element, label, 0)
}

export function expectedLabel(entry: BibliographyEntry): string {
  return `${entry.primaryAuthor} ${entry.year} ${entry.title}`
}
