import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import PhotoImage from './Photo'

const number = 'K 1'
const blob = new Blob([''], { type: 'image/jpeg' })
const objectUrl = 'object URL mock'
let fragment
let element

beforeEach(async () => {
  fragment = await factory.build('fragment', { number });
  (URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  element = render(<PhotoImage photo={blob} fragment={fragment} />)
  await waitForElement(() => element.container.querySelector('img'))
})

it('Has alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'alt',
    `A photo of the fragment ${number}`
  )
})

it('Has a link to the image', () => {
  expect(element.container.querySelector('a')).toHaveAttribute(
    'href',
    objectUrl
  )
})

it('Has copyright', () => {
  expect(element.container).toHaveTextContent(
    'Courtesy of the Trustees of The British Museum'
  )
})
