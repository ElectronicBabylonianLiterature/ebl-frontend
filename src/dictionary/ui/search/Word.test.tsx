import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DictionaryWord from 'dictionary/domain/Word'
import Word from './Word'
import { wordFactory } from 'test-support/word-fixtures'

let word: DictionaryWord
let textContent: string | null

describe('word display', () => {
  function setup() {
    word = wordFactory.build()
    const { container } = render(
      <MemoryRouter>
        <Word value={word} />
      </MemoryRouter>,
    )
    textContent = container.textContent
  }

  it('lemma links to editor', () => {
    setup()
    expect(screen.getByText(word.lemma.join(' '))).toHaveAttribute(
      'href',
      `/dictionary/${word._id}`,
    )
  })

  it('renders lemma', () => {
    setup()
    expect(textContent).toContain(`${word.lemma.join(' ')} ${word.homonym}`)
  })

  it('renders forms', () => {
    setup()
    expect(textContent).toContain(
      `${word.forms[0].notes[0]} *${word.forms[0].lemma.join(' ')} ${
        word.forms[0].notes[1]
      }`,
    )
  })

  it('renders meaning', () => {
    setup()
    expect(textContent).toContain(word.meaning)
  })

  it('amplifiedMeanings', () => {
    setup()
    expect(textContent).toContain(
      `${word.amplifiedMeanings[0].key} ${word.amplifiedMeanings[0].meaning}`,
    )
  })

  it('entries', () => {
    setup()
    expect(textContent).toContain(
      `1. ${word.amplifiedMeanings[0].entries[0].meaning}`,
    )
  })

  it('derived', () => {
    setup()
    expect(textContent).toContain(
      `${word.derived[0][0].notes[0]} ${word.derived[0][0].lemma.join(' ')} ${
        word.derived[0][0].homonym
      } ${word.derived[0][0].notes[1]}`,
    )
  })

  it('derivedFrom', () => {
    setup()
    expect(textContent).toContain(
      `${word.derivedFrom.lemma.join(' ')} ${word.derivedFrom.homonym}`,
    )
  })
})
