import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Folio from './Folio'

let folio
let conatiner
let element

afterEach(cleanup)

beforeEach(async () => {
  folio = [factory.chance('word')(), factory.chance('word')()]
  element = render(<Folio folio={folio} />)
  conatiner = element.container
})

it(`Renders folio entries`, () => {
  for (let item of folio) {
    expect(conatiner).toHaveTextContent(item)
  }
})
