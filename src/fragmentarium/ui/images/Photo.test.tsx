import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen } from '@testing-library/react'
import Photo from './Photo'
import { fragmentFactory } from 'test-support/fragment-fixtures'

const number = 'K 1'
const blob = new Blob([''], { type: 'image/jpeg' })
const objectUrl = 'object URL mock'

global.ResizeObserver = ResizeObserver

beforeEach(() => {
  const fragment = fragmentFactory.build({ number })
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  render(<Photo photo={blob} fragment={fragment} />)
})

it('Has alt text', async () => {
  expect(await screen.findByRole('img')).toHaveAttribute(
    'alt',
    `Fragment ${number}`
  )
})

it('Has a link to the copyright page', async () => {
  const link = await screen.findByRole('link', {
    name: /The Trustees of the British Museum/i,
  })
  expect(link).toHaveAttribute(
    'href',
    'https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx'
  )
})

it('Has copyright', async () => {
  expect(await screen.findByText(/The Trustees/)).toHaveTextContent(
    'The Trustees of the British Museum'
  )
})
