import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult, screen } from '@testing-library/react'
import GlossaryLine from 'transliteration/ui/GlossaryLine'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import Label from 'transliteration/domain/Label'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import {
  createDictionaryWord,
  createGlossaryToken,
} from 'test-support/glossary'
import { isWord } from 'transliteration/domain/type-guards'
import { GlossaryToken } from 'transliteration/domain/glossary'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>

const [word] = lemmatized[0].content.filter(isWord)
const label = new Label().setLineNumber(lemmatized[0].lineNumber)

function glossaryToken(wordId: string, value = word.value): GlossaryToken {
  return {
    ...createGlossaryToken(label, word, 0, createDictionaryWord(wordId)),
    value,
  }
}

function showLine(
  tokens: readonly GlossaryToken[],
  useRouterLinks: boolean | undefined,
  contextRouterLinks = true,
): RenderResult {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={new MockWordService()}>
        <RouterLinkModeContext.Provider value={contextRouterLinks}>
          <GlossaryLine tokens={tokens} useRouterLinks={useRouterLinks} />
        </RouterLinkModeContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

test.each([
  ['hepû I', ''],
  ['hepû II', ' II'],
])('links %s to the dictionary without the router', (wordId, homonym) => {
  showLine([glossaryToken(wordId)], false)

  expect(screen.getByRole('link', { name: `hepû${homonym}` })).toHaveAttribute(
    'href',
    `/dictionary/${wordId}`,
  )
})

test('uses the router link mode from context by default', () => {
  showLine([glossaryToken('hepû II')], undefined, false)

  expect(screen.getByRole('link', { name: 'hepû II' })).toHaveAttribute(
    'href',
    '/dictionary/hepû II',
  )
})

test('separates the different attested values of a lemma', () => {
  const view = showLine(
    [glossaryToken('hepû I'), glossaryToken('hepû I', 'other')],
    true,
  )

  expect(view.container).toHaveTextContent(/\), .*\)$/)
})
