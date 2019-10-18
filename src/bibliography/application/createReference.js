import Promise from 'bluebird'
import Reference from 'bibliography/domain/Reference'

export default function createReference(
  data: {
    [x: string]: any
  },
  bibliographyRepository: {
    find: (x0: string) => Promise<BibliographyEntry>
  }
): Promise<Reference> {
  return bibliographyRepository
    .find(data.id)
    .then(
      entry =>
        new Reference(
          data.type || Reference.DEFAULT_TYPE,
          data.pages || '',
          data.notes || '',
          data.linesCited || [],
          entry
        )
    )
}
