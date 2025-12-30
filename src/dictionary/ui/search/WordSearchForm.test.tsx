import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { changeValueByLabel, submitForm } from 'test-support/utils'
import WordSearchForm from 'dictionary/ui/search/WordSearchForm'
import { stringify } from 'query-string'

const query = {
  word: '',
  meaning: '',
  root: '',
  vowelClass: [],
  origin: ['CDA'],
}
const modifiedQuery = {
  word: 'lemma',
  meaning: 'some meaning',
  root: 'lmm',
  vowelClass: ['a/a'],
  origin: ['CDA'],
}

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const { container } = render(
    <Router history={history}>
      <WordSearchForm query={query} />
    </Router>
  )

  changeValueByLabel(screen, 'Word', 'lemma')
  changeValueByLabel(screen, 'Meaning', 'some meaning')
  changeValueByLabel(screen, 'Root', 'lmm')
  await userEvent.click(screen.getByRole('checkbox', { name: 'a/a' }))
  await submitForm(container)

  expect(history.push).toBeCalledWith(`?${stringify(modifiedQuery)}`)
})

it('Defaults to CDA when no origin provided', async () => {
  const history = createMemoryHistory()
  const { container } = render(
    <Router history={history}>
      <WordSearchForm
        query={{ word: '', meaning: '', root: '', vowelClass: [] }}
      />
    </Router>
  )

  expect(
    screen.getByRole('checkbox', { name: 'All sources' })
  ).not.toBeChecked()
  expect(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' })
  ).toBeChecked()

  await submitForm(container)
  expect(history.location.search).toBe('?origin=CDA')
})

it('Parses string inputs for vowelClass and origin into arrays', () => {
  render(
    <Router history={createMemoryHistory()}>
      <WordSearchForm
        query={{
          word: '',
          meaning: '',
          root: '',
          vowelClass: ['a/i'],
          origin: ['AFO_REGISTER'],
        }}
      />
    </Router>
  )

  expect(screen.getByRole('checkbox', { name: 'a/i' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'AfO Register' })).toBeChecked()
})

it('Allows selecting a source when All sources is on', async () => {
  render(
    <Router history={createMemoryHistory()}>
      <WordSearchForm
        query={{ word: '', meaning: '', root: '', vowelClass: [], origin: [] }}
      />
    </Router>
  )

  const allSwitch = screen.getByRole('checkbox', { name: 'All sources' })
  expect(allSwitch).toBeChecked()

  const afoSwitch = screen.getByRole('checkbox', { name: 'AfO Register' })
  await userEvent.click(afoSwitch)

  expect(allSwitch).not.toBeChecked()
  expect(afoSwitch).toBeChecked()
})

it('Toggles all sources off then back to CDA', async () => {
  render(
    <Router history={createMemoryHistory()}>
      <WordSearchForm
        query={{
          word: '',
          meaning: '',
          root: '',
          vowelClass: [],
          origin: ['CDA'],
        }}
      />
    </Router>
  )

  const allSwitch = screen.getByRole('checkbox', { name: 'All sources' })
  expect(allSwitch).not.toBeChecked()

  await userEvent.click(allSwitch)
  expect(allSwitch).toBeChecked()

  await userEvent.click(allSwitch)
  expect(allSwitch).not.toBeChecked()
  expect(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' })
  ).toBeChecked()
})

it('Submits multiple origins as repeated params', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  render(
    <Router history={history}>
      <WordSearchForm query={query} />
    </Router>
  )

  await userEvent.click(screen.getByRole('checkbox', { name: 'All sources' }))
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' })
  )
  await userEvent.click(
    screen.getByRole('checkbox', {
      name: 'Supplements to the Akkadian Dictionaries',
    })
  )

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))

  expect(history.push).toHaveBeenCalledWith(
    expect.stringMatching(/origin=CDA&origin=SAD/)
  )
})

it('Applies transliteration on word and root change', async () => {
  render(
    <Router history={createMemoryHistory()}>
      <WordSearchForm query={query} />
    </Router>
  )

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'sz' } })
  expect(wordInput).toHaveValue('š')

  const rootInput = screen.getByPlaceholderText('root')
  fireEvent.change(rootInput, { target: { value: 's,' } })
  expect(rootInput).toHaveValue('ṣ')
})
