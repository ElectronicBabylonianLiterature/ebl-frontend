// @flow
import _ from 'lodash'
// $FlowFixMe
import { Draft, immerable, produce } from 'immer'
import { List, Map } from 'immutable'
import BibliographyEntry from './BibliographyEntry'

type ReferenceType = 'EDITION' | 'DISCUSSION' | 'COPY' | 'PHOTO'
const defaultType = 'DISCUSSION'

class Reference {
  +type: ReferenceType
  +pages: string
  +notes: string
  +linesCited: Array<string>
  +document: BibliographyEntry

  constructor(
    type: ReferenceType = defaultType,
    pages: string = '',
    notes: string = '',
    linesCited: Array<string> = [],
    document_: BibliographyEntry = new BibliographyEntry()
  ) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = linesCited
    this.document = document_
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

  get useContainerTitle(): boolean {
    return (
      !_.isEmpty(this.document.shortContainerTitle) &&
      (['COPY', 'EDITION', 'DISCUSSION'].includes(this.type) ||
        ['RN2720', 'RN2721'].includes(this.id))
    )
  }

  get compactCitation() {
    const document = this.document || new BibliographyEntry()
    return [
      document.author,
      ', ',
      document.year,
      this.pages ? `: ${this.pages} ` : ' ',
      !_.isEmpty(this.linesCited) ? `[l. ${this.linesCited.join(', ')}] ` : '',
      `(${this.typeAbbreviation})`
    ].join('')
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

export default Reference

export function createReference(
  data: Map<string, any>,
  bibliographyRepository: { find: any => any }
) {
  return bibliographyRepository
    .find(data.get('id'))
    .then(
      entry =>
        new Reference(
          data.get('type', defaultType),
          data.get('pages', ''),
          data.get('notes', ''),
          ((data.get('linesCited', List()).toJS(): any): Array<string>),
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
