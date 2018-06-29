import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import {whenClicked, whenChanged} from '../../testHelpers'

afterEach(cleanup)

const label = 'Amplified Meanings'

let value
let element
let onChange
let noun

afterEach(cleanup)

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
      .toHaveBeenCalledWith([
        ...value,
        {meaning: '', vowels: []}
      ])
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
    for (let item of value) {
      expect(element.getByValue(item.key)).toBeVisible()
    }
  })

  it('Displays all entries', () => {
    _(value).flatMap('entries').map('meaning').forEach(entry =>
      expect(element.getByValue(entry)).toBeVisible()
    )
  })

  it('New entry has top level fields', async () => {
    await whenClicked(element, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([
        ...value,
        {key: '', meaning: '', vowels: [], entries: []}
      ])
  })

  commonTests()
})

function commonTests () {
  it('Displays all amplified meanings', () => {
    for (let item of value) {
      expect(element.getByValue(item.meaning)).toBeVisible()
    }
  })

  it('Displays label', () => {
    expect(element.getByText(label)).toBeVisible()
  })

  it('Removes item when Delete is clicked', async () => {
    const indexToDelete = 1
    await whenClicked(element, `Delete ${noun}`, indexToDelete)
      .expect(onChange)
      .toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
  })

  it('Calls onChange with updated value on change', async () => {
    await whenChanged(element, value[0].meaning, 'new')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => [
        {
          ...value[0],
          meaning: newValue
        },
        ..._.tail(value)
      ])
  })
}

function renderAmplifiedMeaningList (entry) {
  return render(
    <AmplifiedMeaningList id='amplifiedMeanings' value={value} onChange={onChange} entry={entry}>
      {label}
    </AmplifiedMeaningList>)
}
