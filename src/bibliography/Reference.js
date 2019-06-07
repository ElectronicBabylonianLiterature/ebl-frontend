// @flow
import _ from 'lodash'
// $FlowFixMe
import { Draft, immerable, produce } from 'immer'
import { List, Map } from 'immutable'
import BibliographyEntry from './BibliographyEntry'

class Reference {
  +type: string
  +pages: string
  +notes: string
  +linesCited: Array<string>
  +document: ?BibliographyEntry

  constructor (
    type: string = 'DISCUSSION',
    pages: string = '',
    notes: string = '',
    linesCited: Array<string> = [],
    document_: ?BibliographyEntry = null
  ) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = linesCited
    this.document = document_
  }

  get id () {
    return _.get(this, 'document.id', '')
  }

  get author () {
    return _.get(this, 'document.author', '')
  }

  get typeAbbreviation () {
    return _.get(this, 'type.0', '')
  }

  setType (type: string) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.type = type
    })
  }

  setPages (pages: string) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.pages = pages
    })
  }

  setNotes (notes: string) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.notes = notes
    })
  }

  setLinesCited (linesCited: Array<string>) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.linesCited = linesCited
    })
  }

  setDocument (document_: ?BibliographyEntry) {
    return produce(this, (draft: Draft<Reference>) => {
      draft.document = document_
    })
  }
}
Reference[immerable] = true

export default Reference

export function createReference (
  data: Map<string, any>,
  bibliographyRepository: { find: any => any }
) {
  return bibliographyRepository
    .find(data.get('id'))
    .then(
      entry =>
        new Reference(
          data.get('type', ''),
          data.get('pages', ''),
          data.get('notes', ''),
          ((data.get('linesCited', List()).toJS(): any): Array<string>),
          entry
        )
    )
}

export function serializeReference (reference: Reference) {
  return {
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  }
}
