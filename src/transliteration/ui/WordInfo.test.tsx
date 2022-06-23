import React, { useState } from 'react'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { render, screen, within } from '@testing-library/react'
import WordInfo from './WordInfo'
import Bluebird from 'bluebird'
import { Word } from 'transliteration/domain/token'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DictionaryWord from 'dictionary/domain/Word'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import { dictionaryWord, word } from 'test-support/word-info-fixtures'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

const modifierClass = 'block__element--modifier'
const trigger = 'trigger'

function WrappedWordInfo({ word }: { word: Word }): JSX.Element {
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(word.uniqueLemma)
  )
  return (
    <MemoryRouter>
      <LineLemmasContext.Provider
        value={{
          lemmaMap: lemmaMap,
          lemmaSetter: lemmaSetter,
        }}
      >
        <DictionaryContext.Provider value={wordServiceMock}>
          <WordInfo word={word} tokenClasses={[modifierClass]}>
            {trigger}
          </WordInfo>
        </DictionaryContext.Provider>
      </LineLemmasContext.Provider>
    </MemoryRouter>
  )
}

async function renderAndOpen(dictionaryWord: DictionaryWord) {
  wordServiceMock.find.mockReturnValueOnce(Bluebird.resolve(dictionaryWord))

  render(<WrappedWordInfo word={word} />)

  userEvent.click(screen.getByRole('button', { name: 'trigger' }))
  return screen.findByRole('tooltip')
}

test('heading', async () => {
  const view = await renderAndOpen(dictionaryWord)
  expect(within(view).getByText(trigger)).toHaveClass(modifierClass)
})

test('lemma', async () => {
  const view = await renderAndOpen(dictionaryWord)
  expect(within(view).getByText(dictionaryWord.lemma.join(' '))).toBeVisible()
})

test('homonym', async () => {
  const view = await renderAndOpen(dictionaryWord)
  expect(within(view).getByText(dictionaryWord.homonym)).toBeVisible()
})

test('guide word', async () => {
  const view = await renderAndOpen(dictionaryWord)
  expect(within(view).getByText(`“${dictionaryWord.guideWord}”`)).toBeVisible()
})

test('dictionary link', async () => {
  const view = await renderAndOpen(dictionaryWord)
  const link = within(view).getByRole('link', {
    name: 'Open the word in the Dictionary.',
  })
  expect(link).toHaveAttribute(
    'href',
    `/dictionary/${encodeURIComponent(dictionaryWord._id)}`
  )
  expect(link).toHaveAttribute('target', '_blank')
})

test('no lemma', () => {
  const notLemmatized: Word = { ...word, uniqueLemma: [] }

  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordServiceMock}>
        <WordInfo word={notLemmatized} tokenClasses={[]}>
          {trigger}
        </WordInfo>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )

  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.getByText(trigger)).toBeVisible()
})

test('variant alignment indicator', async () => {
  render(<WrappedWordInfo word={{ ...word, hasVariantAlignment: true }} />)

  expect(screen.getByText('‡')).toBeVisible()
})

test('no variant alignment indicator', async () => {
  render(<WrappedWordInfo word={word} />)

  expect(screen.queryByText('‡')).not.toBeInTheDocument()
})
