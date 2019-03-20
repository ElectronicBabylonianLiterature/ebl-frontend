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

export const UncuratedReference = Record({ document: '', pages: List() })

export class Fragment extends Record({
  number: '',
  cdliNumber: '',
  bmIdNumber: '',
  accession: '',
  publication: '',
  joins: List(),
  description: '',
  measures: Measures(),
  collection: '',
  script: '',
  folios: List(),
  record: List(),
  text: Text(),
  notes: '',
  museum: '',
  references: List(),
  uncuratedReferences: null,
  hits: null,
  atf: '',
  matchingLines: List()
}) {
  get hasUncuratedReferences () {
    return List.isList(this.uncuratedReferences)
  }

  setReferences (references) {
    return this.set('references', references)
  }
}
