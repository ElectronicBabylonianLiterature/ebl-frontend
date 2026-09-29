import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import WordSearchForm from 'dictionary/ui/search/WordSearchForm'
import { WordQuery } from 'dictionary/application/WordService'

function TestMemoryRouter({ children }: React.PropsWithChildren): JSX.Element {
  return (
    <MemoryRouter
      future={Object.fromEntries([
        ['v7_startTransition', true],
        ['v7_relativeSplatPath', true],
      ])}
    >
      {children}
    </MemoryRouter>
  )
}

export const query = {
  word: '',
  meaning: '',
  root: '',
  vowelClass: [],
  origin: ['CDA'],
}

export const modifiedQuery = {
  word: 'lemma',
  meaning: 'some meaning',
  root: 'lmm',
  vowelClass: ['a/a'],
  origin: ['CDA'],
}

export function renderWordSearchForm(wordQuery: WordQuery): RenderResult {
  return render(
    <TestMemoryRouter>
      <WordSearchForm query={wordQuery} />
    </TestMemoryRouter>,
  )
}
