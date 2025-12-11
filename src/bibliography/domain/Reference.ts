import _ from 'lodash'
import produce, { Draft, immerable } from 'immer'

import BibliographyEntry from './BibliographyEntry'

export type ReferenceType =
  | 'EDITION'
  | 'DISCUSSION'
  | 'COPY'
  | 'PHOTO'
  | 'TRANSLATION'
  | 'ARCHAEOLOGY'
  | 'ACQUISITION'
  | 'SEAL'

const typeOrder: { readonly [key: string]: number } = {
  COPY: 1,
  PHOTO: 2,
  EDITION: 3,
  TRANSLATION: 4,
  DISCUSSION: 5,
  ARCHAEOLOGY: 6,
  ACQUISITION: 7,
  SEAL: 8,
}

export function groupReferences(
  references: readonly Reference[]
): [string, Reference[]][] {
  return _.chain(references)
    .sortBy('primaryAuthor', 'year')
    .groupBy('type')
    .toPairs()
    .sortBy(([type]) => _.get(typeOrder, type, 5))
    .map()
    .value()
}

export default class Reference {
  readonly [immerable] = true
  static readonly DEFAULT_TYPE: ReferenceType = 'DISCUSSION'

  constructor(
    readonly type: ReferenceType = Reference.DEFAULT_TYPE,
    readonly pages: string = '',
    readonly notes: string = '',
    readonly linesCited: ReadonlyArray<string> = [],
    readonly document: BibliographyEntry = new BibliographyEntry({})
  ) {}

  get hasShortContainerTitle(): boolean {
    return !_.isEmpty(this.shortContainerTitle)
  }

  get hasLinesCited(): boolean {
    return !_.isEmpty(this.linesCited)
  }

  get id(): string {
    return this.document.id
  }

  get primaryAuthor(): string {
    return this.document.primaryAuthor
  }

  get authors(): string[] {
    return this.document.authors
  }

  get year(): string {
    return this.document.year
  }

  get link(): string {
    return this.document.link
  }

  get shortContainerTitle(): string {
    return this.document.shortContainerTitle
  }

  get collectionNumber(): string {
    return this.document.collectionNumber
  }

  get typeAbbreviation(): string {
    return this.type === 'ACQUISITION' ? 'Ac' : this.type[0]
  }

  setType(type: ReferenceType): Reference {
    return produce(this, (draft: Draft<Reference>) => {
      draft.type = type
    })
  }

  setPages(pages: string): Reference {
    return produce(this, (draft: Draft<Reference>) => {
      draft.pages = pages
    })
  }

  setNotes(notes: string): Reference {
    return produce(this, (draft: Draft<Reference>) => {
      draft.notes = notes
    })
  }

  setLinesCited(linesCited: Array<string>): Reference {
    return produce(this, (draft: Draft<Reference>) => {
      draft.linesCited = linesCited
    })
  }

  setDocument(document_: BibliographyEntry): Reference {
    return produce(this, (draft: Draft<Reference>) => {
      draft.document = document_
    })
  }

  toHtml(): string {
    return this.document?.toHtml() ?? ''
  }
}
