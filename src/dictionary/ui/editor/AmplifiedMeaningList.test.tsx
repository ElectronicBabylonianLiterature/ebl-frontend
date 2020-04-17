import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import { whenClicked, whenChangedByValue } from 'test-helpers/utils'

const label = 'Amplified Meanings'

let value
let element
let onChange
let noun

beforeEach(() => {
  onChange = jest.fn()
})

describe('Entries', () => {
  beforeEach(async () => {
    noun = 'entry'
    value = await factory.buildMany('entry', 2)
    element = renderAmplifiedMeaningList(true)
  })

  it('New entry has entry fields', async () => {
    await whenClicked(element, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...value, { meaning: '', vowels: [] }])
  })

  commonTests()
})

describe('Conjugations/Functions', () => {
  beforeEach(async () => {
    noun = 'amplified meaning'
    value = await factory.buildMany('amplifiedMeaning', 2)
    element = renderAmplifiedMeaningList(false)
  })

  it('Displays all keys', () => {
    for (const item of value) {
      expect(element.getAllByDisplayValue(item.key)[0]).toBeVisible()
    }
  })

  it('Displays all entries', () => {
    _(value)
      .flatMap('entries')
      .map('meaning')
      .forEach((entry) =>
        expect(element.getByDisplayValue(entry)).toBeVisible()
      )
  })

  it('New entry has top level fields', async () => {
    await whenClicked(element, `Add ${noun}`)
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
      expect(element.getByDisplayValue(item.meaning)).toBeVisible()
    }
  })

  it('Displays label', () => {
    expect(element.getByText(label)).toBeVisible()
  })

  it('Calls onChange with updated value on change', () => {
    whenChangedByValue(element, value[0].meaning, 'new')
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
  return render(
    <AmplifiedMeaningList value={value} onChange={onChange} entry={entry}>
      {label}
    </AmplifiedMeaningList>
  )
}
