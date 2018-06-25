import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

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
  beforeEach(() => {
    noun = 'entry'
    value = [
      {meaning: 'meaning1', vowels: []},
      {meaning: 'meaning2', vowels: []}
    ]
    element = renderAmplifiedMeaningList(true)
  })

  it('New entry has entry fields', async () => {
    const add = element.getByText(`Add ${noun}`)
    fireEvent.click(add)

    await wait()

    expect(onChange).toHaveBeenCalledWith([...value, {meaning: '', vowels: []}])
  })

  commonTests()
})

describe('Conjugations/Functions', () => {
  beforeEach(() => {
    noun = 'amplified meaning'
    value = [
      {key: 'G', meaning: 'meaning1', vowels: [], entries: [{meaning: 'entry1', vowels: []}]},
      {key: 'D', meaning: 'meaning2', vowels: [], entries: [{meaning: 'entry2', vowels: []}]}
    ]
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
    const add = element.getByText(`Add ${noun}`)
    fireEvent.click(add)

    await wait()

    expect(onChange).toHaveBeenCalledWith([...value, {key: '', meaning: '', vowels: [], entries: []}])
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
    const del = element.getAllByText(`Delete ${noun}`)[indexToDelete]
    fireEvent.click(del)

    await wait()

    expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
  })

  it('Calls onChange with updated value on change', async () => {
    const newValue = 'new'
    const input = element.getByValue(value[0].meaning)
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith([{...value[0], meaning: newValue}, ..._.tail(value)])
  })
}

function renderAmplifiedMeaningList (entry) {
  return render(
    <AmplifiedMeaningList id='amplifiedMeanings' value={value} onChange={onChange} entry={entry}>
      {label}
    </AmplifiedMeaningList>)
}
