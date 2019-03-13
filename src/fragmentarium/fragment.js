import { fromJS, List } from 'immutable'

const folioNames = {
  WGL: 'Lambert',
  FWG: 'Geers',
  EL: 'Leichty',
  AKG: 'Grayson',
  MJG: 'Geller'
}
const foliosWithImages = ['WGL', 'AKG', 'MJG', 'EL']
export class Folio {
  constructor ({ name, number }) {
    this.name = name
    this.number = number
    Object.freeze(this)
  }

  get humanizedName () {
    return folioNames[this.name] || this.name
  }

  get hasImage () {
    return foliosWithImages.includes(this.name)
  }

  get fileName () {
    return `${this.name}_${this.number}.jpg`
  }
}
export class RecordEntry {
  constructor ({ user, date, type }) {
    this.user = user
    this.date = date
    this.type = type
    Object.freeze(this)
  }
}
export class Measures {
  constructor ({
    length = null,
    width = null,
    thickness = null
  }) {
    this.length = length
    this.width = width
    this.thickness = thickness
    Object.freeze(this)
  }
}
export class Line {
  constructor ({ type, prefix, content }) {
    this.type = type
    this.prefix = prefix
    this.content = fromJS(content)
    Object.freeze(this)
  }
}

export class Text {
  constructor ({ lines = List() }) {
    this.lines = lines
    Object.freeze(this)
  }
}

export class UncuratedReference {
  constructor ({ document, lines = List() }) {
    this.document = document
    this.line = lines
    Object.freeze(this)
  }
}
export class Fragment {
  constructor ({
    number,
    cdliNumber = '',
    bmIdNumber = '',
    accession = '',
    publication = '',
    joins = List(),
    description = '',
    measures = new Measures({}),
    collection,
    script,
    folios = List(),
    record = List(),
    text = new Text({}),
    notes = '',
    museum = '',
    references = List(),
    uncuratedReferences = null,
    hits = null,
    atf = '',
    matchingLines = List()
  }) {
    this.number = number
    this.cdliNumber = cdliNumber
    this.bmIdNumber = bmIdNumber
    this.accession = accession
    this.publication = publication
    this.joins = List(joins)
    this.description = description
    this.measures = measures
    this.collection = collection
    this.script = script
    this.folios = List(folios)
    this.record = List(record)
    this.text = text
    this.notes = notes
    this.museum = museum
    this.references = List(references)
    this.uncuratedReferences = uncuratedReferences && List(uncuratedReferences)
    this.hits = hits
    this.atf = atf
    this.matchingLines = List(matchingLines)
    Object.freeze(this)
  }

  setReferences (references) {
    return new Fragment({
      number: this.number,
      cdliNumber: this.cdliNumber,
      bmIdNumber: this.bmIdNumber,
      accession: this.accession,
      publication: this.publication,
      joins: this.joins,
      description: this.description,
      measures: this.measures,
      collection: this.collection,
      script: this.script,
      folios: this.folios,
      record: this.record,
      text: this.text,
      notes: this.notes,
      museum: this.museum,
      references: references,
      uncuratedReferences: this.uncuratedReferences,
      hits: this.hits,
      atf: this.atf,
      matchingLines: this.matchingLines
    })
  }
}
