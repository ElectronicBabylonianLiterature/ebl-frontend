import React from 'react'
import { render, act, RenderResult, fireEvent } from '@testing-library/react'
import factory from 'factory-girl'
import Download from './Download'
import { Fragment } from 'fragmentarium/domain/fragment'

const jsonUrl = 'JSON URL mock'
const atfUrl = 'ATF URL mock'
let fragment: Fragment
let element: RenderResult

beforeEach(async () => {
  ;(URL.createObjectURL as jest.Mock)
    .mockReturnValueOnce(jsonUrl)
    .mockReturnValueOnce(atfUrl)
  fragment = await factory.build('fragment')
  await act(async () => {
    element = render(<Download fragment={fragment} />)
  })
  await act(async () => {
    fireEvent.click(element.getByRole('button'))
  })
})

describe.each([
  ['atf', atfUrl],
  ['json', jsonUrl],
])('%s download link', (type, url) => {
  test('href', () => {
    expect(element.getByTestId(`download-${type}`)).toHaveAttribute('href', url)
  })

  test('download', () => {
    expect(element.getByTestId(`download-${type}`)).toHaveAttribute(
      'download',
      `${fragment.number}.${type}`
    )
  })
})

test('Revoke object URLs on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(jsonUrl)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(atfUrl)
})
