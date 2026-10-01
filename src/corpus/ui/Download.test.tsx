import React from 'react'
import { render, screen, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describeDownloadLinks } from 'test-support/downloadLinks'
import Download from 'corpus/ui/Download'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import { wordExport } from 'corpus/ui/WordExport'
import { Document } from 'docx'
import { saveAs } from 'file-saver'

const mockWordExport: jest.MockedFunction<typeof wordExport> = jest.fn()
jest.mock('corpus/ui/WordExport', () => ({
  wordExport: (...args: Parameters<typeof wordExport>) =>
    mockWordExport(...args),
}))
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const createObjectURL: jest.MockedFunction<typeof URL.createObjectURL> =
  jest.fn()
URL.createObjectURL = createObjectURL

const jsonUrl = 'JSON URL mock'
const atfUrl = 'ATF URL mock'

const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()

const MockTextService = TextService as jest.Mock<TextService>
const textServiceMock = new MockTextService()

let chapter: ChapterDisplay
let element: RenderResult

async function setup() {
  createObjectURL.mockReturnValueOnce(jsonUrl).mockReturnValueOnce(atfUrl)

  chapter = chapterDisplayFactory.build()
  element = render(
    <Download
      chapter={chapter}
      wordService={wordServiceMock}
      textService={textServiceMock}
    />,
  )
  await userEvent.click(screen.getByRole('button'))
}

describeDownloadLinks(
  [
    ['Download as JSON File', 'json', jsonUrl],
    ['Download as ATF', 'atf', atfUrl],
  ],
  setup,
  () => chapter.uniqueIdentifier,
)

test('Revoke object URLs on unmount', async () => {
  await setup()
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
})

test('Exports the chapter as a Word document', async () => {
  mockWordExport.mockResolvedValueOnce(new Document())
  await setup()
  await userEvent.click(screen.getByText('Download as Word'))

  await waitFor(() =>
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      `${chapter.uniqueIdentifier}.docx`,
    ),
  )
  expect(mockWordExport).toHaveBeenCalledWith(
    chapter,
    expect.objectContaining({
      wordService: wordServiceMock,
      textService: textServiceMock,
    }),
    expect.anything(),
  )
})
