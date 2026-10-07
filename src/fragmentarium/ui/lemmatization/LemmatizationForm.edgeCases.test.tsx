import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import LemmatizationForm from 'fragmentarium/ui/lemmatization/LemmatizationForm'
import Lemma from 'transliteration/domain/Lemma'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

const onChange = jest.fn<void, [readonly Lemma[]]>()
const fragmentService = {
  searchLemma: jest.fn<Promise<readonly Word[]>, [string]>(),
}

function renderForm(token: LemmatizationToken): void {
  render(
    <LemmatizationForm
      fragmentService={fragmentService}
      token={token}
      onChange={onChange}
    />,
  )
}

function lemmaFor(lemma: string): Lemma {
  return new Lemma(wordFactory.build({ lemma: [lemma], homonym: 'I' }))
}

it('offers only the single-lemma suggestions for an unlemmatized token', () => {
  const [single, first, second] = ['single', 'first', 'second'].map(lemmaFor)
  renderForm(
    new LemmatizationToken('kur', true, null, [[single], [first, second]]),
  )

  expect(screen.getByText('single')).toBeVisible()
  expect(screen.queryByText('first')).not.toBeInTheDocument()
  expect(screen.queryByText('second')).not.toBeInTheDocument()
})

it('reports an empty lemmatization when the lemma is cleared', async () => {
  renderForm(new LemmatizationToken('kur', true, [lemmaFor('šarru')]))

  await selectEvent.clearFirst(screen.getByLabelText('Lemma'))

  expect(onChange).toHaveBeenCalledWith([])
})

it('switches to a complex lemmatization', async () => {
  renderForm(new LemmatizationToken('kur', true))

  await userEvent.click(screen.getByLabelText('Complex'))

  expect(screen.getByLabelText('Complex')).toBeChecked()
  expect(screen.getByLabelText('Lemmata')).toBeInTheDocument()
})
