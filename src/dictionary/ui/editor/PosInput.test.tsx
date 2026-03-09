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

  function setup(): void {
    value = wordFactory.verb(roots).build()
    renderPosInput()
  }

  it('Displays all roots', () => {
    setup()
    roots.forEach((root) =>
      expect(screen.getByDisplayValue(root)).toBeVisible(),
    )
  })

  it('Calls onChange with updated value on root change', () => {
    setup()
    whenChangedByValue(screen, roots[0], 'rtr')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        roots: [newValue, ..._.tail(value.roots)],
      }))
  })

  commonTests(setup)
})

describe('Not verb', () => {
  function setup(): void {
    value = wordFactory.build()
    renderPosInput()
  }

  commonTests(setup)
})

function commonTests(setup: () => void) {
  it('Word POS are selected', () => {
    setup()
    for (const pos of value.pos) {
      expect(
        (screen.getByText(positionsOfSpeech[pos]) as HTMLOptionElement)
          .selected,
      ).toBe(true)
    }
  })

  it('Other POS are not selected', () => {
    setup()
    for (const pos of _(positionsOfSpeech)
      .toPairs()
      .reject(([pos, label]) => value.pos.includes(pos))
      .map(([pos, label]) => label)
      .value()) {
      expect((screen.getByText(pos) as HTMLOptionElement).selected).toBe(false)
    }
  })

  it('Calls onChange with updated value on pos change', () => {
    setup()
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
