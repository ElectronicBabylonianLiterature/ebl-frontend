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

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'test' } })

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

  expect(history.push).toHaveBeenCalled()
  const callArg = (history.push as jest.Mock).mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
  expect(callArg).toContain('origin=SAD')
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

it('Removes vowel when unchecked', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  render(
    <Router history={history}>
      <WordSearchForm query={query} />
    </Router>
  )

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'test' } })

  const vowelCheckbox = screen.getByRole('checkbox', { name: 'a/a' })
  await userEvent.click(vowelCheckbox)
  expect(vowelCheckbox).toBeChecked()

  await userEvent.click(vowelCheckbox)
  expect(vowelCheckbox).not.toBeChecked()

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))

  expect(history.push).toHaveBeenCalled()
  const callArg = (history.push as jest.Mock).mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
})

it('Removes origin when unchecked', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  render(
    <Router history={history}>
      <WordSearchForm
        query={{
          word: 'test',
          meaning: '',
          root: '',
          vowelClass: [],
          origin: ['CDA', 'AFO_REGISTER'],
        }}
      />
    </Router>
  )

  const afoCheckbox = screen.getByRole('checkbox', { name: 'AfO Register' })
  expect(afoCheckbox).toBeChecked()

  await userEvent.click(afoCheckbox)
  expect(afoCheckbox).not.toBeChecked()

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))
  expect(history.push).toHaveBeenCalled()
  const callArg = (history.push as jest.Mock).mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
  expect(callArg).not.toContain('AFO_REGISTER')
})

it('Allows changing meaning field without transliteration', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  render(
    <Router history={history}>
      <WordSearchForm query={query} />
    </Router>
  )

  const meaningInput = screen.getByPlaceholderText('meaning')
  fireEvent.change(meaningInput, { target: { value: 'to drink' } })
  expect(meaningInput).toHaveValue('to drink')

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))
  expect(history.push).toHaveBeenCalledWith(
    expect.stringMatching(/meaning=to%20drink/)
  )
})

it('Disables Query button when all fields are empty', () => {
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

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeDisabled()
})

it('Enables Query button when word field has content', () => {
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

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'test' } })

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})

it('Enables Query button when meaning field has content', () => {
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

  const meaningInput = screen.getByPlaceholderText('meaning')
  fireEvent.change(meaningInput, { target: { value: 'test meaning' } })

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})

it('Enables Query button when root field has content', () => {
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

  const rootInput = screen.getByPlaceholderText('root')
  fireEvent.change(rootInput, { target: { value: 'test' } })

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})

it('Enables Query button when vowel class is selected', () => {
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

  const vowelCheckbox = screen.getByRole('checkbox', { name: 'a/a' })
  userEvent.click(vowelCheckbox)

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})
