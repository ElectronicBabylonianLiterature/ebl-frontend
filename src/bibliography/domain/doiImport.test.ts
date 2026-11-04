import { CslData } from 'bibliography/domain/BibliographyEntry'
import { normalizeImportedCslData } from 'bibliography/domain/doiImport'

const journalArticle: CslData = {
  id: 'article',
  type: 'article-journal',
  title: 'Article title',
  'container-title-short': 'Journal abbreviation',
  'title-short': 'Short title',
}

const book: CslData = {
  id: 'book',
  type: 'book',
  title: 'Book title',
  'container-title-short': 'Series abbreviation',
  'title-short': 'Short title',
}

function citeOf(
  records: ReadonlyArray<CslData>,
  ...parseStepTypes: string[]
): { data: ReadonlyArray<CslData> } {
  const sharedParseGraph = parseStepTypes.map((type) => ({ type }))
  return {
    data: records.map((record) => ({ ...record, _graph: sharedParseGraph })),
  }
}

test('Removes the short titles from a journal article imported from a DOI', () => {
  const records = [journalArticle]

  expect(
    normalizeImportedCslData(citeOf(records, '@doi/id', '@doi/api'), records),
  ).toStrictEqual([
    { id: 'article', type: 'article-journal', title: 'Article title' },
  ])
})

test('Keeps the short titles of a DOI import that is not a journal article', () => {
  const records = [book]

  expect(
    normalizeImportedCslData(citeOf(records, '@doi/id', '@doi/api'), records),
  ).toStrictEqual(records)
})

test('Keeps the short titles of an authored journal article', () => {
  const records = [journalArticle]

  expect(
    normalizeImportedCslData(citeOf(records, '@csl/object'), records),
  ).toStrictEqual(records)
})

test('Keeps the short titles of a record without a parse history', () => {
  const records = [journalArticle]

  expect(normalizeImportedCslData({ data: records }, records)).toStrictEqual(
    records,
  )
})

test('Keeps the short titles of an authored article collected with a DOI', () => {
  const records = [{ ...journalArticle, id: 'authored' }, journalArticle]

  expect(
    normalizeImportedCslData(
      citeOf(records, '@doi/id', '@doi/api', '@csl/object'),
      records,
    ),
  ).toStrictEqual(records)
})
