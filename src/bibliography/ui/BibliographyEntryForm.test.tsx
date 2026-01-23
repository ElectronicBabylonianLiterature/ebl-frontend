import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { changeValueByLabel, clickNth } from 'test-support/utils'
import BibliographyEntryForm from './BibliographyEntryForm'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

let mockJson: string
let mockEntry: BibliographyEntry
let onSubmitMock: jest.Mock

beforeEach(() => {
  mockEntry = bibliographyEntryFactory.build()
  mockJson = JSON.stringify(mockEntry.toCslData(), null, 2)
  onSubmitMock = jest.fn()
})

const waitForSaveButtonToBeEnabled = async () => {
  await waitFor(
    () => expect(screen.getByRole('button', { name: /Save/i })).toBeEnabled(),
    { timeout: 1000 }
  )
}

test('Form updates and submits entry with correct data', async () => {
  render(<BibliographyEntryForm onSubmit={onSubmitMock} />)
  changeValueByLabel(screen, 'Data', mockJson)
  await screen.findByText(new RegExp(`\\(${mockEntry.year}\\)`))
  clickNth(screen, 'Save', 0)

  expect(onSubmitMock).toHaveBeenCalledWith(mockEntry)
})

test('Displays CSL-JSON input correctly', async () => {
  render(<BibliographyEntryForm value={mockEntry} onSubmit={onSubmitMock} />)
  const textarea = screen.getByLabelText('Data') as HTMLTextAreaElement
  await waitFor(() => {
    expect(textarea.value.replace(/\s/g, '')).toContain(
      JSON.stringify(mockEntry.toCslData()).replace(/\s/g, '')
    )
  })
})

test('Applies custom ID when no ID exists', async () => {
  const entryWithoutId = bibliographyEntryFactory.build({
    toCslData: () => ({ ...mockEntry.toCslData(), id: undefined }),
  })
  const jsonWithoutId = JSON.stringify(entryWithoutId.toCslData(), null, 2)

  render(<BibliographyEntryForm onSubmit={onSubmitMock} />)
  changeValueByLabel(screen, 'Data', jsonWithoutId)

  await waitForSaveButtonToBeEnabled()

  clickNth(screen, 'Save', 0)

  await waitFor(() => {
    expect(onSubmitMock).toHaveBeenCalled()

    const submittedEntry = onSubmitMock.mock.calls[0][0]

    expect(submittedEntry.id).not.toBeUndefined()
    expect(submittedEntry.id).not.toMatch(/^temp_id/)
  })
})

test('Preserves existing ID', async () => {
  const entryWithValidId = bibliographyEntryFactory.build({
    toCslData: () => ({ ...mockEntry.toCslData(), id: 'validId123' }),
  })
  const jsonWithValidId = JSON.stringify(entryWithValidId.toCslData(), null, 2)

  render(<BibliographyEntryForm onSubmit={onSubmitMock} />)
  changeValueByLabel(screen, 'Data', jsonWithValidId)

  await waitForSaveButtonToBeEnabled()

  clickNth(screen, 'Save', 0)

  await waitFor(() => {
    expect(onSubmitMock).toHaveBeenCalled()

    const submittedEntry = onSubmitMock.mock.calls[0][0]

    expect(submittedEntry.id).toEqual('validId123')
  })
})

test('Preserves temp_id when editing existing entry', async () => {
  const entryWithTempId = bibliographyEntryFactory.build({
    toCslData: () => ({ ...mockEntry.toCslData(), id: 'temp_id_12345' }),
  })
  const jsonWithTempId = JSON.stringify(entryWithTempId.toCslData(), null, 2)

  render(
    <BibliographyEntryForm value={entryWithTempId} onSubmit={onSubmitMock} />
  )
  changeValueByLabel(screen, 'Data', jsonWithTempId)

  await waitForSaveButtonToBeEnabled()

  clickNth(screen, 'Save', 0)

  await waitFor(() => {
    expect(onSubmitMock).toHaveBeenCalled()

    const submittedEntry = onSubmitMock.mock.calls[0][0]

    expect(submittedEntry.id).toEqual('temp_id_12345')
  })
})

test('Replaces temp_id with generated ID when creating new entry', async () => {
  const entryWithTempId = bibliographyEntryFactory.build({
    toCslData: () => ({ ...mockEntry.toCslData(), id: 'temp_id_99999' }),
  })
  const jsonWithTempId = JSON.stringify(entryWithTempId.toCslData(), null, 2)

  render(<BibliographyEntryForm onSubmit={onSubmitMock} />)
  changeValueByLabel(screen, 'Data', jsonWithTempId)

  await waitForSaveButtonToBeEnabled()

  clickNth(screen, 'Save', 0)

  await waitFor(() => {
    expect(onSubmitMock).toHaveBeenCalled()

    const submittedEntry = onSubmitMock.mock.calls[0][0]

    expect(submittedEntry.id).not.toEqual('temp_id_99999')
    expect(submittedEntry.id).not.toMatch(/^temp_id/)
    expect(submittedEntry.id).toBeDefined()
  })
})
