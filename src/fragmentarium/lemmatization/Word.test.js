import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { clickNth } from '../../testHelpers'
import Word from './Word'
import Lemma from './Lemma'

let element
let token
let onClick

beforeEach(() => {
  onClick = jest.fn()
})

describe('Lemmatizable word', () => {
  beforeEach(async () => {
    token = {
      'type': 'Word',
      'value': 'DIŠ',
      'uniqueLemma': [],
      'language': 'AKKADIAN',
      'normalized': false,
      'lemmatizable': true
    }
    element = render(
      <Word
        token={token}
        onClick={onClick}
      />)
  })

  it('Displays the value', () => {
    expect(element.container).toHaveTextContent(token.value)
  })

  it('Clicking calls on click', async () => {
    await clickNth(element, token.value)
    expect(onClick).toHaveBeenCalled()
  })

  it('Does not have withLemma class', () => {
    expect(element.getByText(token.value)).not.toHaveClass('Word--with-lemma')
  })
})

describe('Lemmatizable word with lemma', () => {
  let lemmas

  beforeEach(async () => {
    lemmas = (await factory.buildMany('word', 2)).map(word => new Lemma(word))
    token = {
      'type': 'Word',
      'value': 'DIŠ',
      'uniqueLemma': lemmas,
      'language': 'AKKADIAN',
      'normalized': false,
      'lemmatizable': true
    }
    element = render(
      <Word
        token={token}
        onClick={onClick}
      />)
  })

  it('Displays the value', () => {
    expect(element.container).toHaveTextContent(token.value)
  })

  it('Displays the lemma', () => {
    expect(element.container).toHaveTextContent(lemmas.map(lemma => lemma.uniqueLemma).join(', '))
  })

  it('Clicking calls on click', async () => {
    await clickNth(element, token.value)
    expect(onClick).toHaveBeenCalled()
  })

  it('Haves have withLemma class', () => {
    expect(element.getByText(token.value)).toHaveClass('Word--with-lemma')
  })
})

describe('Not-lemmatizable word', () => {
  beforeEach(async () => {
    token = {
      'value': 'DIŠ',
      'uniqueLemma': [],
      'language': 'AKKADIAN',
      'normalized': true,
      'lemmatizable': false
    }
    element = render(
      <Word
        token={token}
        onClick={onClick}
      />)
  })

  it('Displays the value', () => {
    expect(element.container).toHaveTextContent(token.value)
  })

  it('Clicking does not call on click', async () => {
    await clickNth(element, token.value)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('Does not have withLemma class', () => {
    expect(element.getByText(token.value)).not.toHaveClass('Word--with-lemma')
  })
})
