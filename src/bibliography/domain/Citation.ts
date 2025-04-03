import Reference, { ReferenceType } from './Reference'

export default abstract class Citation {
  static readonly CONTAINER_CITATION_TYPES: ReadonlyArray<ReferenceType> = [
    'COPY',
    'EDITION',
    'PHOTO',
  ]
  static readonly CONTAINER_CITATION_IDS: ReadonlyArray<string> = [
    'RN2720',
    'RN2721',
    'RN2021',
    'RN1445',
    'RN1445a',
  ]

  static for(reference: Reference): Citation {
    const useContainerCitation =
      reference.hasShortContainerTitle &&
      (Citation.CONTAINER_CITATION_TYPES.includes(reference.type) ||
        Citation.CONTAINER_CITATION_IDS.includes(reference.id))

    return useContainerCitation
      ? new ContainerCitation(reference)
      : new CompactCitation(reference)
  }

  constructor(readonly reference: Reference) {}

  abstract getMarkdown(): string
}

export class ContainerCitation extends Citation {
  getMarkdown(): string {
    const reference = this.reference
    return [
      `*${reference.shortContainerTitle}*`,
      reference.collectionNumber ? ` ${reference.collectionNumber}` : '',
      reference.pages ? `, ${reference.pages}` : '',
      reference.hasLinesCited
        ? ` \\[l. ${reference.linesCited.join(', ')}\\]`
        : '',
    ].join('')
  }
}

export class CompactCitation extends Citation {
  getMarkdown(): string {
    const reference = this.reference
    return [
      this.getAuthor(),
      ', ',
      reference.year,
      reference.pages ? `: ${reference.pages}` : '',
      reference.hasLinesCited
        ? ` \\[l. ${reference.linesCited.join(', ')}\\]`
        : '',
    ].join('')
  }

  getAuthor(): string {
    const authors = this.reference.authors
    return authors.length > 3
      ? `${this.reference.primaryAuthor} *et al.*`
      : authors.join(' & ')
  }
}
