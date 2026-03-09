import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import useObjectUrl from './common/useObjectUrl'

const objectUrl = 'object URL mock'
let data: Blob
let element: RenderResult

function ObjectUrlComponent({ data }: { data: Blob }): JSX.Element {
  const objectUrl = useObjectUrl(data)
  return <span>{objectUrl}</span>
}

function setup(): void {
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
  element = render(<ObjectUrlComponent data={data} />)
}

test('Returns the object URL', () => {
  setup()
  expect(screen.getByText(objectUrl)).toBeVisible()
})

test('Creates the object URL with data', () => {
  setup()
  expect(URL.createObjectURL).toHaveBeenCalledWith(data)
})

test('Revokes object URL on unmount', () => {
  setup()
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})
