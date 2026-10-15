import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import TransliterationLines, {
  TranslationStyle,
} from 'transliteration/ui/TransliterationLines'
import { Text } from 'transliteration/domain/text'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import {
  arabicTranslationLine,
  englishTranslationLine,
} from 'test-support/lines/translation-lines'
import { comment } from 'test-support/lines/control'
import empty from 'test-support/lines/empty'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>

const text = new Text({
  lines: [
    lemmatized[0],
    englishTranslationLine,
    arabicTranslationLine,
    comment,
    empty,
  ],
})

function renderLines(
  translationStyle: TranslationStyle,
  language: string | null,
): void {
  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={new MockWordService()}>
        <TransliterationLines
          text={text}
          translationStyle={translationStyle}
          language={language}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

const cases: [TranslationStyle, string | null, number, boolean, boolean][] = [
  ['inline', 'en', 4, true, false],
  ['inline', null, 5, true, true],
  ['standoff', 'en', 3, true, false],
  ['standoff', null, 3, false, false],
]

test.each(cases)(
  '%s translations for language %s',
  (translationStyle, language, rows, english, arabic) => {
    renderLines(translationStyle, language)

    expect(screen.getAllByRole('row')).toHaveLength(rows)
    expect(screen.queryAllByText('English translation')).toHaveLength(
      english ? 1 : 0,
    )
    expect(screen.queryAllByText('Arabic translation')).toHaveLength(
      arabic ? 1 : 0,
    )
  },
)

test('standoff translations are shown next to their text line', () => {
  renderLines('standoff', 'en')

  expect(screen.getByTestId('translation-for-line-0')).toHaveTextContent(
    'English translation',
  )
})
