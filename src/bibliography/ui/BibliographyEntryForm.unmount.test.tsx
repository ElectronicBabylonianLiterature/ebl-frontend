import React from 'react'
import { render } from '@testing-library/react'
import BibliographyEntryForm from 'bibliography/ui/BibliographyEntryForm'
import {
  advancePastTheDebounce,
  citeAsyncMock,
  parsedCitation,
  typeIntoDataField,
  setUpFakeTimersAroundTests,
} from 'bibliography/ui/BibliographyEntryForm.testSupport'

jest.mock('citation-js')

setUpFakeTimersAroundTests()

beforeEach(() => {
  citeAsyncMock().mockResolvedValue(parsedCitation('entry', ''))
})

test('A pending load runs when the form stays mounted', async () => {
  render(<BibliographyEntryForm onSubmit={jest.fn()} />)
  typeIntoDataField('10.1000/mounted')

  await advancePastTheDebounce()

  expect(citeAsyncMock()).toHaveBeenCalledWith('10.1000/mounted')
})

test('Unmounting cancels a load still inside the debounce window', async () => {
  const { unmount } = render(<BibliographyEntryForm onSubmit={jest.fn()} />)
  typeIntoDataField('10.1000/unmounted')

  unmount()
  await advancePastTheDebounce()

  expect(citeAsyncMock()).not.toHaveBeenCalled()
})
