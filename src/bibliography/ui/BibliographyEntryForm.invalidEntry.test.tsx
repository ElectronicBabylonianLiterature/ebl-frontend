import React from 'react'
import { render, screen } from '@testing-library/react'
import BibliographyEntryForm from 'bibliography/ui/BibliographyEntryForm'
import {
  advancePastTheDebounce,
  citeAsyncMock,
  dataField,
  parsedCitation,
  submitForm,
  typeIntoDataField,
  setUpFakeTimersAroundTests,
} from 'bibliography/ui/BibliographyEntryForm.testSupport'

jest.mock('citation-js')

setUpFakeTimersAroundTests()

test('A rejected parse marks the entry invalid and stops the spinner', async () => {
  citeAsyncMock().mockRejectedValue(new Error('unparsable input'))
  render(<BibliographyEntryForm onSubmit={jest.fn()} />)
  typeIntoDataField('not a citation')

  await advancePastTheDebounce()

  expect(dataField()).toHaveClass('is-invalid')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('A rejected parse clears any citation shown for an earlier entry', async () => {
  citeAsyncMock().mockResolvedValueOnce(
    parsedCitation('first', 'A rendered citation'),
  )
  render(<BibliographyEntryForm onSubmit={jest.fn()} />)
  typeIntoDataField('10.1000/valid')
  await advancePastTheDebounce()
  expect(screen.getByText('A rendered citation')).toBeVisible()

  citeAsyncMock().mockRejectedValueOnce(new Error('unparsable input'))
  typeIntoDataField('not a citation')
  await advancePastTheDebounce()

  expect(screen.queryByText('A rendered citation')).not.toBeInTheDocument()
  expect(dataField()).toHaveClass('is-invalid')
})

test('Removes short titles from DOI-imported journal articles', async () => {
  const onSubmit = jest.fn()
  citeAsyncMock().mockResolvedValueOnce(
    parsedCitation('article', 'Journal article', {
      id: 'article',
      type: 'article-journal',
      title: 'Article title',
      'container-title-short': 'Journal abbreviation',
      'title-short': 'Short title',
    }),
  )
  render(<BibliographyEntryForm onSubmit={onSubmit} />)
  typeIntoDataField('10.1000/example')

  await advancePastTheDebounce()
  submitForm()

  expect((dataField() as HTMLTextAreaElement).value).not.toContain(
    'container-title-short',
  )
  expect((dataField() as HTMLTextAreaElement).value).not.toContain(
    'title-short',
  )
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      shortContainerTitle: '',
      shortTitle: '',
    }),
  )
})

test('Preserves short titles for non-DOI input', async () => {
  const onSubmit = jest.fn()
  citeAsyncMock().mockResolvedValueOnce(
    parsedCitation('article', 'Journal article', {
      id: 'article',
      type: 'article-journal',
      title: 'Article title',
      'container-title-short': 'Journal abbreviation',
      'title-short': 'Short title',
    }),
  )
  render(<BibliographyEntryForm onSubmit={onSubmit} />)
  typeIntoDataField('{"type":"article-journal"}')

  await advancePastTheDebounce()
  submitForm()

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      shortContainerTitle: 'Journal abbreviation',
      shortTitle: 'Short title',
    }),
  )
})

test('Preserves short titles for other DOI-imported entry types', async () => {
  const onSubmit = jest.fn()
  citeAsyncMock().mockResolvedValueOnce(
    parsedCitation('book', 'Book', {
      id: 'book',
      type: 'book',
      'container-title-short': 'Series abbreviation',
      'title-short': 'Short title',
    }),
  )
  render(<BibliographyEntryForm onSubmit={onSubmit} />)
  typeIntoDataField('10.1000/example')

  await advancePastTheDebounce()
  submitForm()

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      shortContainerTitle: 'Series abbreviation',
      shortTitle: 'Short title',
    }),
  )
})

test('Submitting before anything has been parsed does not emit an entry', () => {
  const onSubmit = jest.fn()
  render(<BibliographyEntryForm onSubmit={onSubmit} />)

  submitForm()

  expect(onSubmit).not.toHaveBeenCalled()
})
