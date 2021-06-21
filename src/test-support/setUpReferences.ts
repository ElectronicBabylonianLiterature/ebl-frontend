import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import {
  bibliographyEntryFactory,
  referenceDtoFactory,
} from './bibliography-fixtures'

export default async function setUpReferences(bibliographyService: {
  find: jest.Mock
}): Promise<{
  entries: readonly BibliographyEntry[]
  references: readonly ReferenceDto[]
  expectedReferences: Reference[]
}> {
  const entries = bibliographyEntryFactory.buildList(2)
  const references = entries.map((entry: BibliographyEntry) =>
    referenceDtoFactory.build({ id: entry.id })
  )
  const expectedReferences = references.map(
    (dto: ReferenceDto, index: number) =>
      new Reference(
        dto.type,
        dto.pages,
        dto.notes,
        dto.linesCited,
        entries[index]
      )
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
