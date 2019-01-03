import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'

import Lemmatizer from './Lemmatizer'
import { clickNth } from 'testHelpers'

let element
let fragmentService
let text

beforeEach(async () => {
  fragmentService = {
    updateLemmatizatio: jest.fn(),
    searchLemma: jest.fn()
  }
  fragmentService.updateLemmatizatio.mockReturnValue(Promise.resolve())
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([]))
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
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

it('Shows form when clicking a word', async () => {
  await clickNth(element, 'kur')
  expect(element.container).toHaveTextContent('Lemma')
})
