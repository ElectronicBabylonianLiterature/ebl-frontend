import React from 'react'
import { render, wait, RenderResult, Matcher } from '@testing-library/react'
import Promise from 'bluebird'
import { factory } from 'factory-girl'

import LemmatizationForm from './LemmatizationForm'
import Lemma from 'fragmentarium/domain/Lemma'
import { changeValueByLabel, clickNth } from 'test-helpers/utils'
import { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'
import Word from 'dictionary/domain/Word'

let searchWord: Word
let onChange: (selected: readonly Lemma[]) => void
let element: RenderResult
let fragmentService: {
  searchLemma: jest.Mock<Promise<readonly Word[]>, [string]>
}
let token: LemmatizationToken

beforeEach(async () => {
  searchWord = await factory.build('word', {
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

  beforeEach(async () => {
    word = await factory.build('word')
    token = new LemmatizationToken('kur', true, [new Lemma(word)])
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />
    )
  })

  it('Complex is not checked', async () => {
    expect(element.getByLabelText('Complex')).not.toHaveAttribute('checked')
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemma')
    await wait(() =>
      expect(onChange).toHaveBeenCalledWith([new Lemma(searchWord)])
    )
  })

  commonTests('Lemma')
})

describe('Complex lemma', () => {
  let words: readonly Word[]

  beforeEach(async () => {
    words = await factory.buildMany('word', 2)
    token = new LemmatizationToken(
      'kur',
      true,
      words.map((word: Word) => new Lemma(word))
    )
    element = render(
      <LemmatizationForm
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />
    )
  })

  it('Complex is checked', async () => {
    expect(element.getByLabelText('Complex')).toHaveAttribute('checked')
  })

  it('Calls onChange when selecting word', async () => {
    await lemmatize('Lemmata')
    await wait(() =>
      expect(onChange).toHaveBeenCalledWith([
        ...token.uniqueLemma,
        new Lemma(searchWord),
      ])
    )
  })

  commonTests('Lemmata')
})

function commonTests(lemmaLabel: Matcher): void {
  it('Displays the label', () => {
    expect(element.getByLabelText(lemmaLabel)).toBeInTheDocument()
  })

  it('Displays the word label', () => {
    expect(element.container).toHaveTextContent(
      token.uniqueLemma
        ?.map((lemma) => lemma.label.replace(/\*/g, ''))
        .join('') ?? ''
    )
  })
}

async function lemmatize(lemmaLabel: Matcher): Promise<void> {
  const searchLemma = new Lemma(searchWord)
  changeValueByLabel(element, lemmaLabel, 'waklu')
  await element.findByText(searchLemma.lemma)
  clickNth(element, searchLemma.lemma, 0)
}
