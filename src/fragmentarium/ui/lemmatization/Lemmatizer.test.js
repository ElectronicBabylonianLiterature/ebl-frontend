import React from 'react'
import { render, waitForElement, wait } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { whenClicked, clickNth, changeValueByLabel } from 'test-helpers/utils'
import Lemma from 'fragmentarium/domain/Lemma'
import Lemmatizer from './Lemmatizer'
import Lemmatization, { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'

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
    createLemmatization: jest.fn()
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [oldWord._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  fragmentService.createLemmatization.mockImplementation(text =>
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
      number="K.1"
      text={text}
    />
  )
  await waitForElement(() => element.getByText('1.'))
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

it('Clicking word shows form', async () => {
  clickNth(element, 'kur', 0)
  await waitForElement(() => element.getByLabelText('Lemma'))
})

it('Clicking save calls fragmentService', async () => {
  await lemmatizeWord()

  const expected = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [lemma], [])]]
  )
  await whenClicked(element, 'Save')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(expected)
})

async function lemmatizeWord() {
  await waitForElement(() => element.getByText('kur'))
  clickNth(element, 'kur', 0)
  await waitForElement(() => element.getByLabelText('Lemma'))
  changeValueByLabel(element, 'Lemma', 'a')
  await waitForElement(() => element.getByText(lemma.label))
  clickNth(element, lemma.label, 0)
  await wait()
}
