import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import Word from './Word'

let word
let textContent: string | null

describe('word display', () => {
  beforeEach(async () => {
    word = await factory.build('word')
    const { container } = render(
      <MemoryRouter>
        <Word value={word} />
      </MemoryRouter>
    )
    textContent = container.textContent
  })

  it('lemma links to editor', () => {
    expect(screen.getByText(word.lemma.join(' '))).toHaveAttribute(
      'href',
      `/dictionary/${word._id}`
    )
  })

  it('renders lemma', () => {
    expect(textContent).toContain(`${word.lemma.join(' ')} ${word.homonym}`)
  })

  it('renders forms', () => {
    expect(textContent).toContain(
      `${word.forms[0].notes[0]} *${word.forms[0].lemma.join(' ')} ${
        word.forms[0].notes[1]
      }`
    )
  })

  it('renders meaning', () => {
    expect(textContent).toContain(word.meaning)
  })

  it('amplifiedMeanings', () => {
    expect(textContent).toContain(
      `${word.amplifiedMeanings[0].key} ${word.amplifiedMeanings[0].meaning}`
    )
  })

  it('entries', () => {
    expect(textContent).toContain(
      `1. ${word.amplifiedMeanings[0].entries[0].meaning}`
    )
  })

  it('derived', () => {
    expect(textContent).toContain(
      `${word.derived[0][0].notes[0]} ${word.derived[0][0].lemma.join(' ')} ${
        word.derived[0][0].homonym
      } ${word.derived[0][0].notes[1]}`
    )
  })

  it('derivedFrom', () => {
    expect(textContent).toContain(
      `${word.derivedFrom.lemma.join(' ')} ${word.derivedFrom.homonym}`
    )
  })
})

describe('broken word display', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      forms: ['broken-form'],
      derived: [['broken-derived']],
    })
    textContent = render(
      <MemoryRouter>
        <Word value={word} />
      </MemoryRouter>
    ).container.textContent
  })

  it('form', () => {
    expect(textContent).toContain('broken-form')
  })

  it('derived', () => {
    expect(textContent).toContain('broken-derived')
  })
})
