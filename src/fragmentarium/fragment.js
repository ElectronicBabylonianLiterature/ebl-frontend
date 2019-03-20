import { List, Record, Map } from 'immutable'

const FolioType = Record({ name: '', hasImage: false })
const folioTypes = Map({
  WGL: FolioType({ name: 'Lambert', hasImage: true }),
  FWG: FolioType({ name: 'Geers', hasImage: false }),
  EL: FolioType({ name: 'Leichty', hasImage: true }),
  AKG: FolioType({ name: 'Grayson', hasImage: true }),
  MJG: FolioType({ name: 'Geller', hasImage: true }),
  WRM: FolioType({ name: 'Mayer', hasImage: true })
})

export class Folio {
  #type

  constructor ({ name, number }) {
    this.name = name
    this.number = number
    this.#type = folioTypes.get(name, FolioType({ name }))
    Object.freeze(this)
  }

  get humanizedName () {
    return this.#type.name
  }

  get hasImage () {
    return this.#type.hasImage
  }

  get fileName () {
    return `${this.name}_${this.number}.jpg`
  }
}

export const RecordEntry = Record({ user: '', date: '', type: '' })

export const Measures = Record({ length: null, width: null, thickness: null })

export const Line = Record({ type: '', prefix: '', content: List() })

export const Text = Record({ lines: List() })

export class UncuratedReference {
  constructor ({ document, pages = List() }) {
    this.document = document
    this.pages = pages
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
    measures = Measures(),
    collection,
    script,
    folios = List(),
    record = List(),
    text = Text(),
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

  get hasUncuratedReferences () {
    return List.isList(this.uncuratedReferences)
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
