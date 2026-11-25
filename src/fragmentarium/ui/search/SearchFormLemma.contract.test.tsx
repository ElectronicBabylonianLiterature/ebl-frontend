import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordService from 'dictionary/application/WordService'
import SearchFormLemma from 'fragmentarium/ui/search/SearchFormLemma'
import type { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { wordFactory } from 'test-support/word-fixtures'
import type { QueryType } from 'query/FragmentQuery'

jest.mock('fragmentarium/ui/lemmatization/LemmaSelectionForm', () => {
  const original = jest.requireActual(
    'fragmentarium/ui/lemmatization/LemmaSelectionForm',
  )
  return {
    ...original,
    __esModule: true,
    default: ({
      query,
      onChange,
    }: {
      query: readonly LemmaOption[]
      onChange: (query: readonly LemmaOption[]) => void
    }) => (
      <button type="button" onClick={() => onChange(query)}>
        {query.map((option) => option.value).join('+') || 'No lemmata'}
      </button>
    ),
  }
})

jest.mock('react-select', () => ({
  ...jest.requireActual('react-select'),
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: { value: QueryType }
    onChange: (value: { value: QueryType } | null) => void
  }) => (
    <>
      <output aria-label="Current lemma query type">{value.value}</output>
      <button type="button" onClick={() => onChange({ value: 'phrase' })}>
        Choose phrase
      </button>
      <button type="button" onClick={() => onChange(null)}>
        Clear query type
      </button>
    </>
  ),
}))

function service(findAll = jest.fn().mockResolvedValue([])): WordService {
  return { findAll } as unknown as WordService
}

it('keeps only resolved lemma ids and forwards the selected query', async () => {
  const word = wordFactory.build()
  const findAll = jest.fn().mockResolvedValue([word])
  const update = jest.fn()
  const onChange = jest.fn().mockReturnValue(update)
  render(
    <SearchFormLemma
      lemmas={`${word._id}+missing`}
      lemmaOperator="or"
      wordService={service(findAll)}
      onChange={onChange}
      onChangeLemmaOperator={jest.fn()}
    />,
  )
  await userEvent.click(await screen.findByRole('button', { name: word._id }))
  expect(findAll).toHaveBeenCalledWith([word._id, 'missing'])
  expect(onChange).toHaveBeenCalledWith('lemmas')
  expect(update).toHaveBeenCalledWith(word._id)
  expect(screen.getByLabelText('Current lemma query type')).toHaveTextContent(
    'or',
  )
})

it('uses line matching for absent or cleared query operators', async () => {
  const findAll = jest.fn()
  const updateOperator = jest.fn()
  const update = jest.fn()
  render(
    <SearchFormLemma
      lemmas={null}
      lemmaOperator={null}
      wordService={service(findAll)}
      onChange={() => update}
      onChangeLemmaOperator={updateOperator}
    />,
  )
  expect(
    await screen.findByRole('button', { name: 'No lemmata' }),
  ).toBeInTheDocument()
  expect(findAll).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Current lemma query type')).toHaveTextContent(
    'line',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Choose phrase' }))
  expect(updateOperator).toHaveBeenLastCalledWith('phrase')
  await userEvent.click(
    screen.getByRole('button', { name: 'Clear query type' }),
  )
  expect(updateOperator).toHaveBeenLastCalledWith('line')
})
