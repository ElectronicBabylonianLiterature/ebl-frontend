import React from 'react'
import { render, act, RenderResult } from '@testing-library/react'
import useObjectUrl from './common/useObjectUrl'

const objectUrl = 'object URL mock'
let data: Blob
let element: RenderResult

function ObjectUrlComponent({ data }: { data: Blob }): JSX.Element {
  const objectUrl = useObjectUrl(data)
  return <span>{objectUrl}</span>
}

beforeEach(async () => {
  (URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
  await act(async () => {
    element = render(<ObjectUrlComponent data={data} />)
  })
})

test('Returns the object URL', () => {
  expect(element.getByText(objectUrl)).toBeVisible()
})

test('Creates the object URL with data', () => {
  expect(URL.createObjectURL).toHaveBeenCalledWith(data)
})

test('Revokes object URL on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})
