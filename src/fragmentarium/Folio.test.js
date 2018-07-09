import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Folio from './Folio'

let container
let folio

afterEach(cleanup)

describe('Folios', () => {
  beforeEach(async () => {
    folio = await factory.buildMany('folio', 3)
    container = render(<Folio folio={folio} />).container
  })

  it(`Renders folio numbers entries`, () => {
    for (let item of folio) {
      expect(container).toHaveTextContent(item.number)
    }
  })
})

const names = [
  {name: 'WGL', displayName: 'Lambert'},
  {name: 'FWG', displayName: 'Geers'},
  {name: 'EL', displayName: 'Leichty'}
]

names.forEach(entry => {
  describe('Lambert Folios', () => {
    beforeEach(async () => {
      folio = [await factory.build('folio', {name: entry.name})]
      container = render(<Folio folio={folio} />).container
    })

    it(`Renders folio numbers entries`, () => {
      for (let item of folio) {
        expect(container).toHaveTextContent(`${entry.displayName} Folio ${item.number}`)
      }
    })
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
