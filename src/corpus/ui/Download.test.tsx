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

const jsonUrl = 'JSON URL mock'
let chapter: ChapterDisplay
let element: RenderResult

beforeEach(async () => {
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(jsonUrl)

  chapter = chapterDisplayFactory.build()
  await act(async () => {
    element = render(<Download chapter={chapter} />)
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button'))
  })
})

describe.each([['Download as JSON File', 'json', jsonUrl]])(
  '%s download link',
  (name, type, url) => {
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
  }
)

test('Revoke object URLs on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
})
