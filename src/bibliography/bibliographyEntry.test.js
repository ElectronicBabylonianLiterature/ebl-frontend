import { factory } from 'factory-girl'
import _ from 'lodash'
import Cite from 'citation-js'
import BibliographyEntry from './bibliographyEntry'

let cslData
let entry
let cite

beforeEach(async () => {
  cslData = await factory.build('cslData')
  entry = new BibliographyEntry(cslData)
  cite = new Cite(cslData)
})

test.each([
  ['id', 'id'],
  ['author', 'author.0.family'],
  ['title', 'title'],
  ['link', 'URL']
])('%s', async (property, path) =>
  expect(entry[property]).toEqual(_.get(cslData, path))
)

test('non-dropping particle', async () => {
  cslData = await factory.build('cslData', { author: [
    {
      'non-dropping-particle': 'von',
      'family': 'Soden'
    }
  ] })
  entry = new BibliographyEntry(cslData)
  expect(entry.author).toEqual('von Soden')
})

test('fallback link', async () => {
  cslData = await factory.build('cslData', { URL: null, DOI: 'doi' })
  entry = new BibliographyEntry(cslData)
  expect(entry.link).toEqual(`https://doi.org/${cslData.DOI}`)
})

test('year', async () => {
  expect(entry.year).toEqual(String(_.get(cslData, 'issued.date-parts.0.0')))
})

test('year range', async () => {
  cslData = await factory.build('cslData', { issued: {
    'date-parts': [
      [1800],
      [2900]
    ]
  } })
  entry = new BibliographyEntry(cslData)
  expect(entry.year).toEqual('1800–2900')
})

test('toHtml', () => {
  expect(entry.toHtml()).toEqual(cite.format('bibliography', {
    format: 'html',
    template: 'citation-apa',
    lang: 'de-DE'
  }))
})

test('toBibtex', () => {
  expect(entry.toBibtex()).toEqual(cite.get({
    format: 'string',
    type: 'string',
    style: 'bibtex'
  }))
})

test('toJson', () => {
  expect(entry.toJson()).toEqual(cslData)
})
