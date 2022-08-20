import React from 'react'
import { render, screen } from '@testing-library/react'
import WordDownloadButton from 'common/WordDownloadButton'
import { CorpusWordExportContext } from 'corpus/ui/Download'

jest.mock('corpus/ui/Download')
const contextMocked = CorpusWordExportContext as jest.Mock<
  jest.Mocked<CorpusWordExportContext>
>
const children = <span>Download as Word</span>
render(
  <WordDownloadButton
    context={new contextMocked()}
    baseFileName={'filename'}
    getWordDoc={jest.fn()}
  >
    {children}
  </WordDownloadButton>
)

it('Shows children', () => {
  expect(screen.getByText('Download as Word')).toBeInTheDocument()
})
