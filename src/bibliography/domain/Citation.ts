import Reference, { ReferenceType } from './Reference'

export default class Citation {
  static readonly CONTAINER_CITATION_TYPES: ReadonlyArray<ReferenceType> = [
    'COPY',
    'EDITION'
  ]
  static readonly CONTAINER_CITATION_IDS: ReadonlyArray<string> = ['RN2720', 'RN2721']

  static for(reference: Reference): Citation {
    const useContainerCitation =
      reference.hasShortContainerTitle &&
      (Citation.CONTAINER_CITATION_TYPES.includes(reference.type) ||
        Citation.CONTAINER_CITATION_IDS.includes(reference.id))

    return useContainerCitation
      ? new ContainerCitation(reference)
      : new CompactCitation(reference)
  }

  readonly reference: Reference

  constructor(reference: Reference) {
    this.reference = reference
  }

  getMarkdown() {
    return ''
  }
}

export class ContainerCitation extends Citation {
  getMarkdown() {
    const reference = this.reference
    return [
      `*${reference.shortContainerTitle}*`,
      ' ',
      reference.collectionNumber ? `${reference.collectionNumber}, ` : '',
      reference.pages,
      ' ',
      reference.hasLinesCited
        ? `\\[l. ${reference.linesCited.join(', ')}\\] `
        : '',
      `(${reference.typeAbbreviation})`
    ].join('')
  }
}

export class CompactCitation extends Citation {
  getMarkdown() {
    const reference = this.reference
    return [
      this.getAuthor(),
      ', ',
      reference.year,
      reference.pages ? `: ${reference.pages} ` : ' ',
      reference.hasLinesCited
        ? `\\[l. ${reference.linesCited.join(', ')}\\] `
        : '',
      `(${reference.typeAbbreviation})`
    ].join('')
  }

  getAuthor() {
    const authors = this.reference.authors
    return authors.length > 3
      ? `${this.reference.primaryAuthor} *et al.*`
      : authors.join(' & ')
  }
}
