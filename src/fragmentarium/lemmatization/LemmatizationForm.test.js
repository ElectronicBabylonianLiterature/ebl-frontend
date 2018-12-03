import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'

import LemmatizationForm from './LemmatizationForm'
import { changeValueByLabel } from 'testHelpers'

let onChange
let element
let fragmentService
let token

beforeEach(async () => {
  onChange = jest.fn()
  fragmentService = {
    searchLemma: jest.fn()
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([{
    '_id': 'waklu I',
    'meaning': 'a very very long complicated meaning of a word'
  }]))
})

describe('Single lemma', () => {
  beforeEach(async () => {
    token = {
      'value': 'kur',
      'uniqueLemma': ['aklu I']
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

  it('Multiple is not disabled', async () => {
    expect(element.getByLabelText('Multiple')).not.toHaveAttribute('disabled')
  })

  commonTests('Lemma')
})

describe('Multiple lemmas', () => {
  beforeEach(async () => {
    token = {
      'value': 'kur',
      'uniqueLemma': ['aklu I', 'aklu II']
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

  it('Multiple is disabled', async () => {
    expect(element.getByLabelText('Multiple')).toHaveAttribute('disabled')
  })

  commonTests('Lemmata')
})

function commonTests (lemmaLabel) {
  it('Displays the label', () => {
    expect(element.container).toHaveTextContent(lemmaLabel)
  })

  it('Displays the value', () => {
    expect(element.container).toHaveTextContent(token.value)
  })

  it('Displays the lemma', () => {
    expect(element.container).toHaveTextContent(token.uniqueLemma.join(''))
  })

  it('Displays truncated meaning in options', async () => {
    await changeValueByLabel(element, lemmaLabel, 'waklu')
    expect(element.container).toHaveTextContent('waklu I, a very very long complicated…')
  })
}
