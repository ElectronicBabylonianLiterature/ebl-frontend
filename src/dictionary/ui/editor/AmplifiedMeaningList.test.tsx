import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import { render, screen } from '@testing-library/react'

import { whenClicked, whenChangedByValue } from 'test-support/utils'
import {
  amplifiedMeaningFactory,
  entryFactory,
} from 'test-support/word-fixtures'

const label = 'Amplified Meanings'

let value
let onChange
let noun

beforeEach(() => {
  onChange = jest.fn()
})

describe('Entries', () => {
  beforeEach(async () => {
    noun = 'entry'
    value = entryFactory.buildList(2)
    renderAmplifiedMeaningList(true)
  })

  it('New entry has entry fields', async () => {
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...value, { meaning: '', vowels: [] }])
  })

  commonTests()
})

describe('Conjugations/Functions', () => {
  beforeEach(async () => {
    noun = 'amplified meaning'
    value = amplifiedMeaningFactory.buildList(2)
    renderAmplifiedMeaningList(false)
  })

  it('Displays all keys', () => {
    for (const item of value) {
      expect(screen.getAllByDisplayValue(item.key)[0]).toBeVisible()
    }
  })

  it('Displays all entries', () => {
    _(value)
      .flatMap('entries')
      .map('meaning')
      .forEach((entry) => expect(screen.getByDisplayValue(entry)).toBeVisible())
  })

  it('New entry has top level fields', async () => {
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([
        ...value,
        { key: '', meaning: '', vowels: [], entries: [] },
      ])
  })

  commonTests()
})

function commonTests() {
  it('Displays all amplified meanings', () => {
    for (const item of value) {
      expect(screen.getByDisplayValue(item.meaning)).toBeVisible()
    }
  })

  it('Displays label', () => {
    expect(screen.getByText(label)).toBeVisible()
  })

  it('Calls onChange with updated value on change', () => {
    whenChangedByValue(screen, value[0].meaning, 'new')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => [
        {
          ...value[0],
          meaning: newValue,
        },
        ..._.tail(value),
      ])
  })
}

function renderAmplifiedMeaningList(entry) {
  render(
    <AmplifiedMeaningList value={value} onChange={onChange} entry={entry}>
      {label}
    </AmplifiedMeaningList>
  )
}
