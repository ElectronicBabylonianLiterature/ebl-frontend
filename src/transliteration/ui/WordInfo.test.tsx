import React from 'react'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { render, screen } from '@testing-library/react'
import WordInfo from './WordInfo'
import Bluebird from 'bluebird'
import { Word } from 'transliteration/domain/token'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DictionaryWord from 'dictionary/domain/Word'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

const dictionaryWord = wordFactory.homonymNotI().build()
const word: Word = {
  enclosureType: [],
  cleanValue: '|KUR.KUR|',
  value: '|KUR.KUR|',
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: [dictionaryWord._id],
  erasure: 'NONE',
  alignment: null,
  variant: null,
  parts: [
    {
      enclosureType: [],
      cleanValue: '|KUR.KUR|',
      value: '|KUR.KUR|',
      type: 'CompoundGrapheme',
    },
  ],
  type: 'Word',
}

async function renderAndOpen(dictionaryWord: DictionaryWord) {
  wordServiceMock.find.mockReturnValueOnce(Bluebird.resolve(dictionaryWord))

  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordServiceMock}>
        <WordInfo word={word}>trigger</WordInfo>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )

  userEvent.click(screen.getByText('trigger'))
  await screen.findByText(dictionaryWord.lemma.join(' '))
}

test('homonym I is not shown', async () => {
  const homonymI = wordFactory.homonymI().build()
  await renderAndOpen(homonymI)
  expect(screen.queryByText(homonymI.homonym)).not.toBeInTheDocument()
})

test('other homonyms are shown', async () => {
  await renderAndOpen(dictionaryWord)
  expect(screen.getByText(dictionaryWord.homonym)).toBeVisible()
})

test('guide word', async () => {
  await renderAndOpen(dictionaryWord)
  expect(screen.getByText(`“${dictionaryWord.guideWord}”`)).toBeVisible()
})

test('dictionary link', async () => {
  await renderAndOpen(dictionaryWord)
  expect(
    screen.getByRole('link', { name: 'Open the word in the Dictionary.' })
  ).toHaveAttribute(
    'href',
    `/dictionary/${encodeURIComponent(dictionaryWord._id)}`
  )
})
