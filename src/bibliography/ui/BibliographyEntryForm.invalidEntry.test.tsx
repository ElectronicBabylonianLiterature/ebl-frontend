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

test('Submitting before anything has been parsed does not emit an entry', () => {
  const onSubmit = jest.fn()
  render(<BibliographyEntryForm onSubmit={onSubmit} />)

  submitForm()

  expect(onSubmit).not.toHaveBeenCalled()
})
