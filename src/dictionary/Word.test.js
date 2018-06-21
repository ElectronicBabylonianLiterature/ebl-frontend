import React from 'react'
import {render, cleanup} from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Word from './Word'

const word = {
  _id: 'object-id',
  lemma: ['part1', 'part2'],
  homonym: 'I',
  attested: true,
  forms: [{
    lemma: ['form'],
    homonym: 'II',
    attested: false
  }],
  meaning: 'meaning',
  amplifiedMeanings: {
    G: {
      meaning: '*amplified*',
      vowels: [],
      entries: [{
        meaning: 'entry',
        vowels: []
      }]
    }
  },
  derived: [[{
    lemma: ['derived'],
    homonym: 'IV',
    notes: ['note1', 'note2']
  }]],
  derivedFrom: {
    lemma: ['derivedFrom'],
    homonym: 'I'
  },
  source: '**source**'
}

const brokenWord = {
  lemma: ['lemma'],
  homonym: 'I',
  forms: ['broken-form'],
  meaning: 'meaning',
  amplifiedMeanings: {},
  derived: [['broken-derived']],
  derivedFrom: null,
  source: '**source**'
}

let textContent
let element

afterEach(cleanup)

describe('word display', () => {
  beforeEach(() => {
    element = render(<MemoryRouter><Word value={word} /></MemoryRouter>)
    textContent = element.container.textContent
  })

  it('lemma links to editor', () => {
    expect(element.getByText('part1 part2').href).toEqual('http://localhost/dictionary/object-id')
  })

  it('renders lemma', () => {
    expect(textContent).toContain('part1 part2 I')
  })

  it('renders forms', () => {
    expect(textContent).toContain('*form II')
  })

  it('renders meaning', () => {
    expect(textContent).toContain('meaning')
  })

  it('amplifiedMeanings', () => {
    expect(textContent).toContain('G amplified')
  })

  it('entries', () => {
    expect(textContent).toContain('1. entry')
  })

  it('derived', () => {
    expect(textContent).toContain('note1 derived IV note2')
  })

  it('derivedFrom', () => {
    expect(textContent).toContain('derivedFrom I')
  })
})

describe('broken word display', () => {
  beforeEach(() => {
    textContent = render(<MemoryRouter><Word value={brokenWord} /></MemoryRouter>).container.textContent
  })

  it('form', () => {
    expect(textContent).toContain('broken-form')
  })

  it('derived', () => {
    expect(textContent).toContain('broken-derived')
  })
})
