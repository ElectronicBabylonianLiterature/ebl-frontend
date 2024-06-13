import React from 'react'
import PosInput from './PosInput'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'

import { whenChangedByValue, whenChangedByLabel } from 'test-support/utils'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

let value: Word
let onChange

const positionsOfSpeech = {
  AJ: 'adjective',
  AV: 'adverb',
  N: 'noun',
  NU: 'number',
  V: 'verb',
  DP: 'demonstrative pronoun',
  IP: 'independent/anaphoric pronoun',
  PP: 'possessive pronoun',
  QP: 'interrogative pronoun',
  RP: 'reflexive/reciprocal pronoun',
  XP: 'indefinite pronoun',
  REL: 'relative pronoun',
  DET: 'determinative pronoun',
  CNJ: 'conjunction',
  J: 'interjection',
  MOD: 'modal, negative, or conditional particle',
  PRP: 'preposition',
  SBJ: 'subjunction',
}

beforeEach(() => {
  onChange = jest.fn()
})

describe('Verb', () => {
  const roots = ['rrr', 'ttt']

  beforeEach(async () => {
    value = wordFactory.verb(roots).build()
    renderPosInput()
  })

  it('Displays all roots', () => {
    roots.forEach((root) =>
      expect(screen.getByDisplayValue(root)).toBeVisible()
    )
  })

  it('Calls onChange with updated value on root change', () => {
    whenChangedByValue(screen, roots[0], 'rtr')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        roots: [newValue, ..._.tail(value.roots)],
      }))
  })

  commonTests()
})

describe('Not verb', () => {
  beforeEach(() => {
    value = wordFactory.build()
    renderPosInput()
  })

  commonTests()
})

function commonTests() {
  it('Word POS are selected', () => {
    for (const pos of value.pos) {
      expect(
        (screen.getByText(positionsOfSpeech[pos]) as HTMLOptionElement).selected
      ).toBe(true)
    }
  })

  it('Other POS are not selected', () => {
    for (const pos of _(positionsOfSpeech)
      .toPairs()
      .reject(([pos, label]) => value.pos.includes(pos))
      .map(([pos, label]) => label)
      .value()) {
      expect((screen.getByText(pos) as HTMLOptionElement).selected).toBe(false)
    }
  })

  it('Calls onChange with updated value on pos change', () => {
    whenChangedByLabel(screen, 'Position of speech', 'AJ')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        pos: [newValue],
      }))
  })
}

function renderPosInput() {
  render(<PosInput value={value} onChange={onChange} />)
}
