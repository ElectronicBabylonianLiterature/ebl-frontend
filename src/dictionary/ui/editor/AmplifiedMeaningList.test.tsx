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
  function setup(): void {
    noun = 'entry'
    value = entryFactory.buildList(2)
    renderAmplifiedMeaningList(true)
  }

  it('New entry has entry fields', async () => {
    setup()
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...value, { meaning: '', vowels: [] }])
  })

  commonTests(setup)
})

describe('Conjugations/Functions', () => {
  function setup(): void {
    noun = 'amplified meaning'
    value = amplifiedMeaningFactory.buildList(2)
    renderAmplifiedMeaningList(false)
  }

  it('Displays all keys', () => {
    setup()
    for (const item of value) {
      expect(screen.getAllByDisplayValue(item.key)[0]).toBeVisible()
    }
  })

  it('Displays all entries', () => {
    setup()
    _(value)
      .flatMap('entries')
      .map('meaning')
      .forEach((entry) => expect(screen.getByDisplayValue(entry)).toBeVisible())
  })

  it('New entry has top level fields', async () => {
    setup()
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([
        ...value,
        { key: '', meaning: '', vowels: [], entries: [] },
      ])
  })

  commonTests(setup)
})

function commonTests(setup: () => void) {
  it('Displays all amplified meanings', () => {
    setup()
    for (const item of value) {
      expect(screen.getByDisplayValue(item.meaning)).toBeVisible()
    }
  })

  it('Displays label', () => {
    setup()
    expect(screen.getByText(label)).toBeVisible()
  })

  it('Calls onChange with updated value on change', () => {
    setup()
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
    </AmplifiedMeaningList>,
  )
}
