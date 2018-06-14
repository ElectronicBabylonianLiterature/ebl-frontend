import React from 'react'
import {render} from 'react-testing-library'
import Word from './Word'

const word = {
  lemma: ['part1', 'part2'],
  homonym: 'I',
  forms: [{
    lemma: ['form'],
    homonym: 'II',
    attested: false
  }],
  meaning: 'meaning',
  amplifiedMeanings: {
    G: {meaning: '*amplified*'}
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

let textContent

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

it('derived', () => {
  expect(textContent).toContain('note1 derived IV note2')
})

it('derivedFrom', () => {
  expect(textContent).toContain('derivedFrom I')
})
