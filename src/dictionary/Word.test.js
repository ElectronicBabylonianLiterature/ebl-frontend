import React from 'react'
import {render} from 'react-testing-library'
import Word from './Word'

const word = {
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

describe('word display', () => {
  beforeEach(() => {
    textContent = render(<Word value={word} />).container.textContent
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
    textContent = render(<Word value={brokenWord} />).container.textContent
  })

  it('form', () => {
    expect(textContent).toContain('broken-form')
  })

  it('derived', () => {
    expect(textContent).toContain('broken-derived')
  })
})
