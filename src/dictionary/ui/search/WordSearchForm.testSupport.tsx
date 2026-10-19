import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import WordSearchForm from 'dictionary/ui/search/WordSearchForm'
import { WordQuery } from 'dictionary/application/WordService'

export const emptyQuery: WordQuery = {
  word: '',
  meaning: '',
  root: '',
  vowelClass: [],
  origin: ['CDA'],
}

export function renderWordSearchForm(
  query: WordQuery = emptyQuery,
): RenderResult {
  return render(
    <MemoryRouter>
      <WordSearchForm query={query} />
    </MemoryRouter>,
  )
}
