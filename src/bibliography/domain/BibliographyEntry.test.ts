import _ from 'lodash'
import Cite from 'citation-js'
import BibliographyEntry, { CslData } from './BibliographyEntry'
import { cslDataFactory } from 'test-support/bibliography-fixtures'

let cslData: CslData
let entry: BibliographyEntry
let cite: Cite

beforeEach(() => {
  cslData = cslDataFactory.build({
    author: [{ family: 'Family', extra: 'Extra' }],
    _underscored: 'should be omitted',
    'container-title-short': 'short title',
  })
  entry = new BibliographyEntry(cslData)
  cite = new Cite(cslData)
})

test.each([
  ['id', 'id'],
  ['primaryAuthor', 'author.0.family'],
  ['title', 'title'],
  ['link', 'URL'],
  ['shortContainerTitle', 'container-title-short'],
])('%s', (property, path) =>
  expect(entry[property]).toEqual(_.get(cslData, path)),
)

test('non-dropping particle', () => {
  cslData = cslDataFactory.build({
    author: [
      {
        'non-dropping-particle': 'von',
        family: 'Soden',
      },
    ],
  })
  entry = new BibliographyEntry(cslData)
  expect(entry.primaryAuthor).toEqual('von Soden')
})

test('authors', () => {
  cslData = cslDataFactory.build({
    author: [
      {
        'non-dropping-particle': 'von',
        family: 'Soden',
      },
      {
        family: 'Nodes',
      },
    ],
  })
  entry = new BibliographyEntry(cslData)
  expect(entry.authors).toEqual(['von Soden', 'Nodes'])
})

test('fallback link', () => {
  cslData = cslDataFactory.build({ URL: null, DOI: 'doi' })
  entry = new BibliographyEntry(cslData)
  expect(entry.link).toEqual(`https://doi.org/${cslData.DOI}`)
})

test('year', () => {
  expect(entry.year).toEqual(String(_.get(cslData, 'issued.date-parts.0.0')))
})

test('year range', () => {
  cslData = cslDataFactory.build({
    issued: {
      'date-parts': [[1800], [2900]],
    },
  })
  entry = new BibliographyEntry(cslData)
  expect(entry.year).toEqual('1800–2900')
})

test('toHtml', () => {
  expect(entry.toHtml()).toEqual(
    cite.format('bibliography', {
      format: 'html',
      template: 'citation-apa',
      lang: 'de-DE',
    }),
  )
})

test('toBibtex', () => {
  expect(entry.toBibtex()).toEqual(
    cite.get({
      format: 'string',
      type: 'string',
      style: 'bibtex',
    }),
  )
})

test('toCslData', () => {
  const expectedCslData = cslDataFactory.build({
    ..._.omit(cslData, '_underscored'),
    author: [{ family: 'Family' }],
  })
  expect(entry.toCslData()).toEqual(expectedCslData)
})
