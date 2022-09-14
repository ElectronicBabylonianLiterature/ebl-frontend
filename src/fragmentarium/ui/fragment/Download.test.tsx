import React from 'react'
import {
  render,
  act,
  screen,
  fireEvent,
  RenderResult,
} from '@testing-library/react'
import Download from 'fragmentarium/ui/fragment/Download'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import Promise from 'bluebird'

jest.mock('fragmentarium/application/FragmentService')

const atfUrl = 'ATF URL mock'
const jsonUrl = 'JSON URL mock'
const teiUrl = 'TEI URL mock'
const photoUrl = 'Photo URL mock'
const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()
let fragmentServiceMock: jest.Mocked<FragmentService>
let fragment: Fragment
let element: RenderResult

beforeEach(async () => {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(teiUrl)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)
    .mockReturnValueOnce(photoUrl)

  fragment = fragmentFactory.build()
  fragmentServiceMock = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentServiceMock.findPhoto.mockReturnValue(Promise.resolve(new Blob()))

  await act(async () => {
    element = render(
      <Download
        fragment={fragment}
        wordService={wordServiceMock}
        fragmentService={fragmentServiceMock}
      />
    )
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button'))
  })
})

describe.each([
  ['Download as ATF', 'atf', atfUrl],
  ['Download as JSON File', 'json', jsonUrl],
  ['Download as TEI XML File', 'xml', teiUrl],
  ['Download Photo', 'jpg', photoUrl],
])('%s download link', (name: string, type: string, url: string) => {
  test('href', () => {
    if (type !== 'jpg' || fragment.hasPhoto) {
      expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
        'href',
        url
      )
    }
  })

  test('download', () => {
    if (type !== 'jpg' || fragment.hasPhoto) {
      expect(screen.getByRole('link', { name: `${name}` })).toHaveAttribute(
        'download',
        `${fragment.number}.${type}`
      )
    }
  })
})

test('Revoke object URLs on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(teiUrl)
  if (fragment.hasPhoto) {
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(photoUrl)
  }
})
