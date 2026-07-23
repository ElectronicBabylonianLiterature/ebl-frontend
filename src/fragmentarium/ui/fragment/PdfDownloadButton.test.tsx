import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PdfDownloadButton from 'fragmentarium/ui/fragment/PdfDownloadButton'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { pdfExport } from './PdfExport'

jest.mock('./PdfExport')
jest.mock('dictionary/application/WordService')

const pdfExportMock = pdfExport as jest.Mock
const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordService = new MockWordService()
const fragment = fragmentFactory.build()
const children = <span>Download as PDF</span>
const save = jest.fn()

function renderButton(): void {
  render(
    <PdfDownloadButton fragment={fragment} wordService={wordService}>
      {children}
    </PdfDownloadButton>,
  )
}

beforeEach(() => {
  save.mockClear()
  pdfExportMock.mockReset()
})

it('Shows children', () => {
  renderButton()
  expect(screen.getByText('Download as PDF')).toBeInTheDocument()
})

it('Saves the generated document', async () => {
  pdfExportMock.mockResolvedValue({ save })
  renderButton()
  fireEvent.click(screen.getByText('Download as PDF'))
  await waitForSpinnerToBeRemoved(screen)

  expect(pdfExportMock).toHaveBeenCalledWith(
    fragment,
    wordService,
    expect.anything(),
  )
  expect(save).toHaveBeenCalledWith(`${fragment.number}.pdf`)
})

it('Does not save the document when the component unmounts first', async () => {
  let resolveExport: (doc: unknown) => void = () => undefined
  pdfExportMock.mockReturnValue(
    new Promise((resolve) => {
      resolveExport = resolve
    }),
  )
  const { unmount } = render(
    <PdfDownloadButton fragment={fragment} wordService={wordService}>
      {children}
    </PdfDownloadButton>,
  )
  fireEvent.click(screen.getByText('Download as PDF'))
  unmount()
  resolveExport({ save })
  await waitFor(() => expect(pdfExportMock).toHaveBeenCalled())

  expect(save).not.toHaveBeenCalled()
})

it('Ignores a generation failure after the component unmounts', async () => {
  let rejectExport: (error: Error) => void = () => undefined
  const pending = new Promise((_resolve, reject) => {
    rejectExport = reject
  })
  pdfExportMock.mockReturnValue(pending)
  const { unmount } = render(
    <PdfDownloadButton fragment={fragment} wordService={wordService}>
      {children}
    </PdfDownloadButton>,
  )
  fireEvent.click(screen.getByText('Download as PDF'))
  unmount()
  rejectExport(new Error('Generation failed'))

  await expect(pending).rejects.toThrow('Generation failed')
  expect(screen.queryByText('Generation failed')).not.toBeInTheDocument()
})

it('Shows an error and stops loading when the document cannot be generated', async () => {
  pdfExportMock.mockRejectedValue(new Error('Generation failed'))
  renderButton()
  fireEvent.click(screen.getByText('Download as PDF'))

  expect(await screen.findByText('Generation failed')).toBeInTheDocument()
  expect(screen.getByText('Download as PDF')).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
})
