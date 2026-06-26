import React from 'react'
import PosInput from './PosInput'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'

import { whenChangedByValue, whenChangedByLabel } from 'test-support/utils'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'
import { NAMED_ENTITY_TAGS } from 'dictionary/domain/namedEntityTags'

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

describe('Named entity tags', () => {
  const namedEntityTags = ['DN', 'GN']

  function setup(): void {
    value = wordFactory.namedEntity(namedEntityTags).build()
    renderPosInput()
  }

  it('Selected named entity tags are selected', () => {
    setup()
    for (const tag of namedEntityTags) {
      expect(
        (screen.getByText(NAMED_ENTITY_TAGS[tag]) as HTMLOptionElement)
          .selected,
      ).toBe(true)
    }
  })

  it('Other named entity tags are not selected', () => {
    setup()
    for (const [tag, label] of Object.entries(NAMED_ENTITY_TAGS)) {
      if (!namedEntityTags.includes(tag)) {
        expect((screen.getByText(label) as HTMLOptionElement).selected).toBe(
          false,
        )
      }
    }
  })

  it('Calls onChange with updated value on named entity tag change', () => {
    setup()
    whenChangedByLabel(screen, 'Named entity (proper noun) type', 'PN')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        namedEntityTags: [newValue],
      }))
  })
})

function renderPosInput() {
  render(<PosInput value={value} onChange={onChange} />)
}
