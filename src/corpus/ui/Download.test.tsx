import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describeDownloadLinks } from 'test-support/downloadLinks'
import Download from 'corpus/ui/Download'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'

const jsonUrl = 'JSON URL mock'
const atfUrl = 'ATF URL mock'

const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()

const MockTextService = TextService as jest.Mock<TextService>
const textServiceMock = new MockTextService()

let chapter: ChapterDisplay
let element: RenderResult

async function setup() {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)

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
