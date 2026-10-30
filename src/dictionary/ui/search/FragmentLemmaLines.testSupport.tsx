import React from 'react'
import { render } from '@testing-library/react'
import { dictionaryWord } from 'test-support/word-info-fixtures'
import FragmentLemmaLines from 'dictionary/ui/search/FragmentLemmaLines'
import { fragment, lines } from 'test-support/test-fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, castDraft, Draft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import { atfTokenKur } from 'test-support/test-tokens'
import { SUMMARY_LEMMA_ID } from 'test-support/fragment-query-summary'
import { lineNumberFactory } from 'test-support/linenumber-factory'

export const word = { ...dictionaryWord, _id: SUMMARY_LEMMA_ID }

const lineDto: TextLineDto = {
  ...lines[0],
  content: [{ ...atfTokenKur, uniqueLemma: [word._id] }],
}
const text = new Text({ lines: [new TextLine(lineDto)] })

export const fragmentWithLemma = produce(fragment, (draft: Draft<Fragment>) => {
  draft.text = castDraft(text)
})

export const previewSubsetText = new Text({
  lines: [
    new TextLine(lineDto),
    new TextLine({
      ...lines[1],
      prefix: '2.',
      lineNumber: lineNumberFactory.build({ number: 2 }),
    }),
  ],
})

export const previewSubsetFragment = produce(
  fragment,
  (draft: Draft<Fragment>) => {
    draft.text = castDraft(previewSubsetText)
  },
)

export function renderFragmentLemmaLines(
  fragmentService: FragmentService,
  wordService: WordService,
): HTMLElement {
  return renderWithDictionary(
    <FragmentLemmaLines lemmaId={word._id} fragmentService={fragmentService} />,
    wordService,
  ).container
}

export function renderWithDictionary(
  component: React.ReactElement,
  wordService: WordService,
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        {component}
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}
