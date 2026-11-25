import { cslDataFactory } from 'test-support/bibliography-fixtures'

export const jonesReferenceDto = {
  id: 'jones2004study',
  type: 'DISCUSSION' as const,
  pages: '482',
  notes: '',
  linesCited: [],
  document: cslDataFactory.build(
    {
      author: [{ family: 'Jones', given: 'Alexander' }],
      issued: { 'date-parts': [[2004]] },
    },
    { associations: { id: 'jones2004study' } },
  ),
}

export const etaPisciumDto = {
  _id: 'η Piscium',
  realiaId: 'realia_028434',
  relatedTerms: ['η Psc', 'Eta Piscium', 'MÚL KUR šá DUR nu-nu'],
  type: ['Astronomy'],
  referenceType: ['eBL'],
  wikidataId: ['Q14068'],
  crossReferences: [],
  afoCrossReferences: [],
  reallexikon: [],
  afoRegister: [],
  eblRealia: [
    {
      id: 'MÚL KUR šá DUR nu-nu',
      transliteration: 'MÚL KUR šá DUR nu-nu',
      normalisation: '',
      translation: 'The bright star of the ribbon of the fishes',
      identification: 'η Psc',
      pos: 'CN',
      wikidataId: ['Q14068'],
      reference: jonesReferenceDto,
      remarks: '',
    },
  ],
  references: [jonesReferenceDto],
}

export const lisinDto = {
  _id: 'Lisi(n)',
  realiaId: 'realia_009307',
  relatedTerms: ['SI₄'],
  type: ['Divine names', 'Astronomy'],
  referenceType: ['RlA', 'AfO', 'eBL'],
  wikidataId: [],
  crossReferences: [],
  afoCrossReferences: [],
  reallexikon: [{ id: 'lisi', title: 'Lisi(n)', reference: null }],
  afoRegister: [
    {
      mainWord: 'Lisi(n)',
      note: '',
      afoVolume: 'AfO 25',
      page: '120',
      AfO: 'AfO 25 (1974), 120',
      reference: '',
      crossReference: '',
      crossReferences: [],
    },
  ],
  eblRealia: [
    {
      id: 'SI₄',
      transliteration: 'SI₄',
      normalisation: 'Lisi',
      translation: '(The god) Lisi',
      identification: 'α Sco',
      pos: 'CN',
      wikidataId: ['Q12166'],
      reference: { id: 'jones2004study', pages: '482' },
      remarks: 'Antares',
    },
  ],
  references: [jonesReferenceDto],
}
