import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WordDownloadButton from 'common/ui/WordDownloadButton'
import { CorpusWordExportContext } from 'corpus/ui/Download'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { Document } from 'docx'
import { saveAs } from 'file-saver'

jest.mock('corpus/ui/Download')
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const contextMocked = CorpusWordExportContext as jest.Mock<
  jest.Mocked<CorpusWordExportContext>
>
const getWordDoc = jest.fn()
const children = <span>Download as Word</span>

beforeEach(() => {
  ;(saveAs as jest.Mock).mockClear()
  getWordDoc.mockReset()
})

async function setup() {
  render(
    <WordDownloadButton
      context={new contextMocked()}
      baseFileName={'filename'}
      getWordDoc={getWordDoc}
    >
      {children}
    </WordDownloadButton>,
  )
  const docxPromise = Promise.resolve(new Document())
  getWordDoc.mockImplementationOnce(() => docxPromise)
  fireEvent.click(screen.getByRole('button'))
  await waitForSpinnerToBeRemoved(screen)
}

it('Shows children', async () => {
  await setup()
  expect(screen.getByText('Download as Word')).toBeInTheDocument()
})

it('Calls get method', async () => {
  await setup()
  expect(getWordDoc).toHaveBeenCalled()
})

it('Saves the generated document', async () => {
  await setup()
  expect(saveAs).toHaveBeenCalledTimes(1)
})

it('Does not save the document when the component unmounts first', async () => {
  let resolveDoc: (doc: Document) => void = () => undefined
  getWordDoc.mockImplementationOnce(
    () =>
      new Promise<Document>((resolve) => {
        resolveDoc = resolve
      }),
  )
  const { unmount } = render(
    <WordDownloadButton
      context={new contextMocked()}
      baseFileName={'filename'}
      getWordDoc={getWordDoc}
    >
      {children}
    </WordDownloadButton>,
  )
  fireEvent.click(screen.getByRole('button'))
  unmount()
  resolveDoc(new Document())
  await waitFor(() => expect(getWordDoc).toHaveBeenCalled())

  expect(saveAs).not.toHaveBeenCalled()
})

it('Ignores a generation failure after the component unmounts', async () => {
  let rejectDoc: (error: Error) => void = () => undefined
  const pending = new Promise<Document>((_resolve, reject) => {
    rejectDoc = reject
  })
  getWordDoc.mockImplementationOnce(() => pending)
  const { unmount } = render(
    <WordDownloadButton
      context={new contextMocked()}
      baseFileName={'filename'}
      getWordDoc={getWordDoc}
    >
      {children}
    </WordDownloadButton>,
  )
  fireEvent.click(screen.getByRole('button'))
  unmount()
  rejectDoc(new Error('Generation failed'))

  await expect(pending).rejects.toThrow('Generation failed')
  expect(screen.queryByText('Generation failed')).not.toBeInTheDocument()
})

it('Shows an error and stops loading when the document cannot be generated', async () => {
  render(
    <WordDownloadButton
      context={new contextMocked()}
      baseFileName={'filename'}
      getWordDoc={getWordDoc}
    >
      {children}
    </WordDownloadButton>,
  )
  getWordDoc.mockImplementationOnce(() =>
    Promise.reject(new Error('Generation failed')),
  )
  fireEvent.click(screen.getByRole('button'))

  expect(await screen.findByText('Generation failed')).toBeInTheDocument()
  expect(screen.getByText('Download as Word')).toBeInTheDocument()
})
