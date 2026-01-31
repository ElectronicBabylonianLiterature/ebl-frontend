import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

export default function createReference(referenceDto: ReferenceDto): Reference {
  return new Reference(
    referenceDto.type,
    referenceDto.pages,
    referenceDto.notes,
    referenceDto.linesCited,
    new BibliographyEntry(referenceDto.document),
  )
}
