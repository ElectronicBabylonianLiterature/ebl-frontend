import React from 'react'
import _ from 'lodash'
import { render } from '@testing-library/react'
import BibliographyEntryForm from 'bibliography/ui/BibliographyEntryForm'
import { CslData } from 'bibliography/domain/BibliographyEntry'
import {
  advancePastTheDebounce,
  citeAsyncMock,
  parsedCitation,
  submitForm,
  typeIntoDataField,
  setUpFakeTimersAroundTests,
} from 'bibliography/ui/BibliographyEntryForm.testSupport'

jest.mock('citation-js')

setUpFakeTimersAroundTests()

const journalArticle: CslData = {
  id: 'article',
  type: 'article-journal',
  title: 'Article title',
  DOI: '10.1000/example',
  'container-title': 'Journal',
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

const doiParseSteps = ['@doi/id', '@doi/api', '@csl/object']
const authoredParseSteps = ['@csl/object', '@csl/list+object']

async function submitInput(
  input: string,
  data: CslData,
  parseSteps: ReadonlyArray<string>,
): Promise<CslData> {
  const onSubmit = jest.fn()
  citeAsyncMock().mockResolvedValueOnce(
    parsedCitation(data.id, 'Entry', data, parseSteps),
  )
  render(<BibliographyEntryForm onSubmit={onSubmit} />)
  typeIntoDataField(input)
  await advancePastTheDebounce()
  submitForm()
  expect(onSubmit).toHaveBeenCalledTimes(1)
  return onSubmit.mock.calls[0][0].toCslData()
}

const journalArticleWithoutShortTitles = _.omit(journalArticle, [
  'container-title-short',
  'title-short',
])

test.each([
  ['a bare DOI', '10.1000/example'],
  ['a DOI URL', 'https://doi.org/10.1000/example'],
  ['a single-DOI JSON array', '["10.1000/example"]'],
])(
  'Removes short titles from journal articles imported from %s',
  async (_, input) => {
    const submitted = await submitInput(input, journalArticle, doiParseSteps)

    expect(submitted).toEqual(journalArticleWithoutShortTitles)
    expect(submitted).not.toHaveProperty('container-title-short')
    expect(submitted).not.toHaveProperty('title-short')
  },
)

test.each([
  ['CSL-JSON with a DOI property', JSON.stringify(journalArticle)],
  ['a CSL-JSON array', JSON.stringify([journalArticle])],
  ['BibTeX', '@article{key, doi = {10.1000/example}}'],
])(
  'Preserves short titles for journal articles authored as %s',
  async (_, input) => {
    expect(
      await submitInput(input, journalArticle, authoredParseSteps),
    ).toEqual(journalArticle)
  },
)

test('Preserves short titles for DOI-imported entries that are not journal articles', async () => {
  expect(await submitInput('10.1000/example', book, doiParseSteps)).toEqual(
    book,
  )
})
