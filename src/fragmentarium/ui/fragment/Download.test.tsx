import React from 'react'
import { render, screen, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describeDownloadLinks } from 'test-support/downloadLinks'
import Download from 'fragmentarium/ui/fragment/Download'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { wordExport } from 'fragmentarium/ui/fragment/WordExport'
import { Document } from 'docx'
import { saveAs } from 'file-saver'

const mockWordExport: jest.MockedFunction<typeof wordExport> = jest.fn()
jest.mock('fragmentarium/ui/fragment/WordExport', () => ({
  wordExport: (...args: Parameters<typeof wordExport>) =>
    mockWordExport(...args),
}))
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))
jest.mock('fragmentarium/application/FragmentService')

const atfUrl = 'ATF URL mock'
const jsonUrl = 'JSON URL mock'
const teiUrl = 'TEI URL mock'
const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()
let fragmentServiceMock: jest.Mocked<FragmentService>
let fragment: Fragment
let element: RenderResult

const setup = async () => {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(teiUrl)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)

  fragment = fragmentFactory.build()
  fragmentServiceMock = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentServiceMock.findPhoto.mockReturnValue(Promise.resolve(new Blob()))

  element = render(
    <Download
      fragment={fragment}
      wordService={wordServiceMock}
      fragmentService={fragmentServiceMock}
    />,
  )
  await userEvent.click(screen.getByRole('button'))
}

describeDownloadLinks(
  [
    ['Download as ATF', 'atf', atfUrl],
    ['Download as JSON File', 'json', jsonUrl],
    ['Download as TEI XML File', 'xml', teiUrl],
  ],
  setup,
  () => fragment.number,
)

test('Revoke object URLs on unmount', async () => {
  await setup()
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(teiUrl)
})

test('Exports the fragment as a Word document', async () => {
  mockWordExport.mockResolvedValueOnce(new Document())
  await setup()
  await userEvent.click(screen.getByText('Download as Word'))

  await waitFor(() =>
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      `${fragment.number}.docx`,
    ),
  )
  expect(mockWordExport).toHaveBeenCalledWith(
    fragment,
    wordServiceMock,
    expect.anything(),
  )
})
