import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

function mapReference(
  referenceDto: ReferenceDto,
  isCompactSummary: boolean,
): Reference {
  return new Reference(
    referenceDto.type,
    referenceDto.pages,
    referenceDto.notes,
    referenceDto.linesCited,
    new BibliographyEntry(referenceDto.document),
  ).withIdentity(referenceDto.id, isCompactSummary)
}

export default function createReference(referenceDto: ReferenceDto): Reference {
  return mapReference(referenceDto, false)
}

export function createCompactReference(referenceDto: ReferenceDto): Reference {
  return mapReference(referenceDto, true)
}
