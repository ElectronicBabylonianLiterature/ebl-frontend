import React from 'react'
import { render, waitFor, screen, Matcher } from '@testing-library/react'
import Promise from 'bluebird'

import LemmatizationForm from './LemmatizationForm'
import Lemma from 'transliteration/domain/Lemma'
import { changeValueByLabel, clickNth } from 'test-support/utils'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

let searchWord: Word
let onChange: (selected: readonly Lemma[]) => void
let container: HTMLElement
let fragmentService: {
  searchLemma: jest.Mock<Promise<readonly Word[]>, [string]>
}
let token: LemmatizationToken

beforeEach(() => {
  searchWord = wordFactory.build({
    _id: 'waklu I',
    meaning: 'a very very long complicated meaning of a word',
  })
  onChange = jest.fn()
  fragmentService = {
    searchLemma: jest.fn(),
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([searchWord]))
})

describe('Single lemma', () => {
  let word: Word

  beforeEach(() => {
    word = wordFactory.build()
    token = new LemmatizationToken('kur', true, [new Lemma(word)])
    container = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        uniqueLemma={token.uniqueLemma}
        onChange={onChange}
        isMulti={false}
      />
    ).container
  })

  it('Complex is not checked', async () => {
    expect(screen.getByLabelText('Complex')).not.toBeChecked()
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemma')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([new Lemma(searchWord)])
    )
  })

  commonTests('Lemma')
})

describe('Complex lemma', () => {
  let words: readonly Word[]

  beforeEach(() => {
    words = wordFactory.buildList(2)
    token = new LemmatizationToken(
      'kur',
      true,
      words.map((word: Word) => new Lemma(word))
    )
    container = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        onChange={onChange}
        uniqueLemma={token.uniqueLemma}
        isMulti={true}
      />
    ).container
  })

  it('Complex is checked', () => {
    expect(screen.getByLabelText('Complex')).toBeChecked()
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemmata')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        ...(token.uniqueLemma ?? []),
        new Lemma(searchWord),
      ])
    )
  })

  commonTests('Lemmata')
})

function commonTests(lemmaLabel: Matcher): void {
  it('Displays the label', () => {
    expect(screen.getByLabelText(lemmaLabel)).toBeInTheDocument()
  })

  it('Displays the word label', () => {
    expect(container).toHaveTextContent(
      token.uniqueLemma
        ?.map((lemma) => lemma.label.replace(/\*/g, ''))
        .join('') ?? ''
    )
  })
}

async function lemmatize(lemmaLabel: Matcher): Promise<void> {
  const searchLemma = new Lemma(searchWord)
  changeValueByLabel(screen, lemmaLabel, 'waklu')
  await screen.findByText(searchLemma.lemma)
  clickNth(screen, searchLemma.lemma, 0)
}
