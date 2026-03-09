import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WordDownloadButton from 'common/WordDownloadButton'
import { CorpusWordExportContext } from 'corpus/ui/Download'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { Document } from 'docx'

jest.mock('corpus/ui/Download')

const contextMocked = CorpusWordExportContext as jest.Mock<
  jest.Mocked<CorpusWordExportContext>
>
const getWordDoc = jest.fn()
const children = <span>Download as Word</span>

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
