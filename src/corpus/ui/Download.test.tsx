import React from 'react'
import { render, screen, fireEvent, RenderResult } from '@testing-library/react'
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
  fireEvent.click(screen.getByRole('button'))
}

describe.each([
  ['Download as JSON File', 'json', jsonUrl],
  ['Download as ATF', 'atf', atfUrl],
])('%s download link', (name: string, type: string, url: string) => {
  test('href', async () => {
    await setup()
    expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
      'href',
      url,
    )
  })

  test('download', async () => {
    await setup()
    expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
      'download',
      `${chapter.uniqueIdentifier}.${type}`,
    )
  })
})

test('Revoke object URLs on unmount', async () => {
  await setup()
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
})
