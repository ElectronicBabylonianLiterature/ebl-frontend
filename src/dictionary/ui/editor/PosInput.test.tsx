import React from 'react'
import PosInput from './PosInput'
import { render } from '@testing-library/react'
import _ from 'lodash'
import { factory } from 'factory-girl'
import { whenChangedByValue, whenChangedByLabel } from 'test-helpers/utils'

let value
let element
let onChange

const positionsOfScpeech = {
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
  SBJ: 'subjunction'
}

beforeEach(() => {
  onChange = jest.fn()
})

describe('Verb', () => {
  beforeEach(async () => {
    value = await factory.build('verb')
    element = renderPosInput()
  })

  it('Displays all roots', () => {
    value.roots.forEach(root =>
      expect(element.getByDisplayValue(root)).toBeVisible()
    )
  })

  it('Calls onChange with updated value on root change', () => {
    whenChangedByValue(element, value.roots[0], 'rtr')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        roots: [newValue, ..._.tail(value.roots)]
      }))
  })

  commonTests()
})

describe('Not verb', () => {
  beforeEach(async () => {
    value = await factory.build('word')
    element = renderPosInput()
  })

  commonTests()
})

function commonTests() {
  it('Word POS are selected', () => {
    for (const pos of value.pos) {
      expect(element.getByText(positionsOfScpeech[pos]).selected).toBe(true)
    }
  })

  it('Other POS are not selected', () => {
    for (const pos of _(positionsOfScpeech)
      .omit(value.pos)
      .values()
      .value()) {
      expect(element.getByText(pos).selected).toBe(false)
    }
  })

  it('Calls onChange with updated value on pos change', () => {
    whenChangedByLabel(element, 'Position of speech', 'AJ')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        pos: [newValue]
      }))
  })
}

function renderPosInput() {
  return render(<PosInput value={value} onChange={onChange} />)
}
