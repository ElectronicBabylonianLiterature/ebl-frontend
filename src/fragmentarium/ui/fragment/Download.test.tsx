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

const atfUrl = 'ATF URL mock'
const jsonUrl = 'JSON URL mock'
const teiUrl = 'TEI URL mock'
const MockWordService = WordService as jest.Mock<WordService>
const wordServiceMock = new MockWordService()
let fragment: Fragment
let element: RenderResult

beforeEach(async () => {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(teiUrl)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)

  fragment = fragmentFactory.build()
  await act(async () => {
    element = render(
      <Download fragment={fragment} wordService={wordServiceMock} />
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
      `${fragment.number}.${type}`
    )
  })
})

test('Revoke object URLs on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(teiUrl)
})
