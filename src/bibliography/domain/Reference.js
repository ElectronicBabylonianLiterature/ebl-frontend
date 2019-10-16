// @flow
import _ from 'lodash'
import { immerable, produce } from 'immer'
import type { Draft } from 'immer'
import BibliographyEntry from './BibliographyEntry'
import Promise from 'bluebird'

export type ReferenceType = 'EDITION' | 'DISCUSSION' | 'COPY' | 'PHOTO'

export default class Reference {
  +type: ReferenceType
  +pages: string
  +notes: string
  +linesCited: $ReadOnlyArray<string>
  +document: BibliographyEntry

  static +DEFAULT_TYPE: ReferenceType = 'DISCUSSION'

  constructor(
    type: ReferenceType = Reference.DEFAULT_TYPE,
    pages: string = '',
    notes: string = '',
    linesCited: ReadOnlyArray<string> = [],
    document_: BibliographyEntry = new BibliographyEntry()
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

  get author() {
    return this.document.author
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

export function createReference(
  data: { [string]: any },
  bibliographyRepository: { find: string => Promise<BibliographyEntry> }
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

export function serializeReference(reference: Reference) {
  return {
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  }
}
