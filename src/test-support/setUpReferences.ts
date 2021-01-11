import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { factory } from 'factory-girl'
import Promise from 'bluebird'

export default async function setUpReferences(
  bibliographyService
): Promise<{
  entries: readonly BibliographyEntry[]
  references: readonly Record<string, unknown>[]
  expectedReferences: Reference[]
}> {
  const entries = await factory.buildMany('bibliographyEntry', 2)
  const references = await factory.buildMany(
    'referenceDto',
    2,
    entries.map((entry: BibliographyEntry) => ({ id: entry.id }))
  )
  const expectedReferences = await factory.buildMany(
    'reference',
    2,
    references.map((dto: Record<string, unknown>, index: number) => ({
      ...dto,
      document: entries[index],
    }))
  )
  bibliographyService.find.mockImplementation((id) =>
    Promise.resolve(entries.find((entry: BibliographyEntry) => entry.id === id))
  )
  return {
    entries,
    references,
    expectedReferences,
  }
}
