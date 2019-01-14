import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'

import { whenClicked } from 'testHelpers'
import Lemmatizer from './Lemmatizer'
import Lemmatization from './Lemmatization'

const number = 'K.1'
let element
let fragmentService
let text

beforeEach(async () => {
  fragmentService = {
    updateLemmatization: jest.fn(),
    searchLemma: jest.fn()
  }
  fragmentService.updateLemmatization.mockReturnValue(Promise.resolve())
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([]))
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: number,
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: ['aklu I'],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  element = render(
    <Lemmatizer
      fragmentService={fragmentService}
      number='K.1'
      text={text}
    />)
})

it('Displays the line prefixes', () => {
  text.lines.forEach(row =>
    expect(element.container).toHaveTextContent(row.prefix)
  )
})

it('Displays the transliteration', () => {
  text.lines.forEach(row =>
    expect(element.container).toHaveTextContent(
      row.content.map(token => token.value).join(' ')
    )
  )
})

it('Clicking save calls frgamentService', async () => {
  await whenClicked(element, 'Save').expect(fragmentService.updateLemmatization)
    .toHaveBeenCalledWith(number, new Lemmatization(text).toDto())
})
