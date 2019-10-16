// @flow
import _ from 'lodash'
import BibliographyEntry from './BibliographyEntry'
import type { RefererenceType } from './Reference'
import Reference from './Reference'

export default class Citation {
  static +CONTAINER_CITATION_TYPES: $ReadOnlyArray<ReferenceType> = [
    'COPY',
    'EDITION'
  ]
  static +CONTAINER_CITATION_IDS: $ReadOnlyArray<string> = ['RN2720', 'RN2721']

  static for(reference: Reference): Citation {
    const useContainerCitation =
      reference.hasShortContainerTitle &&
      (Citation.CONTAINER_CITATION_TYPES.includes(reference.type) ||
        Citation.CONTAINER_CITATION_IDS.includes(reference.id))

    return useContainerCitation
      ? new ContainerCitation(reference)
      : new CompactCitation(reference)
  }

  +reference: Reference

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
    const document = reference.document || new BibliographyEntry()
    return [
      document.author,
      ', ',
      document.year,
      reference.pages ? `: ${reference.pages} ` : ' ',
      reference.hasLinesCited
        ? `\\[l. ${reference.linesCited.join(', ')}\\] `
        : '',
      `(${reference.typeAbbreviation})`
    ].join('')
  }
}
