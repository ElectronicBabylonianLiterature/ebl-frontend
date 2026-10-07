import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LemmaSelectionForm, {
  LemmaOption,
} from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

const searchLemma = jest.fn<Promise<readonly Word[]>, [string]>()
const onChange = jest.fn<void, [readonly LemmaOption[]]>()

function renderForm(query?: readonly LemmaOption[]): void {
  render(
    <LemmaSelectionForm
      query={query}
      onChange={onChange}
      wordService={{ searchLemma }}
    />,
  )
}

it('adds a searched lemma to an empty query', async () => {
  const word = wordFactory.build({ lemma: ['šarru'], homonym: 'I' })
  searchLemma.mockResolvedValue([word])
  renderForm()

  await userEvent.type(screen.getByLabelText('Select lemmata'), 'šar')
  await userEvent.click(await screen.findByText('šarru'))

  expect(searchLemma).toHaveBeenCalledWith('šar')
  expect(onChange).toHaveBeenCalledWith([
    expect.objectContaining({ value: word._id }),
  ])
})

it('removes a lemma from the query', async () => {
  const [kept, removed] = wordFactory
    .buildList(2)
    .map((word) => new LemmaOption(word))
  renderForm([removed, kept])

  const [removeButton] = screen.getAllByRole('button', { name: /^Remove/ })
  await userEvent.click(removeButton)

  expect(onChange).toHaveBeenCalledWith([kept])
})

it('turns a suggested lemma into a confirmed one', () => {
  const suggested = new LemmaOption(wordFactory.build(), true)

  const confirmed = suggested.unsetSuggestion()

  expect(confirmed.isSuggestion).toBe(false)
  expect(confirmed.value).toEqual(suggested.value)
})
