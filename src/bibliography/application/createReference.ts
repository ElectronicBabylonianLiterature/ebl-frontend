import Promise from 'bluebird'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

export default function createReference(
  data: ReferenceDto,
  bibliographyRepository: {
    find: (x0: string) => Promise<BibliographyEntry>
  }
): Promise<Reference> {
  return bibliographyRepository
    .find(data.id)
    .then(
      (entry) =>
        new Reference(
          data.type || Reference.DEFAULT_TYPE,
          data.pages || '',
          data.notes || '',
          data.linesCited || [],
          entry
        )
    )
}
