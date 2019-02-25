
import { List } from 'immutable'
import _ from 'lodash'

export default class Reference {
  constructor (type = 'DISCUSSION', pages = '', notes = '', linesCited = [], document_ = null) {
    this.type = type
    this.pages = pages
    this.notes = notes
    this.linesCited = List(linesCited)
    this.document = document_
    Object.freeze(this)
  }

  get id () {
    return _.get(this.document, 'id', '')
  }

  get author () {
    const particle = _.get(this.document, 'author.0.non-dropping-particle', '')
    const family = _.get(this.document, 'author.0.family', '')
    return particle
      ? `${particle} ${family}`
      : family
  }

  get typeAbbreviation () {
    return this.type[0]
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

  setDocument (document_) {
    return new Reference(
      this.type,
      this.pages,
      this.notes,
      this.linesCited,
      _.cloneDeep(document_)
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
