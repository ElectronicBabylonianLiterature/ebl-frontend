import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import LemmatizationForm from './LemmatizationForm'
import { changeValueByLabel } from 'testHelpers'

let word
let onChange
let element
let fragmentService
let token

beforeEach(async () => {
  word = await factory.build('word', {
    '_id': 'waklu I',
    'meaning': 'a very very long complicated meaning of a word'
  })
  onChange = jest.fn()
  fragmentService = {
    searchLemma: jest.fn()
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
})

describe('Single lemma', () => {
  beforeEach(async () => {
    token = {
      'type': 'Word',
      'value': 'kur',
      'uniqueLemma': ['aklu I'],
      'language': 'AKKADIAN',
      'normalized': false,
      'lemmatizable': true
    }
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />)
  })

  it('Multiple is not checked', async () => {
    expect(element.getByLabelText('Multiple')).not.toHaveAttribute('checked')
  })

  commonTests('Lemma')
})

describe('Multiple lemmas', () => {
  beforeEach(async () => {
    token = {
      'type': 'Word',
      'value': 'kur',
      'uniqueLemma': ['aklu I', 'aklu II'],
      'language': 'AKKADIAN',
      'normalized': false,
      'lemmatizable': true
    }
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />)
  })

  it('Multiple is checked', async () => {
    expect(element.getByLabelText('Multiple')).toHaveAttribute('checked')
  })

  commonTests('Lemmata')
})

function commonTests (lemmaLabel) {
  it('Displays the label', () => {
    expect(element.getByLabelText(lemmaLabel)).toBeInTheDocument()
  })

  it('Displays the lemma', () => {
    expect(element.container).toHaveTextContent(token.uniqueLemma.join(''))
  })

  it('Displays truncated meaning in options', async () => {
    await changeValueByLabel(element, lemmaLabel, 'waklu')
    await waitForElement(() => element.getByText('waklu I, a very very long complicated…'))
  })
}
