import { fromJS, List } from 'immutable'
import Folio from 'fragmentarium/createFolio'

export class RecordEntry {
  constructor ({ user, date, type }) {
    this.user = user
    this.date = date
    this.type = type
    Object.freeze(this)
  }
}
export class Measure {
  constructor ({ value = null, note = null }) {
    this.value = value
    this.note = note
    Object.freeze(this)
  }
}

export class Measures {
  constructor ({
    length = new Measure({}),
    width = new Measure({}),
    thickness = new Measure({})
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
    this.hits = hits
    this.atf = atf
    this.matchingLines = List(matchingLines)
    Object.freeze(this)
  }

  get length () {
    return this.measures.length
  }

  get width () {
    return this.measures.width
  }

  get thickness () {
    return this.measures.thickness
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
      hits: this.hits,
      atf: this.atf,
      matchingLines: this.matchingLines
    })
  }
}

function createFragment (dto) {
  return new Fragment({
    ...dto,
    number: dto._id,
    measures: new Measures({
      length: new Measure(dto.length),
      width: new Measure(dto.width),
      thickness: new Measure(dto.thickness)
    }),
    folios: dto.folios.map(folioDto => new Folio(folioDto)),
    record: dto.record.map(recordEntryDto => new RecordEntry(recordEntryDto)),
    text: new Text({ lines: List(dto.text.lines).map(lineDto => new Line(lineDto)) }),
    references: dto.references.map(reference => fromJS(reference)),
    matchingLines: dto.matching_lines
      ? dto.matching_lines.map(line => fromJS(line))
      : []
  })
}

export default createFragment
