// @flow
import _ from 'lodash'
import { immerable } from 'immer'
import { Map, List } from 'immutable'

class Reference {
  +type: string
  +pages: string
  +notes: string
  +linesCited: List<string>
  +document: ?Object

  constructor (
    type: string = 'DISCUSSION',
    pages: string = '',
    notes: string = '',
    linesCited: Array<string> = [],
    document_: ?Object = null
  ) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = List(linesCited)
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
    return new Reference(
      type,
      this.pages,
      this.notes,
      this.linesCited,
      this.document
    )
  }

  setPages (pages: string) {
    return new Reference(
      this.type,
      pages,
      this.notes,
      this.linesCited,
      this.document
    )
  }

  setNotes (notes: string) {
    return new Reference(
      this.type,
      this.pages,
      notes,
      this.linesCited,
      this.document
    )
  }

  setLinesCited (linesCited: Array<string>) {
    return new Reference(
      this.type,
      this.pages,
      this.notes,
      linesCited,
      this.document
    )
  }

  setDocument (document_: ?Object) {
    return new Reference(
      this.type,
      this.pages,
      this.notes,
      this.linesCited,
      document_
    )
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
          data.get('type'),
          data.get('pages'),
          data.get('notes'),
          data.get('linesCited'),
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
    linesCited: reference.linesCited.toJS()
  }
}
