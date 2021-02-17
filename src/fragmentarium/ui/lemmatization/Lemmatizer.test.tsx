import React from 'react'
import { render } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { whenClicked, clickNth } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatizer from './Lemmatizer'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { lemmatizeWord } from 'test-support/lemmatization'

let element
let fragmentService
let updateLemmatization
let text
let word
let oldWord
let lemma

beforeEach(async () => {
  word = await factory.build('word')
  lemma = new Lemma(word)
  oldWord = await factory.build('word')
  updateLemmatization = jest.fn()
  fragmentService = {
    searchLemma: jest.fn(),
    createLemmatization: jest.fn(),
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
  text = new Text({
    lines: [
      new TextLine({
        type: 'TextLine',
        prefix: '1.',
        lineNumber: {
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
          type: 'LineNumber',
        },
        content: [
          {
            uniqueLemma: [oldWord._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            alignable: true,
            enclosureType: [],
            erasure: 'NONE',
            cleanValue: 'kur',
            value: 'kur',
            alignment: null,
            variant: null,
            parts: [
              {
                enclosureType: [],
                cleanValue: 'kur',
                value: 'kur',
                name: 'kur',
                nameParts: [
                  {
                    enclosureType: [],
                    cleanValue: 'kur',
                    value: 'kur',
                    type: 'ValueToken',
                  },
                ],
                subIndex: 1,
                modifiers: [],
                flags: [],
                sign: null,
                type: 'Reading',
              },
            ],
            type: 'Word',
          },
        ],
      }),
    ],
  })
  fragmentService.createLemmatization.mockImplementation((text) =>
    Promise.resolve(
      new Lemmatization(
        ['1.'],
        [[new LemmatizationToken('kur', true, [new Lemma(oldWord)], [])]]
      )
    )
  )
  element = render(
    <Lemmatizer
      fragmentService={fragmentService}
      updateLemmatization={updateLemmatization}
      text={text}
    />
  )
  await element.findByText('1.')
})

it('Displays the line prefixes', () => {
  text.lines.forEach((row) =>
    expect(element.container).toHaveTextContent(row.prefix)
  )
})

it('Displays the transliteration', () => {
  text.lines.forEach((row) =>
    expect(element.container).toHaveTextContent(
      row.content.map((token) => token.value).join(' ')
    )
  )
})

it('Clicking word shows form', async () => {
  clickNth(element, 'kur', 0)
  await element.findByLabelText('Lemma')
})

it('Clicking save calls fragmentService', async () => {
  await lemmatizeWord(element, 'kur', lemma)

  const expected = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [lemma], [])]]
  )
  await whenClicked(element, 'Save')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(expected)
})
