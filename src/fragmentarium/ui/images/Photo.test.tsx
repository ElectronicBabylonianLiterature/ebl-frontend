import React from 'react'
import { render, screen } from '@testing-library/react'
import { factory } from 'factory-girl'
import PhotoImage from './Photo'

const number = 'K 1'
const blob = new Blob([''], { type: 'image/jpeg' })
const objectUrl = 'object URL mock'

beforeEach(async () => {
  const fragment = await factory.build('fragment', { number })
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  render(<PhotoImage photo={blob} fragment={fragment} />)
})

it('Has alt text', async () => {
  expect(await screen.findByRole('img')).toHaveAttribute(
    'alt',
    `A photo of the fragment ${number}`
  )
})

it('Has a link to the image', async () => {
  expect((await screen.findAllByRole('link'))[0]).toHaveAttribute(
    'href',
    objectUrl
  )
})

it('Has copyright', async () => {
  expect(await screen.findByText(/Courtesy of/)).toHaveTextContent(
    'Courtesy of the Trustees of The British Museum'
  )
})
