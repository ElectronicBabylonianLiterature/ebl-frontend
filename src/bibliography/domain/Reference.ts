import _ from 'lodash'
import { immerable, produce , Draft } from 'immer'

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

  get hasShortContainerTitle() {
    return !_.isEmpty(this.shortContainerTitle)
  }

  get hasLinesCited() {
    return !_.isEmpty(this.linesCited)
  }

  get id() {
    return this.document.id
  }

  get primaryAuthor() {
    return this.document.primaryAuthor
  }

  get authors() {
    return this.document.authors
  }

  get year() {
    return this.document.year
  }

  get link() {
    return this.document.link
  }

  get shortContainerTitle() {
    return this.document.shortContainerTitle
  }

  get collectionNumber() {
    return this.document.collectionNumber
  }

  get typeAbbreviation() {
    return this.type[0]
  }

  setType(type: ReferenceType) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.type = type
    })
  }

  setPages(pages: string) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.pages = pages
    })
  }

  setNotes(notes: string) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.notes = notes
    })
  }

  setLinesCited(linesCited: Array<string>) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.linesCited = linesCited
    })
  }

  setDocument(document_: BibliographyEntry) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.document = document_
    })
  }

  toHtml() {
    return this.document ? this.document.toHtml() : ''
  }
}
Reference[immerable] = true
