import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { clickNth } from 'test-helpers/utils'
import Word from './Word'
import Lemma from './Lemma'

let element
let token
let onClick
let lemmas

beforeEach(async () => {
  onClick = jest.fn()
  lemmas = (await factory.buildMany('word', 2)).map(word => new Lemma(word))
})

describe.each([
  [false, false, [], ['Word--with-lemma', 'Word--suggestion']],
  [true, false, ['Word--with-lemma'], ['Word--suggestion']],
  [true, true, ['Word--with-lemma', 'Word--suggestion'], []]
])('%#', (hasLemma, suggested, expectedClasses, notExpectedClasses) => {
  beforeEach(async () => {
    token = {
      type: 'Word',
      value: 'DIŠ',
      uniqueLemma: hasLemma ? lemmas : [],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      suggested: suggested
    }
    element = render(<Word token={token} onClick={onClick} />)
  })

  it('Displays the value', () => {
    expect(element.container).toHaveTextContent(token.value)
  })

  if (hasLemma) {
    it('Displays the lemma', () => {
      expect(element.container).toHaveTextContent(
        lemmas.map(lemma => `${lemma.lemma}${lemma.homonym}`).join(', ')
      )
    })
  }

  it('Clicking calls on click', async () => {
    await clickNth(element, token.value)
    expect(onClick).toHaveBeenCalled()
  })

  test.each(expectedClasses)('Has class %s', expectedClass => {
    expect(element.getByText(token.value)).toHaveClass(expectedClass)
  })

  test.each(notExpectedClasses)('Does not have class %s', notExpectedClass => {
    expect(element.getByText(token.value)).not.toHaveClass(notExpectedClass)
  })
})

describe('Not-lemmatizable word', () => {
  beforeEach(async () => {
    token = {
      value: 'DIŠ',
      uniqueLemma: [],
      language: 'AKKADIAN',
      normalized: true,
      lemmatizable: false
    }
    element = render(<Word token={token} onClick={onClick} />)
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
