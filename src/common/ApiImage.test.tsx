import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import ApiImage from './ApiImage'

let element
const fileName = 'Babel_Project_01_cropped.svg'

beforeEach(async () => {
  element = render(<ApiImage fileName={fileName} />)
  await waitForElement(() => element.getByAltText(fileName))
})

it('Has the API URL as src', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'src',
    `http://example.com/images/${fileName}`
  )
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'alt',
    fileName
  )
})
