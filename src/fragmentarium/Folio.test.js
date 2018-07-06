import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Folio from './Folio'

let container

afterEach(cleanup)

describe('Folios', () => {
  let folio

  beforeEach(async () => {
    folio = [factory.chance('word')(), factory.chance('word')()]
    container = render(<Folio folio={folio} />).container
  })

  it(`Renders folio entries`, () => {
    for (let item of folio) {
      expect(container).toHaveTextContent(item)
    }
  })
})

describe('No folios', () => {
  beforeEach(async () => {
    container = render(<Folio folio={[]} />).container
  })

  it(`Renders no folios test`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})
