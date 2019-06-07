import React from 'react'
import { render, waitForElement, wait } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import LemmatizationForm from './LemmatizationForm'
import Lemma from './Lemma'
import { changeValueByLabel, clickNth } from 'test-helpers/utils'

let searchWord
let onChange
let element
let fragmentService
let token

beforeEach(async () => {
  searchWord = await factory.build('word', {
    _id: 'waklu I',
    meaning: 'a very very long complicated meaning of a word'
  })
  onChange = jest.fn()
  fragmentService = {
    searchLemma: jest.fn()
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([searchWord]))
})

describe('Single lemma', () => {
  let word

  beforeEach(async () => {
    word = await factory.build('word')
    token = {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(word)],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />
    )
  })

  it('Complex is not checked', async () => {
    expect(element.getByLabelText('Complex')).not.toHaveAttribute('checked')
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemma')
    await wait(() =>
      expect(onChange).toHaveBeenCalledWith([new Lemma(searchWord)])
    )
  })

  commonTests('Lemma')
})

describe('Complex lemma', () => {
  let words

  beforeEach(async () => {
    words = await factory.buildMany('word', 2)
    token = {
      type: 'Word',
      value: 'kur',
      uniqueLemma: words.map(word => new Lemma(word)),
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />
    )
  })

  it('Complex is checked', async () => {
    expect(element.getByLabelText('Complex')).toHaveAttribute('checked')
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemmata')
    await wait(() =>
      expect(onChange).toHaveBeenCalledWith([
        ...token.uniqueLemma,
        new Lemma(searchWord)
      ])
    )
  })

  commonTests('Lemmata')
})

function commonTests(lemmaLabel) {
  it('Displays the label', () => {
    expect(element.getByLabelText(lemmaLabel)).toBeInTheDocument()
  })

  it('Displays the word label', () => {
    expect(element.container).toHaveTextContent(
      token.uniqueLemma.map(lemma => lemma.label).join('')
    )
  })
}

async function lemmatize(lemmaLabel) {
  const searchLemma = new Lemma(searchWord)
  changeValueByLabel(element, lemmaLabel, 'waklu')
  await waitForElement(() => element.getByText(searchLemma.label))
  clickNth(element, searchLemma.label, 0)
}
