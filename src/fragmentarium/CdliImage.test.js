import React from 'react'
import {render, cleanup} from 'react-testing-library'
import CdliImage from './CdliImage'

afterEach(cleanup)

describe('CDLI number provided', () => {
  const cdliNumber = 'P000000'
  let container

  beforeEach(() => {
    container = render(<CdliImage cdliNumber={cdliNumber} />).container
  })

  it('Displays the image from CDLI', async () => {
    expect(container.querySelector('img'))
      .toHaveAttribute('src', `https://cdli.ucla.edu/dl/photo/${cdliNumber}.jpg`)
  })

  it('Has the image filename as alt text', async () => {
    expect(container.querySelector('img')).toHaveAttribute('alt', `${cdliNumber}.jpg`)
  })
})

it('Displays nothing if no CLDI number provided', async () => {
  const {container} = render(<CdliImage cdliNumber={null} />)

  expect(container.innerHTML).toEqual('')
})
