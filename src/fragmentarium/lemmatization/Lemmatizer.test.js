import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'

import Lemmatizer from './Lemmatizer'

let element
let fragmentService
let lemmatization

beforeEach(async () => {
  fragmentService = {
    updateLemmatizatio: jest.fn(),
    searchLemma: jest.fn()
  }
  fragmentService.updateLemmatizatio.mockReturnValue(Promise.resolve())
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([]))
  lemmatization = []
  element = render(
    <Lemmatizer
      fragmentService={fragmentService}
      number='K.1'
      lemmatization={lemmatization}
    />)
})

it('Displays the transliteration', () => {
  expect(element.container).toHaveTextContent(lemmatization.map(row => row.join(' ')).join('\n'))
})
