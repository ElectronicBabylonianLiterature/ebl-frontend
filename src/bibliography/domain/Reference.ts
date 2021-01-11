import _ from 'lodash'
import produce, { Draft, immerable } from 'immer'

import BibliographyEntry from './BibliographyEntry'

export type ReferenceType = 'EDITION' | 'DISCUSSION' | 'COPY' | 'PHOTO'

export default class Reference {
  readonly type: ReferenceType
  readonly pages: string
  readonly notes: string
  readonly linesCited: ReadonlyArray<string>
  readonly document: BibliographyEntry

  static readonly DEFAULT_TYPE: ReferenceType = 'DISCUSSION'

  constructor(
    type: ReferenceType = Reference.DEFAULT_TYPE,
    pages = '',
    notes = '',
    linesCited: ReadonlyArray<string> = [],
    document_: BibliographyEntry = new BibliographyEntry({})
  ) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = linesCited
    this.document = document_
  }

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
    return this.type[0]
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
    return this.document ? this.document.toHtml() : ''
  }
}
Reference[immerable] = true
