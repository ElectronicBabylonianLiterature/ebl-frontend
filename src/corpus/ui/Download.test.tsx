import React from 'react'
import {
  render,
  act,
  screen,
  fireEvent,
  RenderResult,
} from '@testing-library/react'
import Download from 'corpus/ui/Download'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import WordService from 'dictionary/application/WordService'

const jsonUrl = 'JSON URL mock'
const atfUrl = 'ATF URL mock'
const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()
let chapter: ChapterDisplay
let element: RenderResult

beforeEach(async () => {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)

  chapter = chapterDisplayFactory.build()
  await act(async () => {
    element = render(
      <Download chapter={chapter} wordService={wordServiceMock} />
    )
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button'))
  })
})

describe.each([
  ['Download as JSON File', 'json', jsonUrl],
  ['Download as ATF', 'atf', atfUrl],
])('%s download link', (name, type, url) => {
  test('href', () => {
    expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
      'href',
      url
    )
  })

  test('download', () => {
    expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
      'download',
      `${chapter.uniqueIdentifier}.${type}`
    )
  })
})

test('Revoke object URLs on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
})
