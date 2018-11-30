import React from 'react'
import { render } from 'react-testing-library'
import { clickNth } from '../../testHelpers'
import Word from './Word'

let element
let token
let onClick

beforeEach(() => {
  onClick = jest.fn()
})

describe('Lemmatizable token', () => {
  beforeEach(async () => {
    token = {
      'value': 'DIŠ',
      'uniqueLemma': []
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

describe('Lemmatizable token with lemma', () => {
  beforeEach(async () => {
    token = {
      'value': 'DIŠ',
      'uniqueLemma': ['aklu']
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

  it('Haves have withLemma class', () => {
    expect(element.getByText(token.value)).toHaveClass('Word--with-lemma')
  })
})

describe('Not-lemmatizable token', () => {
  beforeEach(async () => {
    token = {
      'value': '1.',
      'uniqueLemma': []
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
    expect(onClick).not.toHaveBeenCalled()
  })

  it('Does not have withLemma class', () => {
    expect(element.getByText(token.value)).not.toHaveClass('Word--with-lemma')
  })
})
