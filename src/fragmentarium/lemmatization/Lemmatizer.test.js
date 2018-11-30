import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'

import Lemmatizer from './Lemmatizer'
import { clickNth } from 'testHelpers'

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
  lemmatization = [[
    {
      'value': '1.',
      'uniqueLemma': []
    },
    {
      'value': 'kur',
      'uniqueLemma': ['aklu I']
    }
  ]]
  element = render(
    <Lemmatizer
      fragmentService={fragmentService}
      number='K.1'
      lemmatization={lemmatization}
    />)
})

it('Displays the transliteration', () => {
  expect(element.container).toHaveTextContent(lemmatization.map(row =>
    row.map(token => token.value).join(' ')
  ).join('\n'))
})

it('Shows form when clicking a word', async () => {
  await clickNth(element, 'kur')
  expect(element.container).toHaveTextContent('Lemma')
})
