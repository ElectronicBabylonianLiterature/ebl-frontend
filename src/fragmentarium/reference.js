
import { List } from 'immutable'
import _ from 'lodash'
import Cite from 'citation-js'

export default class Reference {
  #document

  constructor (type = 'DISCUSSION', pages = '', notes = '', linesCited = [], document = null) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = List(linesCited)
    this.document = _.cloneDeep(document)
    Object.freeze(this)
  }

  get id () {
    return _.get(this.document, 'id', '')
  }

  get author () {
    return _.get(this.document, 'author.0.family', '')
  }

  get year () {
    return _.get(this.document, 'issued.date-parts.0.0', Number.NaN)
  }

  get title () {
    return _.get(this.document, 'title', '')
  }

  get typeAbbreviation () {
    return this.type[0]
  }

  get citation () {
    return new Cite(this.document)
  }

  setType (type) {
    return new Reference(
      type,
      this.pages,
      this.notes,
      this.linesCited,
      this.document
    )
  }

  setPages (pages) {
    return new Reference(
      this.type,
      pages,
      this.notes,
      this.linesCited,
      this.document
    )
  }

  setNotes (notes) {
    return new Reference(
      this.type,
      this.pages,
      notes,
      this.linesCited,
      this.document
    )
  }

  setLinesCited (linesCited) {
    return new Reference(
      this.type,
      this.pages,
      this.notes,
      List(linesCited),
      this.document
    )
  }

  setDocument (document) {
    return new Reference(
      this.type,
      this.pages,
      this.notes,
      this.linesCited,
      _.cloneDeep(document)
    )
  }
}

export function createReference (data, bibliographyRepository) {
  return bibliographyRepository
    .find(data.id)
    .then(entry => new Reference(
      data.type, data.pages, data.notes, data.linesCited, entry
    ))
}

export function serializeReference (reference) {
  return {
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  }
}
